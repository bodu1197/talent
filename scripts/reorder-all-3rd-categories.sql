-- ========================================
-- 모든 3차 카테고리 중요도 기반 재정렬
-- 총 428개 카테고리 중 174개 업데이트
--
-- 정렬 규칙:
-- 1. "기타" 항목은 맨 마지막 (999)
-- 2. AI 관련 최우선 (1-10)
-- 3. 웹 관련 (11-20)
-- 4. 모바일/앱 관련 (21-30)
-- 5. 광고/마케팅 관련 (31-40)
-- 6. SNS 관련 (41-50)
-- 7. 영상 관련 (51-60)
-- 8. 디자인 관련 (61-70)
-- 9. 사진 관련 (71-80)
-- 10. 번역 주요언어 (81-90)
-- 11. 쇼핑몰/커머스 (91-100)
-- 12. 데이터/분석 (101-110)
-- 13. 콘텐츠 제작 (111-120)
-- 14. 나머지 (500)
-- ========================================


-- AI 마케팅·글작성 (ai-marketing-writing)
UPDATE categories SET display_order = 1 WHERE id = 'b8f84c3b-1377-490b-945d-f85610e46244'; -- AI 마케팅 콘텐츠
UPDATE categories SET display_order = 2 WHERE id = '4b0d8c1f-30c1-4f9e-84ad-3a4457646417'; -- AI 콘텐츠 생성
UPDATE categories SET display_order = 3 WHERE id = 'c125161d-ccd8-4966-a66d-9a499fbb4e44'; -- AI SEO·GEO

-- AI 디자인 (ai-design)

-- AI 활용·수익화 (ai-utilization-monetization)

-- 배달 서비스 (delivery-service)
UPDATE categories SET display_order = 1 WHERE id = 'bc157df9-55fa-43c8-aa19-87278dde63e0'; -- 장보기
UPDATE categories SET display_order = 2 WHERE id = '419f159e-3ec0-43b0-9ccd-cb5252917aad'; -- 꽃 배달
UPDATE categories SET display_order = 3 WHERE id = '65a787d7-51dc-45ae-a1b7-74b51634d7b1'; -- 서류 배달
UPDATE categories SET display_order = 4 WHERE id = 'd1cd2353-15f8-455d-9bc6-5b64664d517f'; -- 선물 배달
UPDATE categories SET display_order = 5 WHERE id = '985e8f97-c01e-4ee2-86fa-cf89b37ba9c3'; -- 음식 배달 대행

-- 3D 디자인 (3d-design)

-- AI 프롬프트 (ai-prompt-new)
UPDATE categories SET display_order = 1 WHERE id = '6e3313f2-e203-497d-8a38-00df96bb62a9'; -- 음악/영상 프롬프트
UPDATE categories SET display_order = 2 WHERE id = '0a9cddd4-b2a7-478d-8f81-06840ec792cf'; -- 디자인 프롬프트

-- 이사 (moving-service)

-- 가사/돌봄 도우미 (home-helper)

-- 집수리 (home-repair)

-- 학술 문서 (academic-documents)

-- 입시 준비 (admission-prep)

-- AI 콘텐츠 (ai-content)

-- AI (ai-it)

-- AI 마케팅 (ai-marketing)
UPDATE categories SET display_order = 1 WHERE id = 'ai-competitor-analysis'; -- AI 경쟁사 분석
UPDATE categories SET display_order = 2 WHERE id = 'ai-ad-copy'; -- AI 광고 카피 제작
UPDATE categories SET display_order = 3 WHERE id = 'ai-marketing-service'; -- AI 마케팅
UPDATE categories SET display_order = 4 WHERE id = 'ai-marketing-strategy'; -- AI 마케팅 전략 수립
UPDATE categories SET display_order = 5 WHERE id = 'ai-social-media-management'; -- AI 소셜미디어 관리
UPDATE categories SET display_order = 6 WHERE id = 'ai-influencer-matching'; -- AI 인플루언서 매칭
UPDATE categories SET display_order = 7 WHERE id = 'ai-keyword-research'; -- AI 키워드 리서치
UPDATE categories SET display_order = 8 WHERE id = 'ai-performance-report'; -- AI 퍼포먼스 리포트
UPDATE categories SET display_order = 9 WHERE id = 'ai-ab-test'; -- AI A/B 테스트 분석

-- AI 글쓰기 (ai-writing)

-- 분석·전략 (analysis-strategy)

