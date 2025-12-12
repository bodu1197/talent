#!/usr/bin/env node

const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scripts-errors.json', 'utf8'));
const rules = {};

data.forEach(file => {
  file.messages.filter(m => m.severity === 2).forEach(msg => {
    if (!rules[msg.ruleId]) rules[msg.ruleId] = [];
    rules[msg.ruleId].push({
      file: file.filePath.split('\\').pop(),
      line: msg.line,
      message: msg.message
    });
  });
});

Object.keys(rules).sort((a, b) => rules[b].length - rules[a].length).forEach(rule => {
  console.log(`\n${rule} (${rules[rule].length}):`);
  rules[rule].slice(0, 3).forEach(e => {
    console.log(`  ${e.file}:${e.line} - ${e.message.substring(0, 100)}`);
  });
});

console.log(`\n총 ${Object.values(rules).reduce((sum, arr) => sum + arr.length, 0)}개 에러`);
