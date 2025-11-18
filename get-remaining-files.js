const fs = require("fs");
const data = JSON.parse(
  fs.readFileSync("sonar-code-smells-final.json", "utf-8"),
);
const issues = data.issues.filter(
  (i) => i.rule === "typescript:S6759" && i.line !== undefined,
);
const files = [
  ...new Set(issues.map((i) => i.component.replace("talent:", ""))),
];

console.log("Total files:", files.length);
console.log("\nNext batch (files 20-30):");
files.slice(20, 30).forEach((f, i) => console.log(`${20 + i + 1}. ${f}`));
