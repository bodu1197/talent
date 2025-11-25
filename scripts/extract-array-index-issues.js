const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'array_index_issues_full.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('Array Index Issues - Full Analysis');
console.log('='.repeat(80));
console.log();
console.log('Total issues:', data.total);
console.log('Issues with line numbers:', data.issues.filter((i) => i.line).length);
console.log('Issues without line numbers:', data.issues.filter((i) => !i.line).length);
console.log();

// Filter issues with valid line numbers
const issuesWithLines = data.issues.filter((i) => i.line);

// Group by file
const fileGroups = {};
issuesWithLines.forEach((issue) => {
  const file = issue.component.replace('talent:', '');
  if (!fileGroups[file]) {
    fileGroups[file] = [];
  }
  fileGroups[file].push(issue.line);
});

// Sort by number of issues
const sortedFiles = Object.entries(fileGroups).sort((a, b) => b[1].length - a[1].length);

console.log('Files with Array index issues:');
console.log();
sortedFiles.forEach(([file, lines]) => {
  console.log(`${file} (${lines.length}개):`);
  console.log(`  Lines: ${lines.sort((a, b) => a - b).join(', ')}`);
});

console.log();
console.log('='.repeat(80));

// Save to text file
const outputLines = [];
sortedFiles.forEach(([file, lines]) => {
  lines
    .sort((a, b) => a - b)
    .forEach((line) => {
      outputLines.push(`${file}:${line}`);
    });
});

const outputPath = path.join(__dirname, '..', 'array_index_issues_list.txt');
fs.writeFileSync(outputPath, outputLines.join('\n'));
console.log(`Issue list saved to: ${outputPath}`);
