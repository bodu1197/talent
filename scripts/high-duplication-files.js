const fs = require('fs');
const data = JSON.parse(fs.readFileSync('report/jscpd-report.json', 'utf8'));
const files = Object.entries(data.statistics.formats.typescript.sources)
  .filter(([name,stats]) => stats.percentage > 50)
  .sort((a,b) => b[1].percentage - a[1].percentage)
  .slice(0, 20);

console.log('\n=== Files with >50% Duplication Rate ===\n');
files.forEach(([name, stats]) => {
  console.log(`${stats.percentage.toFixed(1)}% - ${name}`);
  console.log(`  Duplicated: ${stats.duplicatedLines} lines, ${stats.clones} clones`);
});
console.log(`\nTotal: ${files.length} files\n`);
