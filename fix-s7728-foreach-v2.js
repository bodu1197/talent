const fs = require("fs");
const path = require("path");

/**
 * S7728 forEach → for...of 자동 변환 스크립트 V2
 *
 * 지원하는 패턴:
 * 1. array.forEach((item) => { ... })
 * 2. array.forEach(item => { ... })  (괄호 없음)
 * 3. array?.forEach((item) => { ... })
 * 4. array?.forEach(item => { ... })
 */

const issuesData = JSON.parse(fs.readFileSync("s7728-foreach.json", "utf8"));

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
const skippedFiles = [];

console.log("🔧 Starting S7728 forEach → for...of conversion V2...\n");

Object.entries(fileIssues).forEach(([relPath, issues]) => {
  const fullPath = path.join(process.cwd(), relPath);

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n");

    console.log(`📄 Processing: ${relPath} (${issues.length} forEach)`);

    issues.sort((a, b) => b.line - a.line);

    let fixCount = 0;

    issues.forEach((issue) => {
      const lineIdx = issue.line - 1;
      const line = lines[lineIdx];

      // Enhanced pattern: supports both (param) => and param =>
      // Pattern: <indent><arrayExpr>.forEach(<param>) => {
      const forEachMatch = line.match(
        /^(\s*)(.+?)\.forEach\(\(?\s*([^)=]+)\s*\)?(?:\s*=>\s*)?\{/,
      );

      if (forEachMatch) {
        const [, indent, arrayExpr, param] = forEachMatch;

        const isOptional = arrayExpr.endsWith("?");
        const cleanArrayExpr = isOptional ? arrayExpr.slice(0, -1) : arrayExpr;
        const cleanParam = param.trim();

        // Find closing brace
        let depth = 1;
        let closingLineIdx = lineIdx;

        for (let i = lineIdx + 1; i < lines.length && depth > 0; i++) {
          const currentLine = lines[i];
          for (const char of currentLine) {
            if (char === "{") depth++;
            if (char === "}") depth--;
            if (depth === 0) {
              closingLineIdx = i;
              break;
            }
          }
        }

        const bodyLines = lines.slice(lineIdx + 1, closingLineIdx);

        if (isOptional) {
          const newLines = [
            `${indent}if (${cleanArrayExpr}) {`,
            `${indent}  for (const ${cleanParam} of ${cleanArrayExpr}) {`,
            ...bodyLines.map((l) => `  ${l}`),
            `${indent}  }`,
            `${indent}}`,
          ];
          lines.splice(lineIdx, closingLineIdx - lineIdx + 1, ...newLines);
        } else {
          const newLines = [
            `${indent}for (const ${cleanParam} of ${cleanArrayExpr}) {`,
            ...bodyLines,
            lines[closingLineIdx],
          ];
          lines.splice(lineIdx, closingLineIdx - lineIdx + 1, ...newLines);
        }

        fixCount++;
        console.log(`  ✅ Line ${issue.line}: ${cleanParam} → for...of`);
      } else {
        console.log(`  ⚠️  Line ${issue.line}: Pattern not matched`);
        console.log(`     Line content: ${line.trim()}`);
        skippedFiles.push({
          file: relPath,
          line: issue.line,
          content: line.trim(),
        });
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
  console.log(`\n⚠️  ${issuesData.total - totalFixed} forEach calls skipped\n`);
  console.log("Skipped patterns:");
  skippedFiles.forEach(({ file, line, content }) => {
    console.log(`  ${file}:${line}`);
    console.log(`    ${content}`);
  });
}
