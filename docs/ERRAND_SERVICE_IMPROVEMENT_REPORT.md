# 돌파구 심부름 서비스 개선 보고서

## 1. 현황 분석

### 1.1 현재 돌파구 심부름 페이지 문제점

| 항목        | 현재 상태        | 문제점                            |
| ----------- | ---------------- | --------------------------------- |
| 요청 폼     | 단순 텍스트 입력 | 사용자가 모든 정보 직접 입력 필요 |
| 가격 표시   | "5,000원~" 고정  | 실제 비용 예측 불가               |
| AI 분석     | 없음             | 자동 추출 기능 없음               |
| 환경 요소   | 미반영           | 날씨/시간대 할증 없음             |
| 실시간 추적 | 없음             | 배달 진행 상황 확인 불가          |

### 1.2 사용자가 심부름 요청을 못하는 이유

1. **가격 불확실성** - 최종 비용을 알 수 없음
2. **매칭 불안감** - 헬퍼가 수락할지 알 수 없음
3. **진행 답답함** - 배달 현황 확인 불가

---

## 2. 경쟁사 분석

### 2.1 배달의민족 UX 핵심 요소

- **3단계 시각화**: 주문접수 → 배달시작 → 배달완료
- **실시간 위치 추적**: 지도 위 오토바이 아이콘
- **ETA 표시**: 남은 거리/시간 직관적 표시
- **서비스별 탭 분리**: 배민배달, 가게배달 등

