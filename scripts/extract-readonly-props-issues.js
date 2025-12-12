const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'readonly_props_issues.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('='.repeat(80));
console.log('Readonly Props Issues (typescript:S6759)');
console.log('='.repeat(80));
console.log();
console.log('Total issues:', data.total);
console.log();

// Group by file
const fileGroups = {};
data.issues.forEach((issue) => {
  const file = issue.component.replace('talent:', '');
  if (!fileGroups[file]) {
    fileGroups[file] = [];
  }
  fileGroups[file].push({
    line: issue.line,
    message: issue.message,
  });
});

// Sort by file path
const sortedFiles = Object.entries(fileGroups).sort((a, b) => a[0].localeCompare(b[0]));

console.log(`Files with readonly props issues (${sortedFiles.length} files):`);
console.log();

sortedFiles.forEach(([file, issues]) => {
  console.log(`${file} (${issues.length}개):`);
  issues.forEach((issue) => {
    if (issue.line) {
      console.log(`  Line ${issue.line}: ${issue.message}`);
    }
  });
  console.log();
});

console.log('='.repeat(80));

// Save file list
const fileList = sortedFiles.map(([file]) => file).join('\n');
const outputPath = path.join(__dirname, '..', 'readonly_props_files.txt');
fs.writeFileSync(outputPath, fileList);
console.log(`File list saved to: ${outputPath}`);
