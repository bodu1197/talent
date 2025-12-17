const fs = require('fs');
const data = JSON.parse(fs.readFileSync('report/jscpd-report.json', 'utf8'));
const clones = data.duplicates.sort((a,b) => b.lines - a.lines).slice(0, 10);

console.log('\n=== Top 10 Largest Code Duplications ===\n');
clones.forEach((c, i) => {
  console.log(`${i+1}. ${c.lines} lines (${c.tokens} tokens):`);
  console.log(`   File 1: ${c.firstFile.name} (lines ${c.firstFile.start}-${c.firstFile.end})`);
  console.log(`   File 2: ${c.secondFile.name} (lines ${c.secondFile.start}-${c.secondFile.end})`);
  console.log(`   Fragment preview: ${c.fragment.substring(0, 80).replace(/\n/g, ' ')}...`);
  console.log('');
});
