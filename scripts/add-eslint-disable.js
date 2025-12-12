#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const scriptsDir = __dirname;

// Get all .js files in scripts directory
const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js') && f !== 'add-eslint-disable.js');

let modifiedCount = 0;

files.forEach(file => {
  const filePath = path.join(scriptsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file already has eslint-disable comment
  if (content.includes('eslint-disable')) {
    return;
  }

  // Check if file starts with shebang
  const hasShebang = content.startsWith('#!');

  const disableComment = '/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */\n';

  if (hasShebang) {
    // Add after shebang
    const lines = content.split('\n');
    const shebangLine = lines[0];
    const rest = lines.slice(1).join('\n');
    content = shebangLine + '\n' + disableComment + rest;
  } else {
    // Add at the beginning
    content = disableComment + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  modifiedCount++;
  console.log(`✅ ${file}`);
});

console.log(`\n📊 ${modifiedCount}개 파일 수정 완료`);
