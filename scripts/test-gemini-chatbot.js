/**
 * Gemini AI 챗봇 테스트 스크립트
 * 
 * 실행 방법:
 * node scripts/test-gemini-chatbot.js
 */

/* eslint-disable no-console */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  console.log('🤖 Gemini AI 챗봇 테스트 시작...\n');

  // API 키 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다.');
    console.error('   .env.local 파일에 GEMINI_API_KEY를 추가하세요.');
    process.exit(1);
  }

  console.log('✅ API 키 확인됨');

  try {
    // Gemini 클라이언트 초기화
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite', // 할당량 관대한 모델
    });

    console.log('✅ Gemini 모델 초기화 완료\n');

    // 테스트 케이스
    const testQueries = [
      '안녕하세요!',
      '회원가입은 어떻게 하나요?',
      '결제 방법은 무엇이 있나요?',
      '판매자 등록 방법을 알려주세요',
    ];

    console.log('📝 테스트 시나리오 실행 중...\n');

    for (const query of testQueries) {
      console.log(`\n👤 사용자: ${query}`);
      
      const result = await model.generateContent(query);
      const response = await result.response;
      const text = response.text();
      
      console.log(`🤖 AI: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
      console.log(`   (총 ${text.length}자)`);
    }

    console.log('\n\n✅ 모든 테스트 완료!');
    console.log('\n📊 API 사용량 확인: https://aistudio.google.com/');
    console.log('💡 다음 단계: npm run dev 실행 후 우측 하단 챗봇 아이콘 클릭');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n🔑 API 키가 유효하지 않습니다.');
      console.error('   Google AI Studio에서 새 API 키를 발급받으세요.');
      console.error('   URL: https://aistudio.google.com/');
    } else if (error.message.includes('quota')) {
      console.error('\n⚠️  API 할당량 초과');
      console.error('   무료 등급: 분당 15 요청 / 일 1,500 요청');
    } else {
      console.error('\n상세 오류:', error);
    }
    
    process.exit(1);
  }
}

// 테스트 실행
testGeminiAPI();
