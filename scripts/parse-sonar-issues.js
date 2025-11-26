const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./sonar-issues.json', 'utf8'));

const byFile = {};
data.issues.forEach(issue => {
  const file = issue.component.replace('talent:', '');
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({
    line: issue.line,
    rule: issue.rule.split(':')[1],
    message: issue.message
  });
});

// Sort by file path
const sortedFiles = Object.keys(byFile).sort();

sortedFiles.forEach(file => {
  console.log(`\n=== ${file} ===`);
  byFile[file].sort((a, b) => a.line - b.line).forEach(i => {
    console.log(`  L${i.line}: [${i.rule}] ${i.message}`);
  });
});

console.log(`\n\nTotal: ${data.issues.length} issues in ${sortedFiles.length} files`);
