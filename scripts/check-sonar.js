const token = 'sqa_a6454668bd672faa8dde9d8bb366139925a0f817';

async function main() {
  try {
    const response = await fetch('http://localhost:9000/api/issues/search?componentKeys=talent&statuses=OPEN&ps=100', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(token + ':').toString('base64')
      }
    });

    if (!response.ok) {
      console.log('Response status:', response.status);
      return;
    }

    const json = await response.json();
    console.log('Total issues:', json.total);

    const byRule = {};
    json.issues.forEach(i => {
      const r = i.rule.split(':')[1];
      byRule[r] = (byRule[r] || 0) + 1;
    });

    console.log('\n--- Issues by Rule ---');
    Object.entries(byRule).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => console.log(k + ': ' + v));

    // Show files with issues
    console.log('\n--- Files with remaining issues ---');
    const byFile = {};
    json.issues.forEach(i => {
      const f = i.component.replace('talent:', '');
      if (!byFile[f]) byFile[f] = [];
      byFile[f].push({line: i.line, rule: i.rule.split(':')[1], msg: i.message});
    });

    Object.keys(byFile).sort().forEach(f => {
      console.log('\n' + f + ':');
      byFile[f].forEach(i => console.log('  L' + i.line + ' [' + i.rule + '] ' + i.msg.substring(0, 80)));
    });
  } catch(e) {
    console.log('Error:', e.message);
  }
}

main();
