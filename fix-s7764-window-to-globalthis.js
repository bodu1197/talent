const fs = require("fs");
const path = require("path");

// Load S7764 issues
const issuesData = JSON.parse(fs.readFileSync("s7764.json", "utf8"));

let totalFixed = 0;
let filesProcessed = 0;

console.log("🔧 Starting S7764 window → globalThis conversion...\n");

// Group by file
const fileIssues = {};
issuesData.issues.forEach((issue) => {
  const filePath = issue.component.replace("talent:", "");
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push(issue.line);
});

Object.entries(fileIssues).forEach(([relPath, lines]) => {
  const fullPath = path.join(process.cwd(), relPath);

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;

    // Simple replacement: window → globalThis
    // But only standalone window, not window.something in comments
    content = content.replace(/\bwindow\b/g, "globalThis");

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, "utf8");
      const fixCount = lines.length;
      totalFixed += fixCount;
      filesProcessed++;
      console.log(`✅ ${relPath} (${fixCount} fixes)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${relPath}: ${error.message}`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`Files processed: ${filesProcessed}`);
console.log(`Total fixes: ${totalFixed}`);
console.log(`Expected: ${issuesData.total}`);

if (totalFixed === issuesData.total) {
  console.log("\n✅ SUCCESS! All window references converted to globalThis");
} else {
  console.log(
    `\n⚠️  ${issuesData.total - totalFixed} issues may need manual review`,
  );
}
