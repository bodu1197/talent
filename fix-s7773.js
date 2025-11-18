const fs = require("fs");
const path = require("path");

// Load the issues JSON
const issuesData = JSON.parse(fs.readFileSync("s7773-parseint.json", "utf8"));

// Group issues by file
const fileIssues = {};
issuesData.issues.forEach((issue) => {
  const filePath = issue.component.replace("talent:", "");
  if (!fileIssues[filePath]) {
    fileIssues[filePath] = [];
  }
  fileIssues[filePath].push(issue);
});

let totalFixed = 0;
let filesProcessed = 0;

// Process each file
Object.entries(fileIssues).forEach(([relPath, issues]) => {
  const fullPath = path.join(process.cwd(), relPath);

  try {
    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;

    // Replace patterns (avoiding already prefixed with Number.)
    // Use negative lookbehind to avoid replacing Number.parseInt with Number.Number.parseInt
    content = content.replace(/(?<!Number\.)parseInt\(/g, "Number.parseInt(");
    content = content.replace(
      /(?<!Number\.)parseFloat\(/g,
      "Number.parseFloat(",
    );
    content = content.replace(/(?<!Number\.)isNaN\(/g, "Number.isNaN(");
    content = content.replace(/(?<!Number\.)isFinite\(/g, "Number.isFinite(");

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, "utf8");
      const fixCount = issues.length;
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