-- 애니메이션 (animation)
UPDATE categories SET display_order = 1 WHERE id = 'lottie-web-animation'; -- 로티·web 애니메이션
UPDATE categories SET display_order = 2 WHERE id = '2d-animation'; -- 2D 애니메이션
UPDATE categories SET display_order = 3 WHERE id = '3d-animation'; -- 3D 애니메이션

-- 음향 (audio)
UPDATE categories SET display_order = 1 WHERE id = 'audio-content'; -- 오디오 콘텐츠
UPDATE categories SET display_order = 2 WHERE id = 'voice-actor'; -- 성우
UPDATE categories SET display_order = 3 WHERE id = 'audio-engineering'; -- 오디오 엔지니어링

-- 오디오 작업 (audio-production)
UPDATE categories SET display_order = 1 WHERE id = 'sound-effects'; -- 효과음 제작
UPDATE categories SET display_order = 2 WHERE id = 'mixing-mastering'; -- 믹싱/마스터링
UPDATE categories SET display_order = 3 WHERE id = 'audio-editing'; -- 오디오 편집
UPDATE categories SET display_order = 4 WHERE id = 'podcast-editing'; -- 팟캐스트 편집

-- AI 영상·사진·음향 (ai-video-photo-audio)

-- 뷰티 서비스 (beauty-services)

-- 비즈니스 카피 (business-copy)

-- 기타 (business-etc)

-- 자료·콘텐츠 (business-materials)

-- 사업계획 (business-plan)

-- 비즈니스 스킬 (business-skills)

-- 비즈니스 지원 (business-support)
UPDATE categories SET display_order = 1 WHERE id = 'data-entry'; -- 데이터 입력
UPDATE categories SET display_order = 2 WHERE id = 'virtual-assistant'; -- 가상 비서

-- 캘리그라피·폰트 (calligraphy-font)
UPDATE categories SET display_order = 1 WHERE id = 'font-design'; -- 폰트
UPDATE categories SET display_order = 2 WHERE id = 'signature-seal'; -- 사인·직인
UPDATE categories SET display_order = 3 WHERE id = 'calligraphy'; -- 캘리그라피
UPDATE categories SET display_order = 4 WHERE id = 'typography'; -- 타이포그래피

-- 채널 활성화 (channel-activation)
UPDATE categories SET display_order = 3 WHERE id = 'youtube-management'; -- 유튜브 관리
UPDATE categories SET display_order = 4 WHERE id = 'instagram-management'; -- 인스타그램 관리
UPDATE categories SET display_order = 5 WHERE id = 'reels-shorts-tiktok-management'; -- 릴스·숏츠·틱톡 관리
UPDATE categories SET display_order = 6 WHERE id = 'blog-management'; -- 블로그 관리

-- 캐릭터·일러스트 (character-illustration)

-- 컴퓨터 그래픽(CG) (computer-graphics)
UPDATE categories SET display_order = 1 WHERE id = 'intro-logo'; -- 인트로·로고
UPDATE categories SET display_order = 2 WHERE id = '3d-modeling-cg'; -- 3D 모델링
UPDATE categories SET display_order = 5 WHERE id = 'infographic'; -- 인포그래픽
UPDATE categories SET display_order = 6 WHERE id = 'typography-cg'; -- 타이포그래피
UPDATE categories SET display_order = 7 WHERE id = 'ar-vr-xr'; -- AR·VR·XR

-- 컨설팅 (consulting)

-- 콘텐츠 글쓰기 (content-writing)

-- 기업 자문 (corporate-consulting)
UPDATE categories SET display_order = 1 WHERE id = 'branding-consulting'; -- 브랜딩
UPDATE categories SET display_order = 2 WHERE id = 'logistics-production'; -- 물류·생산
UPDATE categories SET display_order = 3 WHERE id = 'sales-consulting'; -- 세일즈
UPDATE categories SET display_order = 4 WHERE id = 'operation-support'; -- 운영 지원
UPDATE categories SET display_order = 5 WHERE id = 'general-management-consulting'; -- 일반 경영 자문
UPDATE categories SET display_order = 6 WHERE id = 'financial-consulting'; -- 재무 자문
UPDATE categories SET display_order = 7 WHERE id = 'global-business'; -- 해외 사업·해외 진출
UPDATE categories SET display_order = 8 WHERE id = 'hr-corporate-culture'; -- HR·기업문화
UPDATE categories SET display_order = 9 WHERE id = 'it-consulting'; -- IT 컨설팅

