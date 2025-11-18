const fs = require("fs");
const path = require("path");

// S6759 issues from JSON (excluding undefined lines)
const issuesData = JSON.parse(
  fs.readFileSync("sonar-code-smells-final.json", "utf-8"),
);
const s6759Issues = issuesData.issues.filter(
  (i) => i.rule === "typescript:S6759" && i.line !== undefined,
);
const files = [
  ...new Set(s6759Issues.map((i) => i.component.replace("talent:", ""))),
];

console.log(`Processing ${files.length} files for S6759 (Props readonly)...\n`);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

files.forEach((file, index) => {
  const filePath = path.join(process.cwd(), file);

  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${index + 1}/${files.length} ⚠️  SKIP: ${file} (not found)`);
      skipCount++;
      return;
    }

    let content = fs.readFileSync(filePath, "utf-8");
    const originalContent = content;
    let modified = false;

    // Pattern 1: interface XxxProps { ... }
    content = content.replace(
      /interface\s+(\w*Props[^{]*)\s*\{([^}]+)\}/g,
      (match, name, body) => {
        // Skip if already has readonly
        if (body.includes("readonly ")) {
          return match;
        }

        // Add readonly to each property
        const newBody = body.replace(
          /^(\s*)(\/\*\*[\s\S]*?\*\/\s*)?(\w+)(\??)\s*:/gm,
          (propMatch, indent, comment, propName, optional) => {
            const commentPart = comment || "";
            return `${indent}${commentPart}readonly ${propName}${optional}:`;
          },
        );

        if (newBody !== body) {
          modified = true;
          return `interface ${name} {${newBody}}`;
        }
        return match;
      },
    );

    // Pattern 2: Inline Props type in function parameters
    // Example: ({ children }: { children: ReactNode })
    content = content.replace(
      /\((\{[^}]+\})\s*:\s*\{([^}]+)\}\)/g,
      (match, params, typeBody) => {
        // Skip if already has readonly
        if (typeBody.includes("readonly ")) {
          return match;
        }

        // Add readonly to each property in inline type
        const newTypeBody = typeBody.replace(
          /(\s*)(\w+)(\??)\s*:/g,
          (typeMatch, indent, propName, optional) => {
            return `${indent}readonly ${propName}${optional}:`;
          },
        );

        if (newTypeBody !== typeBody) {
          modified = true;
          return `(${params}: {${newTypeBody}})`;
        }
        return match;
      },
    );

    if (modified && content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`${index + 1}/${files.length} ✅ ${file}`);
      successCount++;
    } else {
      console.log(
        `${index + 1}/${files.length} ⚠️  SKIP: ${file} (already has readonly or no changes)`,
      );
      skipCount++;
    }
  } catch (error) {
    console.log(
      `${index + 1}/${files.length} ❌ ERROR: ${file} - ${error.message}`,
    );
    errorCount++;
  }
});

console.log(`\n=== Summary ===`);
console.log(`✅ Success: ${successCount}`);
console.log(`⚠️  Skipped: ${skipCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📊 Total: ${files.length}`);
