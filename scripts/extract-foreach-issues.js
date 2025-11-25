const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('Fetching forEach issues (typescript:S6582)');
console.log('='.repeat(80));
console.log();

const auth = Buffer.from('admin:admin123').toString('base64');

function fetchIssues(page = 1, allIssues = []) {
  const options = {
    hostname: 'localhost',
    port: 9000,
    path: `/api/issues/search?componentKeys=talent&rules=typescript:S6582&resolved=false&ps=500&p=${page}`,
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + auth,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (!data || data.trim() === '') {
          console.log('⚠️  Empty response - trying without auth...');
          reject(new Error('Empty response'));
          return;
        }

        try {
          const json = JSON.parse(data);
          const newIssues = [...allIssues, ...json.issues];

          console.log(
            `Page ${page}: ${json.issues.length} issues (Total: ${newIssues.length}/${json.total})`
          );

          if (newIssues.length < json.total) {
            resolve(fetchIssues(page + 1, newIssues));
          } else {
            resolve({
              total: json.total,
              issues: newIssues,
            });
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

fetchIssues()
  .then((result) => {
    console.log();
    console.log('✅ Success!');
    console.log(`Total issues: ${result.total}`);
    console.log();

    // Group by file
    const fileGroups = {};
    result.issues.forEach((issue) => {
      const file = issue.component.replace('talent:', '');
      if (!fileGroups[file]) {
        fileGroups[file] = [];
      }
      fileGroups[file].push({
        line: issue.line,
        message: issue.message,
      });
    });

    const sortedFiles = Object.entries(fileGroups).sort((a, b) => a[0].localeCompare(b[0]));

    console.log(`Files with forEach issues (${sortedFiles.length} files):`);
    console.log();

    sortedFiles.forEach(([file, issues]) => {
      console.log(`${file} (${issues.length}개):`);
      issues.forEach((issue) => {
        if (issue.line) {
          console.log(`  Line ${issue.line}: ${issue.message}`);
        }
      });
      console.log();
    });

    // Save JSON
    const jsonPath = path.join(__dirname, '..', 'foreach_issues.json');
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    console.log(`JSON saved to: ${jsonPath}`);

    // Save file list
    const fileList = sortedFiles.map(([file]) => file).join('\n');
    const txtPath = path.join(__dirname, '..', 'foreach_files.txt');
    fs.writeFileSync(txtPath, fileList);
    console.log(`File list saved to: ${txtPath}`);

    console.log();
    console.log('='.repeat(80));
  })
  .catch((err) => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