-- 창작 글쓰기 (creative-writing)

-- 굿즈 제작 (custom-goods)

-- 기타 (custom-order-etc)

-- 데이터 (data)

-- 기타 (design-etc)
UPDATE categories SET display_order = 2 WHERE id = 'designer-subscription'; -- 디자이너 구독제
UPDATE categories SET display_order = 3 WHERE id = 'design-template'; -- 디자인 템플릿

-- 전문 청소 (professional-cleaning)
UPDATE categories SET display_order = 1 WHERE id = '627d61ca-ab27-4ad2-b30c-cb95c0b7bf3e'; -- 에어컨 세척
UPDATE categories SET display_order = 2 WHERE id = '07f8f095-c981-4d86-8c5b-3afda7947f30'; -- 사무실/상가 청소

-- 번역 (document-translation)
UPDATE categories SET display_order = 2 WHERE id = 'proofreading'; -- 감수
UPDATE categories SET display_order = 3 WHERE id = 'english-translation'; -- 영어 번역
UPDATE categories SET display_order = 5 WHERE id = 'japanese-translation'; -- 일본어 번역

-- AI 개발·자동화 (ai-development-automation)

-- 전자책 (ebook)

-- 엔터테이너 (entertainer)
UPDATE categories SET display_order = 1 WHERE id = 'model'; -- 모델
UPDATE categories SET display_order = 2 WHERE id = 'actor'; -- 배우
UPDATE categories SET display_order = 3 WHERE id = 'show-host'; -- 쇼호스트
UPDATE categories SET display_order = 4 WHERE id = 'mc'; -- MC

-- 행사 기획 (event-planning)

-- 행사 서비스 (event-services)
UPDATE categories SET display_order = 1 WHERE id = 'performance'; -- 공연
UPDATE categories SET display_order = 2 WHERE id = 'mc-hosting'; -- 사회/진행
UPDATE categories SET display_order = 3 WHERE id = 'catering'; -- 케이터링
UPDATE categories SET display_order = 4 WHERE id = 'dj-service'; -- DJ 서비스

-- 패션 스타일링 (fashion-styling)

-- 패션·텍스타일 (fashion-textile)
UPDATE categories SET display_order = 2 WHERE id = 'pattern-sample-production'; -- 패턴·샘플제작
UPDATE categories SET display_order = 3 WHERE id = 'work-instruction-diagram'; -- 작업지시서·도식화

-- 재무/회계 (finance-accounting)

-- 사주/운세 (fortune-telling)

-- 게임·웹3.0 (game-web3)
UPDATE categories SET display_order = 1 WHERE id = 'metaverse'; -- 메타버스
UPDATE categories SET display_order = 2 WHERE id = 'nft-art'; -- NFT아트
UPDATE categories SET display_order = 3 WHERE id = 'vr-ar-game'; -- VR·AR·게임

-- 게임 (gaming)

-- 선물/기념품 (gift-items)
UPDATE categories SET display_order = 1 WHERE id = 'gift-wrapping'; -- 선물 포장
UPDATE categories SET display_order = 2 WHERE id = 'personalized-gift'; -- 개인화 선물
UPDATE categories SET display_order = 3 WHERE id = 'flower-arrangement'; -- 꽃꽂이

-- 해외 마케팅 (global-marketing)

-- 그래픽 디자인 (graphic-design)
UPDATE categories SET display_order = 1 WHERE id = 'photoshop-file-conversion'; -- 포토샵·파일변환
UPDATE categories SET display_order = 2 WHERE id = 'ppt-infographic'; -- PPT·인포그래픽

-- 핸드메이드 (handmade-craft)

-- 산업·제품 디자인 (industrial-product-design)

-- 업종·목적별 (industry-purpose)
UPDATE categories SET display_order = 1 WHERE id = 'app-marketing'; -- 앱마케팅
UPDATE categories SET display_order = 4 WHERE id = 'industry-marketing-package'; -- 업종별 마케팅 패키지
UPDATE categories SET display_order = 5 WHERE id = 'total-ad-agency'; -- 종합광고대행
UPDATE categories SET display_order = 6 WHERE id = 'db-marketing'; -- DB 마케팅

