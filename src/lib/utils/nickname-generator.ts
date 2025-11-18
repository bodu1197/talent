// 성별 중립적인 랜덤 닉네임 생성기

const adjectives = [
  "행복한",
  "즐거운",
  "신나는",
  "멋진",
  "빛나는",
  "사랑스러운",
  "귀여운",
  "용감한",
  "지혜로운",
  "친절한",
  "활발한",
  "차분한",
  "온화한",
  "당당한",
  "씩씩한",
  "반짝이는",
  "푸른",
  "빨간",
  "하얀",
  "검은",
  "노란",
  "초록",
  "보라",
  "분홍",
  "하늘색",
  "황금",
  "은빛",
  "별빛",
  "달빛",
  "햇살",
  "산뜻한",
  "상쾌한",
  "따뜻한",
  "시원한",
  "포근한",
];

const nouns = [
  "사과",
  "바나나",
  "포도",
  "딸기",
  "수박",
  "복숭아",
  "자두",
  "배",
  "귤",
  "레몬",
  "구름",
  "별",
  "달",
  "해",
  "무지개",
  "나무",
  "꽃",
  "나비",
  "새",
  "고양이",
  "강아지",
  "토끼",
  "다람쥐",
  "펭귄",
  "판다",
  "호랑이",
  "사자",
  "코끼리",
  "기린",
  "얼룩말",
  "바람",
  "파도",
  "산",
  "강",
  "바다",
  "하늘",
  "구름",
  "눈",
  "비",
  "안개",
];

/**
 * 성별 중립적인 랜덤 닉네임 생성
 * @returns "행복한사과", "빛나는구름" 등
 */
export function generateRandomNickname(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
}

/**
 * 숫자를 포함한 유니크한 닉네임 생성
 * @returns "행복한사과1234" 등
 */
export function generateUniqueNickname(): string {
  const base = generateRandomNickname();
  const number = Math.floor(Math.random() * 10000);
  return `${base}${number}`;
}

/**
 * 프로필 이미지 생성 (DiceBear API 사용)
 * @param nickname - 닉네임을 seed로 사용
 * @returns 프로필 이미지 URL
 */
export function generateProfileImage(nickname: string): string {
  // DiceBear의 Avataaars 스타일 사용 (성별 중립적) - PNG 형식
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(nickname)}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=200`;
}

/**
 * 다른 스타일의 프로필 이미지 생성
 * @param nickname - 닉네임을 seed로 사용
 * @param style - 'avataaars' | 'bottts' | 'initials' | 'shapes'
 * @returns 프로필 이미지 URL
 */
export function generateProfileImageWithStyle(
  nickname: string,
  style: "avataaars" | "bottts" | "initials" | "shapes" = "avataaars",
): string {
  const baseUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(nickname)}`;

  switch (style) {
    case "avataaars":
      return `${baseUrl}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    case "bottts":
      return `${baseUrl}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    case "initials":
      return `${baseUrl}&backgroundColor=00897b,00acc1,039be5,1e88e5,3949ab,43a047,5e35b1,7cb342,8e24aa,c0ca33,d81b60,e53935,f4511e,fb8c00,fdd835,ffb300`;
    case "shapes":
      return `${baseUrl}`;
    default:
      return `${baseUrl}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }
}