> 출처: [배달의민족 UI·UX 개편 (2024.04)](https://biz.newdaily.co.kr/site/data/html/2024/04/08/2024040800051.html)

### 2.2 김집사 심부름 앱 특징

- **최소주문금액 없음**: 커피 한잔부터 가능
- **14가지 대분류 카테고리**
- **집사(헬퍼) 직접 연락 가능**
- **정규직 배달원**: 품질 관리 강화

> 출처: [김집사 심부름 서비스](https://www.dailypop.kr/news/articleView.html?idxno=45078)

---

## 3. 예제 파일 분석 (심부름 배너 아이콘 영역.zip)

### 3.1 파일 구조

```
errand-banner-analysis/
├── App.tsx                    # 메인 앱 라우팅
├── types.ts                   # 타입 정의
├── components/
│   ├── Hero.tsx              # 레이더 시각화 (주변 헬퍼 표시)
│   ├── ErrandForm.tsx        # AI 분석 + 스마트 요금 계산
│   ├── DeliveryTracker.tsx   # 실시간 배달 추적
│   ├── ErrandList.tsx        # 심부름 목록
│   └── ActiveHelpers.tsx     # 활동 중 헬퍼
└── services/
    └── geminiService.ts      # Gemini AI 분석 서비스
```

### 3.2 핵심 기능 분석

#### A. AI 자연어 분석 (geminiService.ts)

```typescript
// 사용자 입력 예시:
"강남역 1번 출구 쉑쉑버거에서 햄버거 세트 하나 사서 역삼 푸르지오 103동으로 배달해줘. 비오니까 조심해서 와."

// AI 분석 결과:
{
  title: "쉑쉑버거 배달 요청",
  category: "배달/운반",
  startLocation: "강남역 1번 출구",
  endLocation: "역삼 푸르지오 103동",
  estimatedWeight: "가벼움 (서류/음식)",
  estimatedDistance: 1.2 // km
}
```

#### B. 스마트 요금 계산기 (ErrandForm.tsx)

```typescript
// 가격 산정 로직
let basePrice = 3000; // 기본 요금

// 거리 할증: 1,200원/km
basePrice += distance * 1200;

// 무게 할증
if (weightClass === 'MEDIUM') basePrice += 2000;
if (weightClass === 'HEAVY') basePrice += 10000;

// 날씨 할증
if (weather === 'RAIN') basePrice *= 1.2; // 20%
if (weather === 'SNOW') basePrice *= 1.4; // 40%

// 시간대 할증
if (timeOfDay === 'LATE_NIGHT') basePrice += 5000; // 심야
if (timeOfDay === 'RUSH_HOUR') basePrice += 2000; // 출퇴근
```

#### C. 실시간 추적 UI (DeliveryTracker.tsx)

- SVG 기반 경로 시각화 (출발지 → 도착지)
- 진행률 애니메이션 (0% ~ 100%)
- ETA 실시간 계산: `(남은거리 / 20km/h) * 60분`
- 헬퍼 프로필 + 연락 버튼 (전화, 채팅)

---

## 4. 개선 계획

### Phase 1: 즉시 구현 (1-2일)

#### 4.1 스마트 요금 계산기

**새 파일**: `src/lib/errand-pricing.ts`

```typescript
export interface PriceFactors {
  distance: number; // km
  weather: 'CLEAR' | 'RAIN' | 'SNOW';
  timeOfDay: 'DAY' | 'LATE_NIGHT' | 'RUSH_HOUR';
  weight: 'LIGHT' | 'MEDIUM' | 'HEAVY';
}

export const calculateErrandPrice = (factors: PriceFactors): number => {
  let price = 3000; // 기본 요금

  // 거리 요금
  price += factors.distance * 1200;

  // 무게 할증
  if (factors.weight === 'MEDIUM') price += 2000;
  if (factors.weight === 'HEAVY') price += 10000;

  // 날씨 할증
  if (factors.weather === 'RAIN') price *= 1.2;
  if (factors.weather === 'SNOW') price *= 1.4;

  // 시간대 할증
  if (factors.timeOfDay === 'LATE_NIGHT') price += 5000;
  if (factors.timeOfDay === 'RUSH_HOUR') price += 2000;

  return Math.round(price / 100) * 100;
};
```

#### 4.2 요청 폼 UI 개선

- 자연어 입력 필드 (큰 textarea)
- 출발지 → 도착지 시각적 경로 표시
- 실시간 예상 가격 표시
- 할증 내역 breakdown

### Phase 2: 단기 구현 (1주일)

#### 4.3 AI 분석 API

**새 파일**: `src/app/api/errands/analyze/route.ts`

- OpenAI GPT-4 또는 Gemini API 연동
- 자연어 → 구조화된 데이터 변환
- 출발지/도착지/품목/무게 자동 추출

#### 4.4 주소 검색 자동완성

- 카카오 주소 검색 API 연동
- 자동완성 드롭다운 UI
- 좌표 변환 (geocoding)

#### 4.5 날씨 API 연동

- OpenWeatherMap 또는 기상청 API
- 현재 위치 기반 날씨 자동 감지
- 할증 자동 적용

### Phase 3: 중기 구현 (2-3주)

#### 4.6 실시간 추적 페이지

**새 파일**: `src/app/errands/track/[id]/page.tsx`

- 지도 컴포넌트 (네이버/카카오맵)
- 헬퍼 위치 실시간 업데이트 (Supabase Realtime)
- 진행 상태 타임라인

#### 4.7 헬퍼 매칭 시스템

- 자동 매칭: 거리/평점/완료건수 기반
- 수동 매칭: 헬퍼 지원 → 요청자 선택

---

## 5. 우선순위 및 예상 효과

| 순위 | 기능               | 예상 효과  | 난이도 | 소요시간 |
| ---- | ------------------ | ---------- | ------ | -------- |
| 1    | 스마트 요금 계산기 | 신뢰도 ↑↑  | 중     | 1일      |
| 2    | 주소 자동완성      | 편의성 ↑↑  | 하     | 0.5일    |
| 3    | AI 자연어 분석     | UX ↑↑↑     | 상     | 3일      |
| 4    | 실시간 추적        | 만족도 ↑↑↑ | 상     | 5일      |
| 5    | 헬퍼 매칭 알고리즘 | 효율성 ↑↑  | 상     | 5일      |

---

## 6. 결론

현재 돌파구 심부름 서비스는 **"폼만 있고 프로세스가 없는"** 상태입니다.

**즉시 적용 권장 (최소 기능)**:

1. 스마트 요금 계산기 (실시간 가격 표시)
2. 카카오 주소 검색 API (자동완성)
3. 날씨 API 연동 (할증 자동 적용)

이 세 가지만 구현해도 **"심부름 요청 가능한 서비스"**로 전환됩니다.

---

## 참고 자료

- [배달의민족 UX·UI 분석](https://brunch.co.kr/@plusx/69)
- [배달의민족 2024 UI·UX 개편](https://biz.newdaily.co.kr/site/data/html/2024/04/08/2024040800051.html)
- [김집사 심부름 서비스](https://www.dailypop.kr/news/articleView.html?idxno=45078)
- [배달앱 이용 UX 트렌드 리포트](https://medium.com/diby-uxresearchops/배달앱-이용-ux-트렌드-리포트-9d5485be0cad)