-- 업종별 창업 (industry-startup)
UPDATE categories SET display_order = 1 WHERE id = 'online-store-startup'; -- 온라인 쇼핑몰 창업
UPDATE categories SET display_order = 2 WHERE id = 'health-food-startup'; -- 건강기능식품 창업
UPDATE categories SET display_order = 3 WHERE id = 'unmanned-space-rental-startup'; -- 무인점포·공간대여 창업
UPDATE categories SET display_order = 4 WHERE id = 'beauty-care-startup'; -- 미용·뷰티케어 창업
UPDATE categories SET display_order = 5 WHERE id = 'pet-startup'; -- 반려동물 창업
UPDATE categories SET display_order = 6 WHERE id = 'hospital-pharmacy-startup'; -- 병원·약국 창업

-- 지식재산권 보호 (intellectual-property)

-- 통역 (interpretation)
UPDATE categories SET display_order = 3 WHERE id = 'chinese-interpretation'; -- 중국어 통역
UPDATE categories SET display_order = 4 WHERE id = 'japanese-interpretation'; -- 일본어 통역

-- 기타 (it-etc)

-- 직무직군 (job-position)
UPDATE categories SET display_order = 1 WHERE id = 'data-ml-dl'; -- 데이터·ML·DL
UPDATE categories SET display_order = 3 WHERE id = 'backend-position'; -- 백엔드
UPDATE categories SET display_order = 4 WHERE id = 'fullstack-position'; -- 풀스택
UPDATE categories SET display_order = 5 WHERE id = 'frontend-position'; -- 프론트엔드
UPDATE categories SET display_order = 6 WHERE id = 'ui-ux-planning'; -- UI·UX 기획

-- 취업 준비 (job-preparation)
UPDATE categories SET display_order = 1 WHERE id = 'portfolio-making'; -- 포트폴리오 제작
UPDATE categories SET display_order = 2 WHERE id = 'interview-coaching'; -- 면접 코칭
UPDATE categories SET display_order = 3 WHERE id = 'resume-writing'; -- 이력서 작성

-- 노무 (labor-service)

-- 법무 (legal-service)
UPDATE categories SET display_order = 1 WHERE id = 'legal-administration'; -- 법무·행정
UPDATE categories SET display_order = 2 WHERE id = 'personal-legal-consulting'; -- 개인 법률 자문
UPDATE categories SET display_order = 3 WHERE id = 'contract-review'; -- 계약서 검토
UPDATE categories SET display_order = 4 WHERE id = 'legal-consulting'; -- 법률 상담

-- 법률 서비스 (legal-services)
UPDATE categories SET display_order = 1 WHERE id = 'patent-trademark'; -- 특허/상표
UPDATE categories SET display_order = 2 WHERE id = 'contract-drafting'; -- 계약서 작성

-- 로고·브랜딩 (logo-branding)

-- 지도 마케팅 (map-marketing)

-- 마케팅 디자인 (marketing-design)
UPDATE categories SET display_order = 1 WHERE id = 'banner-delivery-app'; -- 배너·배달어플
UPDATE categories SET display_order = 2 WHERE id = 'broadcast-avatar'; -- 방송용 아바타
UPDATE categories SET display_order = 3 WHERE id = 'sns-ad-thumbnail'; -- SNS·광고소재·썸네일
UPDATE categories SET display_order = 4 WHERE id = 'blog-cafe-design'; -- 블로그·카페 디자인
UPDATE categories SET display_order = 5 WHERE id = 'channel-art-design'; -- 채널아트 디자인

-- 기타 마케팅 (marketing-etc)

-- 영상 번역 (media-translation)

-- 모바일 (mobile)

-- 음악 제작 (music-production)
UPDATE categories SET display_order = 1 WHERE id = 'jingle-production'; -- 징글/CM송
UPDATE categories SET display_order = 2 WHERE id = 'bgm-production'; -- BGM 제작
UPDATE categories SET display_order = 3 WHERE id = 'music-composition'; -- 작곡

-- 오피스 스킬 (office-skills)
UPDATE categories SET display_order = 1 WHERE id = 'excel-training'; -- 엑셀 교육
UPDATE categories SET display_order = 2 WHERE id = 'ppt-training'; -- PPT 교육

-- 패키지·커버 (package-cover)

-- 광고(퍼포먼스) (performance-ads)
UPDATE categories SET display_order = 1 WHERE id = 'keyword-search-ads'; -- 키워드·검색 광고
UPDATE categories SET display_order = 2 WHERE id = 'sns-ads'; -- SNS 광고

-- 사진 (photography)

