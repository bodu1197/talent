// 사용 가능한 Gemini 모델 목록 확인
const https = require('https');

const apiKey = 'AIzaSyAiSAYBOQ_SRftcqIYYrYo3hfK4Kn4LzVY';

https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.models) {
      console.log('사용 가능한 모델:');
      json.models.filter(m => m.name.includes('gemini')).forEach(m => {
        console.log(`  ${m.name} - ${m.displayName}`);
      });
    } else {
      console.log('응답:', data);
    }
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
