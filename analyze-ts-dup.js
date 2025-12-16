const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./jscpd-report-new/jscpd-report.json', 'utf-8'));
const ts = data.statistics.formats.typescript;
const files = Object.entries(ts.sources || {});

files.sort((a, b) => b[1].duplicatedLines - a[1].duplicatedLines);

console.log('Top 15 TypeScript files with duplication:\n');
files.slice(0, 15).forEach(([file, stats], i) => {
  if (stats.duplicatedLines > 0) {
    const shortPath = file.replace(/^src[\\/]/, '');
    console.log(
      `${(i + 1).toString().padStart(2)}. ${stats.duplicatedLines} lines (${stats.percentage.toFixed(1)}%) - ${stats.clones} clones`
    );
    console.log(`    ${shortPath}\n`);
  }
});