-- 인쇄·판촉물 (print-promotional)
UPDATE categories SET display_order = 1 WHERE id = 'store-goods-making'; -- 가게용품 제작
UPDATE categories SET display_order = 2 WHERE id = 'souvenir-making'; -- 기념품 제작
UPDATE categories SET display_order = 3 WHERE id = 'model-making'; -- 모형 제작
UPDATE categories SET display_order = 4 WHERE id = 'product-making'; -- 제품 제작
UPDATE categories SET display_order = 5 WHERE id = 'package-making'; -- 패키지 제작
UPDATE categories SET display_order = 6 WHERE id = '3d-printing'; -- 3D프린팅
UPDATE categories SET display_order = 7 WHERE id = 'menu-board'; -- 메뉴판
UPDATE categories SET display_order = 8 WHERE id = 'business-card'; -- 명함
UPDATE categories SET display_order = 9 WHERE id = 'sticker-envelope-invitation'; -- 스티커·봉투·초대장
UPDATE categories SET display_order = 10 WHERE id = 'printing'; -- 인쇄
UPDATE categories SET display_order = 11 WHERE id = 'flyer-poster-print'; -- 전단지·포스터·인쇄물

-- 인쇄물 (printing-materials)

-- 전문 분야 번역 (professional-translation)
UPDATE categories SET display_order = 1 WHERE id = 'academic-translation'; -- 학술 번역
UPDATE categories SET display_order = 2 WHERE id = 'technical-translation'; -- 기술 번역
UPDATE categories SET display_order = 3 WHERE id = 'legal-translation'; -- 법률 번역
UPDATE categories SET display_order = 4 WHERE id = 'medical-translation'; -- 의료 번역

-- 프로그램 (program)
UPDATE categories SET display_order = 1 WHERE id = 'excel-spreadsheet'; -- 엑셀·스프레드시트
UPDATE categories SET display_order = 2 WHERE id = 'complete-program-store'; -- 완성형 프로그램 스토어
UPDATE categories SET display_order = 3 WHERE id = 'bot-chatbot'; -- 봇·챗봇
UPDATE categories SET display_order = 4 WHERE id = 'server-cloud'; -- 서버·클라우드
UPDATE categories SET display_order = 5 WHERE id = 'revenue-automation'; -- 수익 자동화
UPDATE categories SET display_order = 6 WHERE id = 'work-automation'; -- 업무 자동화

-- 교정·첨삭 (proofreading-revision)

-- 심리 상담 (psychological-counseling)

-- 보안·품질관리 (security-quality)
UPDATE categories SET display_order = 1 WHERE id = 'information-security'; -- 정보 보안
UPDATE categories SET display_order = 2 WHERE id = 'qa-test'; -- QA·테스트

-- SEO 최적화 노출 (seo-optimization)
UPDATE categories SET display_order = 3 WHERE id = 'keyword-competitor-analysis'; -- 키워드·경쟁사 분석
UPDATE categories SET display_order = 4 WHERE id = 'backlink-traffic'; -- 백링크·트래픽
UPDATE categories SET display_order = 5 WHERE id = 'popular-post-management'; -- 인기게시물 관리

-- 공간·건축 (space-architecture)
UPDATE categories SET display_order = 2 WHERE id = 'drawing-creation-modification'; -- 도면 제작·수정
UPDATE categories SET display_order = 3 WHERE id = 'signboard-construction'; -- 간판·시공

-- 스타트업 자문 (startup-consulting)
UPDATE categories SET display_order = 1 WHERE id = 'vision-mission-branding'; -- 비전·미션·초기 브랜딩
UPDATE categories SET display_order = 2 WHERE id = 'personal-org-goal-management'; -- 개인·조직 목표 관리

-- 타로 리딩 (tarot-reading)

-- 세무·회계 (tax-accounting)

-- 기타 (tax-legal-labor-etc)

-- 템플릿 (templates)
UPDATE categories SET display_order = 1 WHERE id = 'notion-template'; -- 노션 템플릿
UPDATE categories SET display_order = 2 WHERE id = 'excel-template'; -- 엑셀 템플릿
UPDATE categories SET display_order = 3 WHERE id = 'ppt-template'; -- PPT 템플릿

-- 논문·자료 조사 (thesis-research)
UPDATE categories SET display_order = 2 WHERE id = 'thesis-statistics-analysis'; -- 논문 통계분석
UPDATE categories SET display_order = 3 WHERE id = 'data-research'; -- 자료 조사
UPDATE categories SET display_order = 4 WHERE id = 'thesis-consulting'; -- 논문 컨설팅

