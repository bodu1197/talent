const fs = require("fs");
const path = require("path");

// Load s7728 issues
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

console.log("📊 S7728 forEach Analysis:\n");
console.log(`Total files: ${Object.keys(fileIssues).length}`);
console.log(`Total issues: ${issuesData.total}\n`);

Object.entries(fileIssues)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([file, issues]) => {
    console.log(`${file} (${issues.length} forEach calls)`);
    issues.forEach((i) => console.log(`  Line ${i.line}`));
  });

console.log("\n🔍 Reading actual code patterns...\n");

// Analyze patterns in top files
const topFiles = Object.entries(fileIssues)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 5);

topFiles.forEach(([relPath, issues]) => {
  const fullPath = path.join(process.cwd(), relPath);
  try {
    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n");

    console.log(`\n📄 ${relPath}:`);
    issues.forEach((issue) => {
      const lineIdx = issue.line - 1;
      const contextStart = Math.max(0, lineIdx - 2);
      const contextEnd = Math.min(lines.length, lineIdx + 5);

      console.log(`\n  Line ${issue.line}:`);
      for (let i = contextStart; i < contextEnd; i++) {
        const prefix = i === lineIdx ? "→" : " ";
        console.log(`  ${prefix} ${i + 1}: ${lines[i]}`);
      }
    });
  } catch (error) {
    console.error(`❌ Error reading ${relPath}: ${error.message}`);
  }
});
