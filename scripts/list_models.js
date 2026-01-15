const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not defined in .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  console.log('Fetching available Gemini models for this API key...');
  try {
    // SDK method not reliably available, using direct REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('\n=== Available Gemini Models ===');
      data.models.forEach(model => {
        if (model.name.toLowerCase().includes('gemini')) {
          console.log(`- ${model.name}`);
        }
      });
    } else {
      console.log('No models found or error:', data);
    }

  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