-- 트렌드 (trend-tech)

-- 타이핑·편집 (typing-editing)

-- 영상 (video)
UPDATE categories SET display_order = 2 WHERE id = 'youtube-video'; -- 유튜브 영상
UPDATE categories SET display_order = 3 WHERE id = 'educational-video'; -- 교육 영상
UPDATE categories SET display_order = 4 WHERE id = 'short-form-video'; -- 숏폼 영상
UPDATE categories SET display_order = 5 WHERE id = 'industry-video'; -- 업종별 영상
UPDATE categories SET display_order = 6 WHERE id = 'video-post-production'; -- 영상 후반작업

-- 기타 (video-photo-etc)

-- 바이럴·협찬 (viral-sponsorship)

-- 보이스/나레이션 (voice-narration)
UPDATE categories SET display_order = 1 WHERE id = 'voice-over'; -- 성우/나레이션
UPDATE categories SET display_order = 2 WHERE id = 'audiobook'; -- 오디오북
UPDATE categories SET display_order = 3 WHERE id = 'ars-recording'; -- ARS 녹음

-- 웹빌더 (web-builder)
UPDATE categories SET display_order = 1 WHERE id = 'notion-web'; -- 노션
UPDATE categories SET display_order = 2 WHERE id = 'imweb'; -- 아임웹
UPDATE categories SET display_order = 3 WHERE id = 'gnuboard'; -- 그누보드

-- 웹 제작 (web-creation)
UPDATE categories SET display_order = 1 WHERE id = 'homepage-new-creation'; -- 홈페이지 신규 제작
UPDATE categories SET display_order = 3 WHERE id = 'landing-page'; -- 랜딩페이지

-- 웹 유지보수 (web-maintenance)
UPDATE categories SET display_order = 1 WHERE id = 'homepage-modification-maintenance'; -- 홈페이지 수정·유지보수
UPDATE categories SET display_order = 2 WHERE id = 'search-optimization-seo'; -- 검색최적화·SEO
UPDATE categories SET display_order = 3 WHERE id = 'shopping-mall-modification-maintenance'; -- 쇼핑몰 수정·유지보수
UPDATE categories SET display_order = 4 WHERE id = 'analytics'; -- 애널리틱스
UPDATE categories SET display_order = 5 WHERE id = 'publishing'; -- 퍼블리싱

-- 웹·모바일 디자인 (web-mobile-design)
UPDATE categories SET display_order = 1 WHERE id = 'web-ui-ux'; -- 웹 UI·UX
UPDATE categories SET display_order = 2 WHERE id = 'template-homepage'; -- 템플릿형 홈페이지
UPDATE categories SET display_order = 3 WHERE id = 'app-mobile-ui-ux'; -- 앱·모바일 UI·UX
UPDATE categories SET display_order = 4 WHERE id = 'icon-button'; -- 아이콘·버튼

-- 기타 (writing-etc)

-- ========================================
-- 확인 쿼리
-- ========================================

-- 각 2차 카테고리별 처음 5개 확인
WITH ranked AS (
  SELECT
    c2.name as cat2,
    c3.name as cat3,
    c3.display_order,
    ROW_NUMBER() OVER (PARTITION BY c2.id ORDER BY c3.display_order) as rn
  FROM categories c2
  JOIN categories c3 ON c3.parent_id = c2.id
  WHERE c3.level = 3
)
SELECT
  cat2 as "2차_카테고리",
  cat3 as "3차_카테고리",
  display_order as "순서"
FROM ranked
WHERE rn <= 5
ORDER BY cat2, display_order;

-- "기타" 항목이 마지막에 있는지 확인
SELECT
  c2.name as "2차_카테고리",
  c3.name as "3차_카테고리",
  c3.display_order as "순서",
  (
    SELECT MAX(display_order)
    FROM categories
    WHERE parent_id = c3.parent_id AND level = 3
  ) as "최대순서"
FROM categories c2
JOIN categories c3 ON c3.parent_id = c2.id
WHERE c3.level = 3
  AND (c3.name LIKE '%기타%' OR c3.slug LIKE '%etc%' OR c3.slug LIKE '%other%')
ORDER BY c2.name;

-- 총 개수 확인
SELECT
  '업데이트된 3차 카테고리' as "결과",
  COUNT(*) as "개수"
FROM categories
WHERE level = 3;
