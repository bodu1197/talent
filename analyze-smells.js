const fs = require("fs");
const data = JSON.parse(fs.readFileSync("sonar-code-smells.json", "utf-8"));

const rules = {};
data.issues.forEach((i) => {
  rules[i.rule] = (rules[i.rule] || 0) + 1;
});

const sorted = Object.entries(rules).sort((a, b) => b[1] - a[1]);
console.log("Top 15 Code Smells:");
sorted.slice(0, 15).forEach(([rule, count]) => {
  console.log(count + "x - " + rule);
});
console.log("\nTotal: " + data.total + " code smells");
