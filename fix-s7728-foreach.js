const fs = require("fs");
const path = require("path");

/**
 * S7728 forEach → for...of 자동 변환 스크립트
 *
 * 변환 패턴:
 * array.forEach((item) => { ... })  →  for (const item of array) { ... }
 * array?.forEach((item) => { ... }) →  if (array) { for (const item of array) { ... } }
 */

// Load issues
const issuesData = JSON.parse(fs.readFileSync("s7728-foreach.json", "utf8"));

// Group by file
const fileIssues = {};
issuesData.issues.forEach((issue) => {
  const filePath = issue.component.replace("talent:", "");
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push({ line: issue.line, message: issue.message });
});

let totalFixed = 0;
let filesProcessed = 0;

console.log("🔧 Starting S7728 forEach → for...of conversion...\n");

// Process each file
Object.entries(fileIssues).forEach(([relPath, issues]) => {
  const fullPath = path.join(process.cwd(), relPath);

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;
    const lines = content.split("\n");

    console.log(`📄 Processing: ${relPath} (${issues.length} forEach)`);

    // Sort issues by line number descending to avoid line number shifts
    issues.sort((a, b) => b.line - a.line);

    let fixCount = 0;

    issues.forEach((issue) => {
      const lineIdx = issue.line - 1;
      const line = lines[lineIdx];

      // Pattern 1: array.forEach((item) => { ... })
      // Match: identifier.forEach((param) => {
      const forEachMatch = line.match(
        /^(\s*)(.+?)\.forEach\(\(([^)]+)\)\s*=>\s*\{/,
      );

      if (forEachMatch) {
        const [, indent, arrayExpr, param] = forEachMatch;

        // Check if it's optional chaining: array?.forEach
        const isOptional = arrayExpr.endsWith("?");
        const cleanArrayExpr = isOptional ? arrayExpr.slice(0, -1) : arrayExpr;

        // Find matching closing brace
        let depth = 1;
        let closingLineIdx = lineIdx;

        for (let i = lineIdx + 1; i < lines.length && depth > 0; i++) {
          const currentLine = lines[i];
          // Count opening and closing braces
          for (const char of currentLine) {
            if (char === "{") depth++;
            if (char === "}") depth--;
            if (depth === 0) {
              closingLineIdx = i;
              break;
            }
          }
        }

        // Extract body lines
        const bodyLines = lines.slice(lineIdx + 1, closingLineIdx);

        // Build new for...of structure
        if (isOptional) {
          // Optional chaining: wrap in if statement
          const newLines = [
            `${indent}if (${cleanArrayExpr}) {`,
            `${indent}  for (const ${param} of ${cleanArrayExpr}) {`,
            ...bodyLines.map((l) => `  ${l}`), // Add extra indent
            `${indent}  }`,
            `${indent}}`,
          ];

          // Replace lines
          lines.splice(lineIdx, closingLineIdx - lineIdx + 1, ...newLines);
        } else {
          // Normal forEach
          const newLines = [
            `${indent}for (const ${param} of ${cleanArrayExpr}) {`,
            ...bodyLines,
            lines[closingLineIdx],
          ];

          // Replace lines
          lines.splice(lineIdx, closingLineIdx - lineIdx + 1, ...newLines);
        }

        fixCount++;
        console.log(
          `  ✅ Line ${issue.line}: ${isOptional ? "optional " : ""}forEach → for...of`,
        );
      } else {
        console.log(`  ⚠️  Line ${issue.line}: Complex pattern, skipping`);
      }
    });

    if (fixCount > 0) {
      const newContent = lines.join("\n");
      fs.writeFileSync(fullPath, newContent, "utf8");
      totalFixed += fixCount;
      filesProcessed++;
      console.log(`  📝 Saved: ${fixCount} fixes\n`);
    } else {
      console.log(`  ⏭️  No changes made\n`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${relPath}: ${error.message}\n`);
  }
});

console.log("📊 Summary:");
console.log(`Files processed: ${filesProcessed}`);
console.log(`Total fixes: ${totalFixed}`);
console.log(`Expected: ${issuesData.total}`);

if (totalFixed === issuesData.total) {
  console.log("\n✅ SUCCESS! All forEach calls converted to for...of");
} else {
  console.log(
    `\n⚠️  ${issuesData.total - totalFixed} forEach calls need manual review`,
  );
}
