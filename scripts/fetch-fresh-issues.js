/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const http = require('http');
const fs = require('fs');
const path = require('path');

const rule = process.argv[2] || 'typescript:S6759';
const outputFile = process.argv[3] || 'readonly_props_issues.json';

console.log(`Fetching issues for rule: ${rule}`);
console.log(`Output file: ${outputFile}`);
console.log();

const auth = Buffer.from('admin:admin123').toString('base64');

function fetchIssues(page = 1, allIssues = []) {
  const options = {
    hostname: 'localhost',
    port: 9000,
    path: `/api/issues/search?componentKeys=talent&rules=${rule}&resolved=false&ps=500&p=${page}`,
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
          console.log('Empty response from SonarQube API');
          console.log('This might mean:');
          console.log('1. SonarQube is still processing the analysis');
          console.log('2. Authentication failed');
          console.log('3. The server is not responding');
          reject(new Error('Empty response'));
          return;
        }

        try {
          const json = JSON.parse(data);
          const newIssues = [...allIssues, ...json.issues];

          console.log(
            `Page ${page}: ${json.issues.length} issues (Total so far: ${newIssues.length}/${json.total})`
          );

          if (newIssues.length < json.total) {
            // Fetch next page
            resolve(fetchIssues(page + 1, newIssues));
          } else {
            // All issues fetched
            resolve({
              total: json.total,
              issues: newIssues,
            });
          }
        } catch (error) {
          console.error('에러 발생:', error);
          console.error('Parse error:', e.message);
          console.error('Response preview:', data.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      reject(e);
    });

    req.setTimeout(10000, () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

fetchIssues()
  .then((result) => {
    const outputPath = path.join(__dirname, '..', outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log();
    console.log('✅ Success!');
    console.log(`Total issues: ${result.total}`);
    console.log(`Saved to: ${outputPath}`);
  })
  .catch((err) => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
