const plan = {
  'AI 서비스': 6,  // 이미 정렬됨 - 변경 없음
  'IT/프로그래밍': 11,
  '디자인': 13,
  '마케팅': 10,
  '문서/글쓰기': 9,
  '번역/통역': 4,
  '영상/사진': 8,
  '음악/오디오': 3,
  '비즈니스': 10,
  '세무/법무/노무': 5,
  '생활 서비스': 4,  // 이미 정렬됨 - 변경 없음
  '심부름': 1,
  '뷰티/패션': 2,
  '상담/코칭': 1,
  '운세/타로': 2,
  '이벤트': 2,
  '전자책/템플릿': 2,
  '주문제작': 4,
  '직무역량': 2,
  '취미/핸드메이드': 3,
  '취업/입시': 2
};

let total = 0;
let toReorder = 0;

Object.entries(plan).forEach(([category, count]) => {
  total += count;
  if (category !== 'AI 서비스' && category !== '생활 서비스') {
    toReorder += count;
  }
});

console.log('='.repeat(60));
console.log('2차 카테고리 재정렬 통계');
console.log('='.repeat(60));
console.log('');
console.log('📊 전체 2차 카테고리: ' + total + '개');
console.log('🔄 재정렬 대상: ' + toReorder + '개');
console.log('✅ 이미 정렬됨 (변경 없음): ' + (total - toReorder) + '개');
console.log('');
console.log('='.repeat(60));
console.log('1차 카테고리별 2차 카테고리 개수');
console.log('='.repeat(60));
console.log('');

Object.entries(plan).forEach(([category, count]) => {
  const status = (category === 'AI 서비스' || category === '생활 서비스') ? ' ✅ (변경 없음)' : ' 🔄 (재정렬)';
  console.log('  ' + category.padEnd(20) + ': ' + String(count).padStart(2) + '개' + status);
});

console.log('');
console.log('='.repeat(60));
