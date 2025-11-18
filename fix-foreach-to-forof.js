const fs = require("fs");
const path = require("path");

// Load S7728 issues
const allIssues = JSON.parse(
  fs.readFileSync("sonar-code-smells-final.json", "utf-8"),
);
const issues = allIssues.issues.filter((i) => i.rule === "typescript:S7728");

// Group by file
const byFile = {};
issues.forEach((issue) => {
  const file = issue.component.split(":")[1];
  if (!byFile[file]) {
    byFile[file] = [];
  }
  byFile[file].push(issue);
});

console.log(
  `\n=== Processing ${issues.length} forEach→for...of Issues in ${Object.keys(byFile).length} files ===\n`,
);

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

Object.keys(byFile)
  .sort()
  .forEach((filePath, fileIndex) => {
    const fullPath = path.join("C:\\Users\\ohyus\\talent", filePath);

    try {
      let content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");
      const fileIssues = byFile[filePath].sort(
        (a, b) => (b.line || 0) - (a.line || 0),
      ); // Process from bottom to top

      let modifications = 0;

      fileIssues.forEach((issue, issueIdx) => {
        if (!issue.line) {
          console.log(`  ⚠️  Issue ${issueIdx + 1}: No line number`);
          skipCount++;
          return;
        }

        const lineNum = issue.line - 1; // 0-indexed
        const line = lines[lineNum];

        if (!line || !line.includes(".forEach(")) {
          console.log(`  ⚠️  Line ${issue.line}: Not a forEach line`);
          skipCount++;
          return;
        }

        // Extract forEach pattern: array.forEach((item) => { ... })
        // Pattern: ARRAY.forEach((PARAM) => {
        const forEachMatch = line.match(
          /(\s*)(.+)\.forEach\(\(([^)]+)\)\s*=>\s*\{?/,
        );

        if (!forEachMatch) {
          console.log(
            `  ⚠️  Line ${issue.line}: Complex forEach pattern, skipping`,
          );
          skipCount++;
          return;
        }

        const [fullMatch, indent, arrayExpr, param] = forEachMatch;
        const hasOpenBrace = line.includes("{");

        // Check if it's a single-line forEach (no opening brace on same line)
        // or multi-line forEach (has opening brace)

        if (!hasOpenBrace) {
          // Single statement: array.forEach(item => statement);
          // Convert to: for (const item of array) statement;
          const statement = line.substring(line.indexOf("=>") + 2).trim();
          const newLine = `${indent}for (const ${param} of ${arrayExpr}) ${statement}`;
          lines[lineNum] = newLine;
          modifications++;
        } else {
          // Multi-line forEach with block
          // Convert: array.forEach((item) => {
          // To: for (const item of array) {
          const newLine = line.replace(
            /(.+)\.forEach\(\(([^)]+)\)\s*=>\s*\{/,
            (match, array, param) => {
              const indentMatch = line.match(/^(\s*)/);
              const indent = indentMatch ? indentMatch[1] : "";
              return `${indent}for (const ${param} of ${array}) {`;
            },
          );
          lines[lineNum] = newLine;

          // Find and remove closing });
          for (
            let i = lineNum + 1;
            i < Math.min(lineNum + 50, lines.length);
            i++
          ) {
            if (lines[i].match(/^\s*\}\);?\s*$/)) {
              // Replace }); with }
              lines[i] = lines[i].replace(/\}\);?/, "}");
              break;
            }
          }

          modifications++;
        }
      });

      if (modifications > 0) {
        fs.writeFileSync(fullPath, lines.join("\n"), "utf-8");
        console.log(
          `${fileIndex + 1}. ✅ ${filePath} (${modifications} fixes)`,
        );
        successCount += modifications;
      } else {
        console.log(`${fileIndex + 1}. ⚠️  ${filePath} (no changes)`);
      }
    } catch (error) {
      console.log(`${fileIndex + 1}. ❌ ${filePath} - ERROR: ${error.message}`);
      errorCount += byFile[filePath].length;
    }
  });

console.log(`\n=== Summary ===`);
console.log(`✅ Success: ${successCount}`);
console.log(`⚠️  Skipped: ${skipCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log(`📊 Total: ${successCount + skipCount + errorCount}`);
