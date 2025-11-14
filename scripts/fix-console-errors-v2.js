/**
 * Fix console.error and console.warn calls to display full error content instead of [Object object]
 *
 * Problem: console.error('message:', error) shows "▶ Object" requiring click to expand
 * Solution: console.error('message:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all TypeScript/JavaScript files in src directory
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**']
});

let totalFixed = 0;
const fixes = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileFixed = 0;

  // Pattern: Replace "error instanceof Error ? error.message : String(error)" back to proper JSON.stringify
  // This handles the previous fix that didn't work as expected
  const oldPattern = /(\w+) instanceof Error \? \1\.message : String\(\1\)/g;

  modified = modified.replace(oldPattern, (match, errorVar) => {
    fileFixed++;
    fixes.push({
      file: path.relative(process.cwd(), file),
      original: match,
      fixed: `JSON.stringify(${errorVar}, Object.getOwnPropertyNames(${errorVar}), 2)`
    });
    return `JSON.stringify(${errorVar}, Object.getOwnPropertyNames(${errorVar}), 2)`;
  });

  // Also fix any remaining direct error variable references in console calls
  const consolePattern = /console\.(error|warn)\(([^)]+)\)/g;

  modified = modified.replace(consolePattern, (match, level, args) => {
    // Skip if already has JSON.stringify
    if (args.includes('JSON.stringify')) {
      return match;
    }

    // Extract arguments
    const argList = args.split(',').map(a => a.trim());

    // Find error parameter (could be error, err, e, or similar variable names)
    let changed = false;
    const newArgList = argList.map(arg => {
      // Match standalone error variables (not strings, not property access)
      if (/^(error|err|e)$/i.test(arg)) {
        changed = true;
        return `JSON.stringify(${arg}, Object.getOwnPropertyNames(${arg}), 2)`;
      }
      return arg;
    });

    if (changed) {
      fileFixed++;
      const newCall = `console.${level}(${newArgList.join(', ')})`;
      fixes.push({
        file: path.relative(process.cwd(), file),
        original: match,
        fixed: newCall
      });
      return newCall;
    }

    return match;
  });

  // Pattern: .catch(err => console.error('msg:', err instanceof Error ? err.message : String(err)))
  // Convert to: .catch(err => console.error('msg:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2)))
  const catchPattern = /\.catch\((\w+) => console\.(error|warn)\([^)]+\1 instanceof Error[^)]+\)\)/g;

  modified = modified.replace(catchPattern, (match, errVar, level) => {
    const contextMatch = content.substring(Math.max(0, content.indexOf(match) - 100), content.indexOf(match));
    const funcName = contextMatch.match(/(\w+)\s*\([^)]*\)\s*\..*$/)?.[1] || 'Operation';

    fileFixed++;
    const newCatch = `.catch(${errVar} => console.${level}('${funcName} error:', JSON.stringify(${errVar}, Object.getOwnPropertyNames(${errVar}), 2)))`;
    fixes.push({
      file: path.relative(process.cwd(), file),
      original: match,
      fixed: newCatch
    });
    return newCatch;
  });

  if (fileFixed > 0) {
    fs.writeFileSync(file, modified, 'utf8');
    totalFixed += fileFixed;
    console.log(`✓ Fixed ${fileFixed} console calls in ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\n✅ Total: Fixed ${totalFixed} console.error/warn calls in ${files.length} files\n`);

if (fixes.length > 0 && process.argv.includes('--verbose')) {
  console.log('Detailed fixes:');
  fixes.forEach(({ file, original, fixed }) => {
    console.log(`\nFile: ${file}`);
    console.log(`  Before: ${original}`);
    console.log(`  After:  ${fixed}`);
  });
}

console.log('✨ All console errors will now display full content without needing to expand!\n');
