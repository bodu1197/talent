const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sonar-issues.json', 'utf-8'));

const files = {};
data.issues.forEach((i) => {
  const f = i.component.replace('talent:', '');
  if (!files[f]) files[f] = [];
  files[f].push(i.line);
});

Object.keys(files)
  .sort()
  .forEach((f) => {
    console.log(f + ': lines ' + files[f].sort((a, b) => a - b).join(', '));
  });
