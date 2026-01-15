const fs = require('fs');

try {
    const content = fs.readFileSync('test-results.json', 'utf8');
    const results = JSON.parse(content);
    const failures = [];

    for (const testResult of results.testResults) {
        if (testResult.status === 'failed') {
            const failingTests = testResult.assertionResults
                .filter(r => r.status === 'failed')
                .map(r => ({
                    title: r.title,
                    message: r.failureMessages[0] ? r.failureMessages[0].split('\n')[0] : 'No message'
                }));

            if (failingTests.length > 0) {
                failures.push({
                    file: testResult.name.replace(process.cwd(), '').replace(/\\/g, '/'),
                    tests: failingTests
                });
            }
        }
    }

    console.log(JSON.stringify(failures, null, 2));
} catch (e) {
    console.error('Error parsing results:', e);
}
