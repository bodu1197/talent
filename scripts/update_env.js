const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const newKey = 'AIzaSyBpwRxr8X99x7yjjIkazu-OJcqF2YbsERM';
const keyName = 'GEMINI_API_KEY';

try {
  let content = fs.readFileSync(envPath, 'utf8');
  
  if (content.includes(keyName)) {
    // Replace existing key
    const regex = new RegExp(`${keyName}=.*`, 'g');
    content = content.replace(regex, `${keyName}=${newKey}`);
    console.log('Updated existing GEMINI_API_KEY in .env.local');
  } else {
    // Append new key
    content += `\n${keyName}=${newKey}\n`;
    console.log('Appended GEMINI_API_KEY to .env.local');
  }
  
  fs.writeFileSync(envPath, content, 'utf8');
  console.log('Successfully updated .env.local');
  
} catch (error) {
  console.error('Error updating .env.local:', error);
}
