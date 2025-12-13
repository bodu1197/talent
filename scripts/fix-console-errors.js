/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
/**
 * Fix console.error and console.warn calls to properly display error messages
 *
 * Problem: console.error('message:', error) shows only numbers/codes in browser console
 * Solution: console.error('message:', error instanceof Error ? error.message : String(error))
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Find all TypeScript/JavaScript files in src directory
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
  cwd: process.cwd(),
  absolute: true,
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
});

let totalFixed = 0;
const fixes = [];

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  let modified = content;
  let fileFixed = 0;

  // Pattern 1: console.error('message:', error) where error is not properly formatted
  // Match: console.error(..., error) or console.warn(..., error)
  // But skip if already has: error instanceof Error, String(error), JSON.stringify(error), error.message
  const consolePattern = /console\.(error|warn)\(([^)]+)\)/g;

  modified = modified.replace(consolePattern, (match, level, args) => {
    // Skip if already handling error properly
    if (
      args.includes('instanceof Error') ||
      args.includes('String(error)') ||
      args.includes('JSON.stringify') ||
      args.includes('error.message') ||
      args.includes('error?.message') ||
      !args.includes('error')
    ) {
      return match;
    }

    // Extract arguments
    const argList = args.split(',').map((a) => a.trim());

    // Find 'error' parameter (could be error, err, e, or similar)
    const errorParamIndex = argList.findIndex(
      (arg) => /\b(error|err|e)\b$/.test(arg) && !arg.includes("'") && !arg.includes('"')
    );

    if (errorParamIndex === -1) {
      return match; // No error parameter found
    }

    const errorParam = argList[errorParamIndex];

    // Replace error with proper formatting
    argList[errorParamIndex] =
      `${errorParam} instanceof Error ? ${errorParam}.message : String(${errorParam})`;

    fileFixed++;
    fixes.push({
      file: path.relative(process.cwd(), file),
      original: match,
      fixed: `console.${level}(${argList.join(', ')})`,
    });

    return `console.${level}(${argList.join(', ')})`;
  });

  // Pattern 2: .catch(console.error) -> .catch(err => console.error('Error:', err instanceof Error ? err.message : String(err)))
  const catchPattern = /\.catch\(console\.(error|warn)\)/g;

  modified = modified.replace(catchPattern, (match, level) => {
    fileFixed++;
    const contextMatch = content.substring(
      Math.max(0, content.indexOf(match) - 100),
      content.indexOf(match)
    );
    const funcName = contextMatch.match(/(\w+)\s*\([^)]*\)\s*\..*$/)?.[1] || 'Operation';

    fixes.push({
      file: path.relative(process.cwd(), file),
      original: match,
      fixed: `.catch(err => console.${level}('${funcName} error:', err instanceof Error ? err.message : String(err)))`,
    });

    return `.catch(err => console.${level}('${funcName} error:', err instanceof Error ? err.message : String(err)))`;
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

console.log('✨ All console messages will now display properly in the browser console!\n');
