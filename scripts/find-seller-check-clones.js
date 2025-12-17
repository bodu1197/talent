const fs = require('fs');
const data = JSON.parse(fs.readFileSync('report/jscpd-report.json', 'utf8'));
const clones = data.duplicates.filter(c =>
  c.firstFile.name.includes('seller/check') || c.secondFile.name.includes('seller/check')
);

console.log('\n=== Clones related to seller/check/route.ts ===\n');
clones.forEach(c => {
  console.log(`${c.lines} lines:`);
  console.log(`  File 1: ${c.firstFile.name} (lines ${c.firstFile.start}-${c.firstFile.end})`);
  console.log(`  File 2: ${c.secondFile.name} (lines ${c.secondFile.start}-${c.secondFile.end})`);
  console.log(`  Fragment: ${c.fragment.substring(0, 100).replace(/\n/g, ' ')}...`);
  console.log('');
});
