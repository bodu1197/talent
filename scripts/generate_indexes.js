const fs = require('fs');
const issues = require('../db_report.json');

function extractColumnName(tableName, fkeyName) {
    let cleanName = fkeyName.replace(tableName + '_', '');
    cleanName = cleanName.replace('_fkey', '');
    return cleanName;
}

let sql = '-- Auto-generated migration to fix unindexed foreign keys\n\n';
let count = 0;

issues.forEach(issue => {
    if (issue.name === 'unindexed_foreign_keys') {
        const tableName = issue.metadata.name;
        let fkeyName = '';

        // Logic: The report has backslashes escaping backticks. e.g. "Table \`public.foo\`..."
        // We can just regex match the word ending in _fkey inside a quoted string.
        // Matches: `foobar_fkey` or \`foobar_fkey\`

        // Simplest robust regex: find the token that looks like an fkey name (usually snake_case_fkey)
        // surrounded by backticks (escaped or not).
        const match = issue.detail.match(/`([a-zA-Z0-9_]+_fkey)`/);
        // If not found, try finding it without backticks (just in case)
        const matchFallback = issue.detail.match(/ ([a-zA-Z0-9_]+_fkey) /);

        if (match) {
            fkeyName = match[1];
        } else if (matchFallback) {
            fkeyName = matchFallback[1];
        } else {
            // As a last resort, try splitting by space and finding the word ending in _fkey
            const parts = issue.detail.split(' ');
            const found = parts.find(p => p.includes('_fkey'));
            if (found) {
                // clean up punctuation
                fkeyName = found.replace(/[`\\.]/g, '');
            }
        }

        if (!fkeyName) {
            console.warn('Skipping item, could not find fkey name:', issue.detail);
            return;
        }

        const columnName = extractColumnName(tableName, fkeyName);
        const indexName = `idx_${tableName}_${columnName}`;

        sql += `CREATE INDEX IF NOT EXISTS ${indexName} ON public.${tableName} (${columnName});\n`;
        count++;
    }
});

console.log(`Generated SQL for ${count} indexes.`);
fs.writeFileSync('supabase/migrations/20251213095500_optimize_performance_indexes.sql', sql);
console.log('Migration generated at supabase/migrations/20251213095500_optimize_performance_indexes.sql');
