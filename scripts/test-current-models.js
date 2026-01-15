const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function checkConfiguredModels() {
  console.log('Checking configured Gemini models...');
  
  // 우리가 테스트할 모델 목록 (최근 사용한 것들)
  const modelsToCheck = [
    // 'gemini-1.5-flash',
    // 'gemini-1.5-pro',
    // 'gemini-2.0-flash-exp',
    'gemini-3-flash-preview',
    // 'gemini-exp-1206'
  ];

  for (const modelName of modelsToCheck) {
    console.log(`\nTesting model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, are you working?');
      const response = await result.response;
      console.log(`✅ Success! Response: ${response.text().trim()}`);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
}

checkConfiguredModels();
