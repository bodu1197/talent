const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync("sonar-code-smells-final.json", "utf-8"),
);

const s6853 = data.issues.filter((i) => i.rule === "typescript:S6853");

console.log(`\n=== S6853 Form Label Issues (${s6853.length} total) ===\n`);

// Group by file
const byFile = {};
s6853.forEach((issue) => {
  const file = issue.component.split(":")[1];
  if (!byFile[file]) {
    byFile[file] = [];
  }
  byFile[file].push(issue);
});

// Print grouped results
Object.keys(byFile)
  .sort()
  .forEach((file, idx) => {
    console.log(`${idx + 1}. ${file} (${byFile[file].length} issues)`);
    byFile[file].forEach((issue) => {
      console.log(`   Line ${issue.line}: ${issue.message.substring(0, 80)}`);
    });
    console.log("");
  });

// Save detailed list
fs.writeFileSync("s6853-issues.json", JSON.stringify(s6853, null, 2));
console.log("Detailed list saved to s6853-issues.json");
