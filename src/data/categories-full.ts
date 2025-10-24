export interface CategoryItem {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  keywords?: string[]
  parent_id?: string
  children?: CategoryItem[]
  is_popular?: boolean
  is_ai?: boolean
  service_count?: number
  popularity_score?: number  // 클릭수/인기도 점수 (높을수록 인기)
}

export const FULL_CATEGORIES: CategoryItem[] = [
  // =============== 1. 생활 서비스 ===============
  {
    id: 'life-service',
    name: '생활 서비스',
    slug: 'life-service',
    icon: 'home',
    service_count: 35,
    popularity_score: 88,
    description: '일상 생활 편의 서비스',
    children: [
      {
        id: 'home-service',
        name: '가정 서비스',
        slug: 'home-service',
        parent_id: 'life-service',
        children: [
          { id: 'cleaning-service', name: '청소 서비스', slug: 'cleaning-service', parent_id: 'home-service', is_popular: true },
          { id: 'housekeeping', name: '파출부/가사도우미', slug: 'housekeeping', parent_id: 'home-service', is_popular: true },
          { id: 'organizing-consulting', name: '정리정돈/수납 컨설팅', slug: 'organizing-consulting', parent_id: 'home-service' },
          { id: 'appliance-install', name: '가전 설치/수리', slug: 'appliance-install', parent_id: 'home-service' },
          { id: 'aircon-cleaning', name: '에어컨 청소', slug: 'aircon-cleaning', parent_id: 'home-service' },
          { id: 'pest-control', name: '해충방제/방역', slug: 'pest-control', parent_id: 'home-service' },
          { id: 'disinfection-service', name: '소독 서비스', slug: 'disinfection-service', parent_id: 'home-service' },
          { id: 'repair-service', name: '일반 수리 서비스', slug: 'repair-service', parent_id: 'home-service' },
          { id: 'moving-service', name: '이사 서비스', slug: 'moving-service', parent_id: 'home-service', is_popular: true },
        ]
      },
      {
        id: 'daily-service',
        name: '일상 서비스',
        slug: 'daily-service',
        parent_id: 'life-service',
        children: [
          { id: 'laundry-service', name: '세탁 서비스', slug: 'laundry-service', parent_id: 'daily-service' },
          { id: 'pet-care', name: '반려동물 케어', slug: 'pet-care', parent_id: 'daily-service', is_popular: true },
          { id: 'pet-walking', name: '반려동물 산책 대행', slug: 'pet-walking', parent_id: 'daily-service' },
          { id: 'pet-grooming', name: '반려동물 미용', slug: 'pet-grooming', parent_id: 'daily-service' },
          { id: 'babysitter', name: '베이비시터', slug: 'babysitter', parent_id: 'daily-service', is_popular: true },
          { id: 'senior-care', name: '시니어 케어/간병', slug: 'senior-care', parent_id: 'daily-service' },
        ]
      },
      {
        id: 'vehicle-service',
        name: '차량 서비스',
        slug: 'vehicle-service',
        parent_id: 'life-service',
        children: [
          { id: 'car-wash', name: '세차 서비스', slug: 'car-wash', parent_id: 'vehicle-service' },
          { id: 'car-maintenance', name: '차량 정비 예약 대행', slug: 'car-maintenance', parent_id: 'vehicle-service' },
          { id: 'designated-driver', name: '대리 운전', slug: 'designated-driver', parent_id: 'vehicle-service' },
          { id: 'chauffeur-service', name: '운전 기사', slug: 'chauffeur-service', parent_id: 'vehicle-service' },
        ]
      },
      {
        id: 'booking-agency',
        name: '예약/대행 서비스',
        slug: 'booking-agency',
        parent_id: 'life-service',
        children: [
          { id: 'queue-waiting', name: '줄서기 대행', slug: 'queue-waiting', parent_id: 'booking-agency' },
          { id: 'restaurant-booking', name: '레스토랑 예약 대행', slug: 'restaurant-booking', parent_id: 'booking-agency' },
          { id: 'hospital-booking', name: '병원 예약/동행', slug: 'hospital-booking', parent_id: 'booking-agency' },
          { id: 'government-office', name: '관공서 업무 대행', slug: 'government-office', parent_id: 'booking-agency' },
          { id: 'interpretation-companion', name: '통역 동행', slug: 'interpretation-companion', parent_id: 'booking-agency' },
        ]
      },
      {
        id: 'rental-service',
        name: '렌탈 서비스',
        slug: 'rental-service',
        parent_id: 'life-service',
        children: [
          { id: 'appliance-rental', name: '가전 렌탈', slug: 'appliance-rental', parent_id: 'rental-service' },
          { id: 'living-goods-rental', name: '생활용품 렌탈', slug: 'living-goods-rental', parent_id: 'rental-service' },
          { id: 'party-equipment-rental', name: '파티/이벤트 용품 렌탈', slug: 'party-equipment-rental', parent_id: 'rental-service' },
        ]
      }
    ]
  },

  // =============== 2. 심부름 ===============
  {
    id: 'errands',
    name: '심부름',
    slug: 'errands',
    icon: 'motorcycle',
    service_count: 13,
    popularity_score: 75,
    description: '빠른 배달 및 심부름 서비스',
    children: [
      {
        id: 'delivery-service',
        name: '배달 서비스',
        slug: 'delivery-service',
        parent_id: 'errands',
        children: [
          { id: 'quick-delivery', name: '퀵 서비스', slug: 'quick-delivery', parent_id: 'delivery-service', is_popular: true },
          { id: 'document-delivery', name: '서류 배달', slug: 'document-delivery', parent_id: 'delivery-service' },
          { id: 'package-delivery', name: '택배 대행', slug: 'package-delivery', parent_id: 'delivery-service', is_popular: true },
          { id: 'food-delivery', name: '음식 배달 대행', slug: 'food-delivery', parent_id: 'delivery-service' },
          { id: 'medicine-delivery', name: '약 배달', slug: 'medicine-delivery', parent_id: 'delivery-service' },
          { id: 'flower-delivery', name: '꽃 배달', slug: 'flower-delivery', parent_id: 'delivery-service' },
          { id: 'gift-delivery', name: '선물 배달', slug: 'gift-delivery', parent_id: 'delivery-service' },
        ]
      },
      {
        id: 'errand-service',
        name: '심부름 대행',
        slug: 'errand-service',
        parent_id: 'errands',
        children: [
          { id: 'shopping-errands', name: '장보기 대행', slug: 'shopping-errands', parent_id: 'errand-service', is_popular: true },
          { id: 'pickup-service', name: '픽업 서비스', slug: 'pickup-service', parent_id: 'errand-service' },
          { id: 'secondhand-trade', name: '중고 거래 대행', slug: 'secondhand-trade', parent_id: 'errand-service' },
          { id: 'return-exchange', name: '반품/교환 대행', slug: 'return-exchange', parent_id: 'errand-service' },
          { id: 'postal-service', name: '우편 업무 대행', slug: 'postal-service', parent_id: 'errand-service' },
        ]
      }
    ]
  },

  // =============== 3. AI 서비스 (별도 대메뉴) ===============
  {
    id: 'ai-services',
    name: 'AI 서비스',
    slug: 'ai-services',
    icon: 'robot',
    popularity_score: 999,  // 고정
    is_ai: true,
    service_count: 16,
    children: [
      {
        id: 'ai-design',
        name: 'AI 디자인',
        slug: 'ai-design',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-illustration', name: 'AI 일러스트', slug: 'ai-illustration', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-photorealistic-model', name: 'AI 실사·모델', slug: 'ai-photorealistic-model', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-ad-material-design', name: 'AI 광고소재 디자인', slug: 'ai-ad-material-design', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-character-design', name: 'AI 캐릭터 디자인', slug: 'ai-character-design', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-product-package-design', name: 'AI 제품·패키지 디자인', slug: 'ai-product-package-design', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-space-design', name: 'AI 공간 디자인', slug: 'ai-space-design', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-retouching-composition', name: 'AI 보정·누끼·합성', slug: 'ai-retouching-composition', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-book-cover', name: 'AI 책 표지', slug: 'ai-book-cover', parent_id: 'ai-design', is_ai: true },
          { id: 'ai-design-etc', name: 'AI 디자인 기타', slug: 'ai-design-etc', parent_id: 'ai-design', is_ai: true },
        ]
      },
      {
        id: 'ai-image',
        name: 'AI 이미지',
        slug: 'ai-image',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-image-creation-retouching', name: 'AI 이미지 제작·누끼·보정', slug: 'ai-image-creation-retouching', parent_id: 'ai-image', is_ai: true },
          { id: 'ai-product-photo', name: 'AI 제품 사진', slug: 'ai-product-photo', parent_id: 'ai-image', is_ai: true },
          { id: 'ai-upscaling', name: 'AI 업스케일링(화질 개선)', slug: 'ai-upscaling', parent_id: 'ai-image', is_ai: true },
          { id: 'ai-hair-model', name: 'AI 헤어 모델', slug: 'ai-hair-model', parent_id: 'ai-image', is_ai: true },
          { id: 'ai-ad-model', name: 'AI 광고 모델', slug: 'ai-ad-model', parent_id: 'ai-image', is_ai: true },
        ]
      },
      {
        id: 'ai-development',
        name: 'AI 개발',
        slug: 'ai-development',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'custom-chatbot-gpt', name: '맞춤형 챗봇·GPT', slug: 'custom-chatbot-gpt', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-system-service', name: 'AI 시스템·서비스', slug: 'ai-system-service', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-automation-program', name: 'AI 자동화 프로그램', slug: 'ai-automation-program', parent_id: 'ai-development', is_ai: true },
          { id: 'prompt-engineering', name: '프롬프트 설계(엔지니어링)', slug: 'prompt-engineering', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-modeling-optimization', name: 'AI 모델링·최적화', slug: 'ai-modeling-optimization', parent_id: 'ai-development', is_ai: true },
          { id: 'image-voice-recognition', name: '이미지·음성 인식', slug: 'image-voice-recognition', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-feature-development-integration', name: 'AI 기능 개발·연동', slug: 'ai-feature-development-integration', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-agent', name: 'AI 에이전트', slug: 'ai-agent', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-data-analysis', name: 'AI 데이터 분석', slug: 'ai-data-analysis', parent_id: 'ai-development', is_ai: true },
          { id: 'ai-introduction-consulting', name: 'AI 도입 컨설팅', slug: 'ai-introduction-consulting', parent_id: 'ai-development', is_ai: true },
          { id: 'natural-language-processing', name: '자연어 처리', slug: 'natural-language-processing', parent_id: 'ai-development', is_ai: true },
        ]
      },
      {
        id: 'ai-prompt',
        name: 'AI 프롬프트',
        slug: 'ai-prompt',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-prompt-child', name: 'AI 프롬프트', slug: 'ai-prompt-child', parent_id: 'ai-prompt', is_ai: true },
        ]
      },
      {
        id: 'ai-marketing',
        name: 'AI 마케팅',
        slug: 'ai-marketing',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-marketing-content', name: 'AI 마케팅 콘텐츠', slug: 'ai-marketing-content', parent_id: 'ai-marketing', is_ai: true },
          { id: 'ai-aeo-geo', name: 'AI AEO·GEO', slug: 'ai-aeo-geo', parent_id: 'ai-marketing', is_ai: true },
          { id: 'ai-short-form-ad-production', name: 'AI 숏폼 광고 제작', slug: 'ai-short-form-ad-production', parent_id: 'ai-marketing', is_ai: true },
          { id: 'ai-marketing-consulting', name: 'AI 마케팅 컨설팅', slug: 'ai-marketing-consulting', parent_id: 'ai-marketing', is_ai: true },
          { id: 'ai-marketing-etc', name: 'AI 마케팅 기타', slug: 'ai-marketing-etc', parent_id: 'ai-marketing', is_ai: true },
        ]
      },
      {
        id: 'ai-video',
        name: 'AI 영상',
        slug: 'ai-video',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-ad-video', name: 'AI 광고 영상', slug: 'ai-ad-video', parent_id: 'ai-video', is_ai: true },
          { id: 'ai-short-form-video', name: 'AI 숏폼 영상', slug: 'ai-short-form-video', parent_id: 'ai-video', is_ai: true },
          { id: 'ai-video-editing-retouching-captioning', name: 'AI 영상 편집·보정·자막', slug: 'ai-video-editing-retouching-captioning', parent_id: 'ai-video', is_ai: true },
        ]
      },
      {
        id: 'ai-sound',
        name: 'AI 음향',
        slug: 'ai-sound',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-music', name: 'AI 음원', slug: 'ai-music', parent_id: 'ai-sound', is_ai: true },
          { id: 'ai-dubbing-narration', name: 'AI 더빙·나레이션', slug: 'ai-dubbing-narration', parent_id: 'ai-sound', is_ai: true },
        ]
      },
      {
        id: 'ai-content-writing',
        name: 'AI 콘텐츠 라이팅',
        slug: 'ai-content-writing',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-content-production', name: 'AI 콘텐츠 생산', slug: 'ai-content-production', parent_id: 'ai-content-writing', is_ai: true },
          { id: 'ai-content-review-editing', name: 'AI 콘텐츠 검수·편집', slug: 'ai-content-review-editing', parent_id: 'ai-content-writing', is_ai: true },
        ]
      },
      {
        id: 'ai-startup-monetization',
        name: 'AI 창업·수익화',
        slug: 'ai-startup-monetization',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-business-monetization-ebook', name: 'AI 사업·수익화 전자책', slug: 'ai-business-monetization-ebook', parent_id: 'ai-startup-monetization', is_ai: true },
          { id: 'ai-startup-consulting', name: 'AI 창업 자문', slug: 'ai-startup-consulting', parent_id: 'ai-startup-monetization', is_ai: true },
          { id: 'ai-management-operation-consulting', name: 'AI 경영·운영 자문', slug: 'ai-management-operation-consulting', parent_id: 'ai-startup-monetization', is_ai: true },
        ]
      },
      {
        id: 'ai-employment-admission',
        name: 'AI 취업·입시',
        slug: 'ai-employment-admission',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-employment-admission-consulting', name: 'AI 취업·입시 컨설팅', slug: 'ai-employment-admission-consulting', parent_id: 'ai-employment-admission', is_ai: true },
        ]
      },
      {
        id: 'ai-education',
        name: 'AI 교육',
        slug: 'ai-education',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-skill-ebook', name: 'AI 스킬 전자책', slug: 'ai-skill-ebook', parent_id: 'ai-education', is_ai: true },
          { id: 'ai-work-utilization-lesson', name: 'AI 업무 활용 레슨', slug: 'ai-work-utilization-lesson', parent_id: 'ai-education', is_ai: true },
          { id: 'ai-development-analysis-lesson', name: 'AI 개발·분석 레슨', slug: 'ai-development-analysis-lesson', parent_id: 'ai-education', is_ai: true },
          { id: 'ai-marketing-lesson', name: 'AI 마케팅 레슨', slug: 'ai-marketing-lesson', parent_id: 'ai-education', is_ai: true },
          { id: 'ai-content-production-lesson', name: 'AI 콘텐츠 제작 레슨', slug: 'ai-content-production-lesson', parent_id: 'ai-education', is_ai: true },
          { id: 'etc-ai-lesson', name: '기타 AI 레슨', slug: 'etc-ai-lesson', parent_id: 'ai-education', is_ai: true },
        ]
      },
      {
        id: 'ai-translation-interpretation',
        name: 'AI 통·번역',
        slug: 'ai-translation-interpretation',
        parent_id: 'ai-services',
        is_ai: true,
        children: [
          { id: 'ai-translation-review-editing', name: 'AI 번역 검수·편집', slug: 'ai-translation-review-editing', parent_id: 'ai-translation-interpretation', is_ai: true },
          { id: 'ai-interpretation', name: 'AI 통역', slug: 'ai-interpretation', parent_id: 'ai-translation-interpretation', is_ai: true },
        ]
      },
    ]
  },

  // =============== 4. 디자인 ===============
  {
    id: 'design',
    name: '디자인',
    slug: 'design',
    icon: 'palette',
    service_count: 58,
    popularity_score: 95,
    description: '창의적인 디자인 솔루션',
    children: [
      {
        id: 'logo-branding',
        name: '로고·브랜딩',
        slug: 'logo-branding',
        parent_id: 'design',
        children: [
          { id: 'logo-design', name: '로고 디자인', slug: 'logo-design', parent_id: 'logo-branding', is_popular: true },
          { id: 'brand-design-guide', name: '브랜드 디자인·가이드', slug: 'brand-design-guide', parent_id: 'logo-branding' },
        ]
      },
      {
        id: 'print-promotional',
        name: '인쇄·홍보물',
        slug: 'print-promotional',
        parent_id: 'design',
        children: [
          { id: 'business-card', name: '명함', slug: 'business-card', parent_id: 'print-promotional' },
          { id: 'flyer-poster-print', name: '전단지·포스터·인쇄물', slug: 'flyer-poster-print', parent_id: 'print-promotional' },
          { id: 'banner-x-banner', name: '현수막·X배너', slug: 'banner-x-banner', parent_id: 'print-promotional' },
          { id: 'menu-board', name: '메뉴판', slug: 'menu-board', parent_id: 'print-promotional' },
          { id: 'promotional-print-output', name: '홍보물 인쇄·출력', slug: 'promotional-print-output', parent_id: 'print-promotional' },
          { id: 'sticker-envelope-invitation', name: '스티커·봉투·초대장', slug: 'sticker-envelope-invitation', parent_id: 'print-promotional' },
        ]
      },
      {
        id: 'web-mobile-design',
        name: '웹·모바일 디자인',
        slug: 'web-mobile-design',
        parent_id: 'design',
        children: [
          { id: 'web-ui-ux', name: '웹 UI·UX', slug: 'web-ui-ux', parent_id: 'web-mobile-design', is_popular: true },
          { id: 'app-mobile-ui-ux', name: '앱·모바일 UI·UX', slug: 'app-mobile-ui-ux', parent_id: 'web-mobile-design', is_popular: true },
          { id: 'template-homepage', name: '템플릿형 홈페이지', slug: 'template-homepage', parent_id: 'web-mobile-design' },
          { id: 'icon-button', name: '아이콘·버튼', slug: 'icon-button', parent_id: 'web-mobile-design' },
        ]
      },
      {
        id: 'ai-design',
        name: 'AI 디자인',
        slug: 'ai-design',
        parent_id: 'design',
        children: [
          { id: 'ai-design-service', name: 'AI 디자인', slug: 'ai-design-service', parent_id: 'ai-design', is_popular: true },
        ]
      },
      {
        id: 'marketing-design',
        name: '마케팅 디자인',
        slug: 'marketing-design',
        parent_id: 'design',
        children: [
          { id: 'detail-page', name: '상세페이지', slug: 'detail-page', parent_id: 'marketing-design', is_popular: true },
          { id: 'sns-ad-thumbnail', name: 'SNS·광고소재·썸네일', slug: 'sns-ad-thumbnail', parent_id: 'marketing-design', is_popular: true },
          { id: 'channel-art-design', name: '채널아트 디자인', slug: 'channel-art-design', parent_id: 'marketing-design' },
          { id: 'broadcast-avatar', name: '방송용 아바타', slug: 'broadcast-avatar', parent_id: 'marketing-design' },
          { id: 'banner-delivery-app', name: '배너·배달어플', slug: 'banner-delivery-app', parent_id: 'marketing-design' },
          { id: 'blog-cafe-design', name: '블로그·카페 디자인', slug: 'blog-cafe-design', parent_id: 'marketing-design' },
        ]
      },
      {
        id: 'package-cover',
        name: '패키지·커버',
        slug: 'package-cover',
        parent_id: 'design',
        children: [
          { id: 'package', name: '패키지', slug: 'package', parent_id: 'package-cover' },
          { id: 'book-cover-interior', name: '책표지·내지', slug: 'book-cover-interior', parent_id: 'package-cover' },
          { id: 'ebook-cover-interior', name: '전자책 표지·내지', slug: 'ebook-cover-interior', parent_id: 'package-cover' },
          { id: 'album-cover', name: '앨범커버', slug: 'album-cover', parent_id: 'package-cover' },
        ]
      },
      {
        id: 'character-illustration',
        name: '캐릭터·일러스트',
        slug: 'character-illustration',
        parent_id: 'design',
        children: [
          { id: 'illustration', name: '일러스트', slug: 'illustration', parent_id: 'character-illustration', is_popular: true },
          { id: 'caricature', name: '캐리커쳐', slug: 'caricature', parent_id: 'character-illustration' },
          { id: 'webtoon-storyboard', name: '웹툰·콘티', slug: 'webtoon-storyboard', parent_id: 'character-illustration' },
          { id: '2d-character', name: '2D 캐릭터', slug: '2d-character', parent_id: 'character-illustration' },
          { id: 'emoticon', name: '이모티콘', slug: 'emoticon', parent_id: 'character-illustration' },
        ]
      },
      {
        id: 'graphic-design',
        name: '그래픽 디자인',
        slug: 'graphic-design',
        parent_id: 'design',
        children: [
          { id: 'ppt-infographic', name: 'PPT·인포그래픽', slug: 'ppt-infographic', parent_id: 'graphic-design', is_popular: true },
          { id: 'photoshop-file-conversion', name: '포토샵·파일변환', slug: 'photoshop-file-conversion', parent_id: 'graphic-design' },
        ]
      },
      {
        id: '3d-design',
        name: '3D 디자인',
        slug: '3d-design',
        parent_id: 'design',
        children: [
          { id: '3d-character-figure', name: '3D 캐릭터·피규어', slug: '3d-character-figure', parent_id: '3d-design' },
          { id: '3d-product-modeling-rendering', name: '3D 제품모델링·렌더링', slug: '3d-product-modeling-rendering', parent_id: '3d-design' },
          { id: '3d-space-modeling', name: '3D 공간 모델링', slug: '3d-space-modeling', parent_id: '3d-design' },
          { id: '3d-clothing-jewelry', name: '3D 의류·쥬얼리', slug: '3d-clothing-jewelry', parent_id: '3d-design' },
          { id: '3d-game-source', name: '3D 게임용 소스', slug: '3d-game-source', parent_id: '3d-design' },
          { id: '3d-graphics', name: '3D 그래픽', slug: '3d-graphics', parent_id: '3d-design' },
          { id: 'prototype-3d-printing', name: '시제품·3D프린팅', slug: 'prototype-3d-printing', parent_id: '3d-design' },
        ]
      },
      {
        id: 'game-web3',
        name: '게임·웹3.0',
        slug: 'game-web3',
        parent_id: 'design',
        children: [
          { id: 'vr-ar-game', name: 'VR·AR·게임', slug: 'vr-ar-game', parent_id: 'game-web3' },
          { id: 'metaverse', name: '메타버스', slug: 'metaverse', parent_id: 'game-web3' },
          { id: 'nft-art', name: 'NFT아트', slug: 'nft-art', parent_id: 'game-web3' },
        ]
      },
      {
        id: 'industrial-product-design',
        name: '산업·제품 디자인',
        slug: 'industrial-product-design',
        parent_id: 'design',
        children: [
          { id: 'product-mechanism-design', name: '제품·기구 설계', slug: 'product-mechanism-design', parent_id: 'industrial-product-design' },
          { id: 'product-drawing-sketch', name: '제품 도면·스케치', slug: 'product-drawing-sketch', parent_id: 'industrial-product-design' },
        ]
      },
      {
        id: 'space-architecture',
        name: '공간·건축',
        slug: 'space-architecture',
        parent_id: 'design',
        children: [
          { id: 'drawing-creation-modification', name: '도면 제작·수정', slug: 'drawing-creation-modification', parent_id: 'space-architecture' },
          { id: 'interior-consulting', name: '인테리어 컨설팅', slug: 'interior-consulting', parent_id: 'space-architecture' },
          { id: 'exhibition-stage-design', name: '전시·무대 디자인', slug: 'exhibition-stage-design', parent_id: 'space-architecture' },
          { id: 'signboard-construction', name: '간판·시공', slug: 'signboard-construction', parent_id: 'space-architecture' },
        ]
      },
      {
        id: 'calligraphy-font',
        name: '캘리그라피·폰트',
        slug: 'calligraphy-font',
        parent_id: 'design',
        children: [
          { id: 'calligraphy', name: '캘리그라피', slug: 'calligraphy', parent_id: 'calligraphy-font' },
          { id: 'typography', name: '타이포그래피', slug: 'typography', parent_id: 'calligraphy-font' },
          { id: 'font-design', name: '폰트', slug: 'font-design', parent_id: 'calligraphy-font' },
          { id: 'signature-seal', name: '사인·직인', slug: 'signature-seal', parent_id: 'calligraphy-font' },
        ]
      },
      {
        id: 'fashion-textile',
        name: '패션·텍스타일',
        slug: 'fashion-textile',
        parent_id: 'design',
        children: [
          { id: 'clothing-jewelry-design', name: '의류·쥬얼리 디자인', slug: 'clothing-jewelry-design', parent_id: 'fashion-textile' },
          { id: 'work-instruction-diagram', name: '작업지시서·도식화', slug: 'work-instruction-diagram', parent_id: 'fashion-textile' },
          { id: 'pattern-sample-production', name: '패턴·샘플제작', slug: 'pattern-sample-production', parent_id: 'fashion-textile' },
        ]
      },
      {
        id: 'design-etc',
        name: '기타',
        slug: 'design-etc',
        parent_id: 'design',
        children: [
          { id: 'designer-subscription', name: '디자이너 구독제', slug: 'designer-subscription', parent_id: 'design-etc' },
          { id: 'design-template', name: '디자인 템플릿', slug: 'design-template', parent_id: 'design-etc' },
          { id: 'ai-prompt-design', name: 'AI 프롬프트', slug: 'ai-prompt-design', parent_id: 'design-etc' },
          { id: 'barcode-qr-code', name: '바코드·QR코드', slug: 'barcode-qr-code', parent_id: 'design-etc' },
          { id: 'other-design', name: '기타 디자인', slug: 'other-design', parent_id: 'design-etc' },
        ]
      }
    ]
  },

  // =============== 5. IT/프로그래밍 ===============
  {
    id: 'it-programming',
    name: 'IT/프로그래밍',
    slug: 'it-programming',
    icon: 'code',
    service_count: 66,
    popularity_score: 999,  // 고정
    description: '웹, 앱, 소프트웨어 개발',
    children: [
      {
        id: 'web-builder',
        name: '웹빌더',
        slug: 'web-builder',
        parent_id: 'it-programming',
        children: [
          { id: 'rhymix', name: '라이믹스', slug: 'rhymix', parent_id: 'web-builder' },
          { id: 'gnuboard', name: '그누보드', slug: 'gnuboard', parent_id: 'web-builder' },
          { id: 'wordpress', name: '워드프레스', slug: 'wordpress', parent_id: 'web-builder', is_popular: true },
          { id: 'cafe24', name: '카페24', slug: 'cafe24', parent_id: 'web-builder' },
          { id: 'imweb', name: '아임웹', slug: 'imweb', parent_id: 'web-builder' },
          { id: 'notion-web', name: '노션', slug: 'notion-web', parent_id: 'web-builder' },
          { id: 'shopify', name: '쇼피파이', slug: 'shopify', parent_id: 'web-builder' },
          { id: 'wix', name: '윅스', slug: 'wix', parent_id: 'web-builder' },
        ]
      },
      {
        id: 'web-creation',
        name: '웹 제작',
        slug: 'web-creation',
        parent_id: 'it-programming',
        children: [
          { id: 'homepage-new-creation', name: '홈페이지 신규 제작', slug: 'homepage-new-creation', parent_id: 'web-creation', is_popular: true },
          { id: 'shopping-mall-new-creation', name: '쇼핑몰 신규 제작', slug: 'shopping-mall-new-creation', parent_id: 'web-creation', is_popular: true },
          { id: 'landing-page', name: '랜딩페이지', slug: 'landing-page', parent_id: 'web-creation' },
        ]
      },
      {
        id: 'web-maintenance',
        name: '웹 유지보수',
        slug: 'web-maintenance',
        parent_id: 'it-programming',
        children: [
          { id: 'homepage-modification-maintenance', name: '홈페이지 수정·유지보수', slug: 'homepage-modification-maintenance', parent_id: 'web-maintenance' },
          { id: 'shopping-mall-modification-maintenance', name: '쇼핑몰 수정·유지보수', slug: 'shopping-mall-modification-maintenance', parent_id: 'web-maintenance' },
          { id: 'publishing', name: '퍼블리싱', slug: 'publishing', parent_id: 'web-maintenance' },
          { id: 'search-optimization-seo', name: '검색최적화·SEO', slug: 'search-optimization-seo', parent_id: 'web-maintenance', is_popular: true },
          { id: 'analytics', name: '애널리틱스', slug: 'analytics', parent_id: 'web-maintenance' },
        ]
      },
      {
        id: 'program',
        name: '프로그램',
        slug: 'program',
        parent_id: 'it-programming',
        children: [
          { id: 'complete-program-store', name: '완성형 프로그램 스토어', slug: 'complete-program-store', parent_id: 'program' },
          { id: 'revenue-automation', name: '수익 자동화', slug: 'revenue-automation', parent_id: 'program', is_popular: true },
          { id: 'work-automation', name: '업무 자동화', slug: 'work-automation', parent_id: 'program', is_popular: true },
          { id: 'crawling-scraping', name: '크롤링·스크래핑', slug: 'crawling-scraping', parent_id: 'program' },
          { id: 'general-program', name: '일반 프로그램', slug: 'general-program', parent_id: 'program' },
          { id: 'program-modification-maintenance', name: '프로그램 수정·유지보수', slug: 'program-modification-maintenance', parent_id: 'program' },
          { id: 'server-cloud', name: '서버·클라우드', slug: 'server-cloud', parent_id: 'program' },
          { id: 'excel-spreadsheet', name: '엑셀·스프레드시트', slug: 'excel-spreadsheet', parent_id: 'program' },
          { id: 'bot-chatbot', name: '봇·챗봇', slug: 'bot-chatbot', parent_id: 'program' },
        ]
      },
      {
        id: 'mobile',
        name: '모바일',
        slug: 'mobile',
        parent_id: 'it-programming',
        children: [
          { id: 'app', name: '앱', slug: 'app', parent_id: 'mobile', is_popular: true },
          { id: 'app-packaging', name: '앱 패키징', slug: 'app-packaging', parent_id: 'mobile' },
          { id: 'app-modification-maintenance', name: '앱 수정·유지보수', slug: 'app-modification-maintenance', parent_id: 'mobile' },
        ]
      },
      {
        id: 'security-quality',
        name: '보안·품질관리',
        slug: 'security-quality',
        parent_id: 'it-programming',
        children: [
          { id: 'information-security', name: '정보 보안', slug: 'information-security', parent_id: 'security-quality' },
          { id: 'qa-test', name: 'QA·테스트', slug: 'qa-test', parent_id: 'security-quality' },
        ]
      },
      {
        id: 'ai-it',
        name: 'AI',
        slug: 'ai-it',
        parent_id: 'it-programming',
        children: [
          { id: 'ai-system-service-it', name: 'AI 시스템·서비스', slug: 'ai-system-service-it', parent_id: 'ai-it' },
          { id: 'custom-chatbot-gpt-it', name: '맞춤형 챗봇·GPT', slug: 'custom-chatbot-gpt-it', parent_id: 'ai-it', is_popular: true },
          { id: 'ai-automation-program-it', name: 'AI 자동화 프로그램', slug: 'ai-automation-program-it', parent_id: 'ai-it' },
          { id: 'prompt-engineering-it', name: '프롬프트 설계(엔지니어링)', slug: 'prompt-engineering-it', parent_id: 'ai-it' },
          { id: 'ai-modeling-optimization-it', name: 'AI 모델링·최적화', slug: 'ai-modeling-optimization-it', parent_id: 'ai-it' },
          { id: 'image-voice-recognition-it', name: '이미지·음성 인식', slug: 'image-voice-recognition-it', parent_id: 'ai-it' },
          { id: 'ai-feature-development-integration-it', name: 'AI 기능 개발·연동', slug: 'ai-feature-development-integration-it', parent_id: 'ai-it' },
          { id: 'ai-agent-it', name: 'AI 에이전트', slug: 'ai-agent-it', parent_id: 'ai-it' },
          { id: 'ai-data-analysis-it', name: 'AI 데이터 분석', slug: 'ai-data-analysis-it', parent_id: 'ai-it' },
          { id: 'ai-introduction-consulting-it', name: 'AI 도입 컨설팅', slug: 'ai-introduction-consulting-it', parent_id: 'ai-it' },
          { id: 'natural-language-processing-it', name: '자연어 처리', slug: 'natural-language-processing-it', parent_id: 'ai-it' },
        ]
      },
      {
        id: 'data',
        name: '데이터',
        slug: 'data',
        parent_id: 'it-programming',
        children: [
          { id: 'data-purchase-construction', name: '데이터 구매·구축', slug: 'data-purchase-construction', parent_id: 'data' },
          { id: 'data-labeling', name: '데이터 라벨링', slug: 'data-labeling', parent_id: 'data' },
          { id: 'data-preprocessing-analysis-visualization', name: '데이터 전처리·분석·시각화', slug: 'data-preprocessing-analysis-visualization', parent_id: 'data', is_popular: true },
          { id: 'database', name: '데이터베이스', slug: 'database', parent_id: 'data' },
        ]
      },
      {
        id: 'trend-tech',
        name: '트렌드',
        slug: 'trend-tech',
        parent_id: 'it-programming',
        children: [
          { id: 'game-ar-vr', name: '게임·AR·VR', slug: 'game-ar-vr', parent_id: 'trend-tech' },
          { id: 'metaverse-it', name: '메타버스', slug: 'metaverse-it', parent_id: 'trend-tech' },
          { id: 'blockchain-nft', name: '블록체인·NFT', slug: 'blockchain-nft', parent_id: 'trend-tech' },
        ]
      },
      {
        id: 'job-position',
        name: '직무직군',
        slug: 'job-position',
        parent_id: 'it-programming',
        children: [
          { id: 'ui-ux-planning', name: 'UI·UX 기획', slug: 'ui-ux-planning', parent_id: 'job-position' },
          { id: 'frontend-position', name: '프론트엔드', slug: 'frontend-position', parent_id: 'job-position' },
          { id: 'backend-position', name: '백엔드', slug: 'backend-position', parent_id: 'job-position' },
          { id: 'fullstack-position', name: '풀스택', slug: 'fullstack-position', parent_id: 'job-position' },
          { id: 'data-ml-dl', name: '데이터·ML·DL', slug: 'data-ml-dl', parent_id: 'job-position' },
          { id: 'devops-infra', name: '데브옵스·인프라', slug: 'devops-infra', parent_id: 'job-position' },
        ]
      },
      {
        id: 'it-etc',
        name: '기타',
        slug: 'it-etc',
        parent_id: 'it-programming',
        children: [
          { id: 'service-mvp-development', name: '서비스·MVP 개발', slug: 'service-mvp-development', parent_id: 'it-etc' },
          { id: 'computer-tech-support', name: '컴퓨터 기술지원', slug: 'computer-tech-support', parent_id: 'it-etc' },
          { id: 'hardware-embedded', name: '하드웨어·임베디드', slug: 'hardware-embedded', parent_id: 'it-etc' },
          { id: 'file-conversion', name: '파일변환', slug: 'file-conversion', parent_id: 'it-etc' },
          { id: 'other-programming', name: '기타 프로그래밍', slug: 'other-programming', parent_id: 'it-etc' },
        ]
      }
    ]
  },

  // =============== 6. 마케팅 ===============
  {
    id: 'marketing',
    name: '마케팅',
    slug: 'marketing',
    icon: 'bullhorn',
    service_count: 48,
    popularity_score: 90,
    description: '효과적인 마케팅 전략',
    children: [
      {
        id: 'channel-activation',
        name: '채널 활성화',
        slug: 'channel-activation',
        parent_id: 'marketing',
        children: [
          { id: 'blog-management', name: '블로그 관리', slug: 'blog-management', parent_id: 'channel-activation', is_popular: true },
          { id: 'cafe-management', name: '카페 관리', slug: 'cafe-management', parent_id: 'channel-activation' },
          { id: 'instagram-management', name: '인스타그램 관리', slug: 'instagram-management', parent_id: 'channel-activation', is_popular: true },
          { id: 'youtube-management', name: '유튜브 관리', slug: 'youtube-management', parent_id: 'channel-activation', is_popular: true },
          { id: 'reels-shorts-tiktok-management', name: '릴스·숏츠·틱톡 관리', slug: 'reels-shorts-tiktok-management', parent_id: 'channel-activation', is_popular: true },
          { id: 'threads-marketing', name: '스레드 마케팅', slug: 'threads-marketing', parent_id: 'channel-activation' },
          { id: 'linkedin-marketing', name: '링크드인 마케팅', slug: 'linkedin-marketing', parent_id: 'channel-activation' },
          { id: 'other-channel-management', name: '기타 채널 관리', slug: 'other-channel-management', parent_id: 'channel-activation' },
        ]
      },
      {
        id: 'viral-sponsorship',
        name: '바이럴·협찬',
        slug: 'viral-sponsorship',
        parent_id: 'marketing',
        children: [
          { id: 'influencer-marketing', name: '인플루언서 마케팅', slug: 'influencer-marketing', parent_id: 'viral-sponsorship', is_popular: true },
          { id: 'experience-group-recruitment', name: '체험단 모집', slug: 'experience-group-recruitment', parent_id: 'viral-sponsorship' },
          { id: 'viral-posting', name: '바이럴·포스팅', slug: 'viral-posting', parent_id: 'viral-sponsorship' },
        ]
      },
      {
        id: 'map-marketing',
        name: '지도 마케팅',
        slug: 'map-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'map-setup', name: '지도 세팅', slug: 'map-setup', parent_id: 'map-marketing' },
          { id: 'map-activation', name: '지도 활성화', slug: 'map-activation', parent_id: 'map-marketing' },
          { id: 'map-optimization-exposure', name: '지도 최적화노출', slug: 'map-optimization-exposure', parent_id: 'map-marketing', is_popular: true },
          { id: 'clip-marketing', name: '클립 마케팅', slug: 'clip-marketing', parent_id: 'map-marketing' },
        ]
      },
      {
        id: 'industry-purpose',
        name: '업종·목적별',
        slug: 'industry-purpose',
        parent_id: 'marketing',
        children: [
          { id: 'store-marketing', name: '스토어 마케팅', slug: 'store-marketing', parent_id: 'industry-purpose' },
          { id: 'press-release', name: '언론홍보', slug: 'press-release', parent_id: 'industry-purpose' },
          { id: 'app-marketing', name: '앱마케팅', slug: 'app-marketing', parent_id: 'industry-purpose' },
          { id: 'portal-qa', name: '포털질문·답변', slug: 'portal-qa', parent_id: 'industry-purpose' },
          { id: 'live-commerce', name: '라이브커머스', slug: 'live-commerce', parent_id: 'industry-purpose' },
          { id: 'industry-marketing-package', name: '업종별 마케팅 패키지', slug: 'industry-marketing-package', parent_id: 'industry-purpose' },
          { id: 'total-ad-agency', name: '종합광고대행', slug: 'total-ad-agency', parent_id: 'industry-purpose' },
          { id: 'db-marketing', name: 'DB 마케팅', slug: 'db-marketing', parent_id: 'industry-purpose' },
          { id: 'message-marketing', name: '메시지 마케팅', slug: 'message-marketing', parent_id: 'industry-purpose' },
        ]
      },
      {
        id: 'seo-optimization',
        name: 'SEO 최적화 노출',
        slug: 'seo-optimization',
        parent_id: 'marketing',
        children: [
          { id: 'technical-seo', name: '테크니컬 SEO', slug: 'technical-seo', parent_id: 'seo-optimization', is_popular: true },
          { id: 'content-seo', name: '콘텐츠 SEO', slug: 'content-seo', parent_id: 'seo-optimization', is_popular: true },
          { id: 'keyword-competitor-analysis', name: '키워드·경쟁사 분석', slug: 'keyword-competitor-analysis', parent_id: 'seo-optimization' },
          { id: 'backlink-traffic', name: '백링크·트래픽', slug: 'backlink-traffic', parent_id: 'seo-optimization' },
          { id: 'portal-optimization-exposure', name: '포털 최적화노출', slug: 'portal-optimization-exposure', parent_id: 'seo-optimization' },
          { id: 'popular-post-management', name: '인기게시물 관리', slug: 'popular-post-management', parent_id: 'seo-optimization' },
        ]
      },
      {
        id: 'global-marketing',
        name: '해외 마케팅',
        slug: 'global-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'global-press-release', name: '해외 언론홍보', slug: 'global-press-release', parent_id: 'global-marketing' },
          { id: 'global-store-channel-operation', name: '해외 쇼핑몰·채널 운영', slug: 'global-store-channel-operation', parent_id: 'global-marketing' },
          { id: 'global-store-channel-activation', name: '해외 쇼핑몰·채널 활성화', slug: 'global-store-channel-activation', parent_id: 'global-marketing' },
          { id: 'global-influencer-seeding', name: '해외 인플루언서 시딩', slug: 'global-influencer-seeding', parent_id: 'global-marketing' },
          { id: 'global-marketing-etc', name: '기타 해외 마케팅', slug: 'global-marketing-etc', parent_id: 'global-marketing' },
        ]
      },
      {
        id: 'performance-ads',
        name: '광고(퍼포먼스)',
        slug: 'performance-ads',
        parent_id: 'marketing',
        children: [
          { id: 'sns-ads', name: 'SNS 광고', slug: 'sns-ads', parent_id: 'performance-ads', is_popular: true },
          { id: 'keyword-search-ads', name: '키워드·검색 광고', slug: 'keyword-search-ads', parent_id: 'performance-ads', is_popular: true },
          { id: 'display-video-banner', name: '디스플레이·영상·배너', slug: 'display-video-banner', parent_id: 'performance-ads' },
        ]
      },
      {
        id: 'analysis-strategy',
        name: '분석·전략',
        slug: 'analysis-strategy',
        parent_id: 'marketing',
        children: [
          { id: 'marketing-consulting', name: '마케팅 컨설팅', slug: 'marketing-consulting', parent_id: 'analysis-strategy', is_popular: true },
          { id: 'brand-consulting', name: '브랜드 컨설팅', slug: 'brand-consulting', parent_id: 'analysis-strategy' },
          { id: 'data-performance-analysis', name: '데이터 성과 분석', slug: 'data-performance-analysis', parent_id: 'analysis-strategy' },
        ]
      },
      {
        id: 'ai-marketing',
        name: 'AI 마케팅',
        slug: 'ai-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'ai-marketing-service', name: 'AI 마케팅', slug: 'ai-marketing-service', parent_id: 'ai-marketing', is_popular: true },
        ]
      },
      {
        id: 'marketing-etc',
        name: '기타 마케팅',
        slug: 'marketing-etc',
        parent_id: 'marketing',
        children: [
          { id: 'outdoor-print-broadcast-ad', name: '옥외·인쇄·방송 광고', slug: 'outdoor-print-broadcast-ad', parent_id: 'marketing-etc' },
          { id: 'community-site-banner', name: '커뮤니티·사이트 배너', slug: 'community-site-banner', parent_id: 'marketing-etc' },
          { id: 'video-ad', name: '영상 광고', slug: 'video-ad', parent_id: 'marketing-etc' },
          { id: 'marketing-material-keyword', name: '마케팅 자료·키워드', slug: 'marketing-material-keyword', parent_id: 'marketing-etc' },
          { id: 'event-promotion', name: '행사·이벤트', slug: 'event-promotion', parent_id: 'marketing-etc' },
          { id: 'other-marketing', name: '기타 마케팅', slug: 'other-marketing', parent_id: 'marketing-etc' },
        ]
      }
    ]
  },

  // =============== 7. 영상/사진 ===============
  {
    id: 'video-photo',
    name: '영상/사진',
    slug: 'video-photo',
    icon: 'camera',
    service_count: 44,
    popularity_score: 85,
    description: '영상 제작 및 사진 촬영',
    children: [
      {
        id: 'video',
        name: '영상',
        slug: 'video',
        parent_id: 'video-photo',
        children: [
          { id: 'ad-promo-video', name: '광고·홍보 영상', slug: 'ad-promo-video', parent_id: 'video', is_popular: true },
          { id: 'short-form-video', name: '숏폼 영상', slug: 'short-form-video', parent_id: 'video', is_popular: true },
          { id: 'industry-video', name: '업종별 영상', slug: 'industry-video', parent_id: 'video' },
          { id: 'product-video', name: '제품 영상', slug: 'product-video', parent_id: 'video' },
          { id: 'educational-video', name: '교육 영상', slug: 'educational-video', parent_id: 'video' },
          { id: 'event-video', name: '행사 영상', slug: 'event-video', parent_id: 'video' },
          { id: 'youtube-video', name: '유튜브 영상', slug: 'youtube-video', parent_id: 'video', is_popular: true },
          { id: 'online-streaming', name: '온라인 중계', slug: 'online-streaming', parent_id: 'video' },
          { id: 'drone-filming', name: '드론 촬영', slug: 'drone-filming', parent_id: 'video' },
          { id: 'video-post-production', name: '영상 후반작업', slug: 'video-post-production', parent_id: 'video' },
          { id: 'on-site-staff', name: '현장 스탭', slug: 'on-site-staff', parent_id: 'video' },
          { id: 'video-etc', name: '영상 기타', slug: 'video-etc', parent_id: 'video' },
        ]
      },
      {
        id: 'computer-graphics',
        name: '컴퓨터 그래픽(CG)',
        slug: 'computer-graphics',
        parent_id: 'video-photo',
        children: [
          { id: 'motion-graphics', name: '모션그래픽', slug: 'motion-graphics', parent_id: 'computer-graphics', is_popular: true },
          { id: 'infographic', name: '인포그래픽', slug: 'infographic', parent_id: 'computer-graphics' },
          { id: 'media-art', name: '미디어 아트', slug: 'media-art', parent_id: 'computer-graphics' },
          { id: 'intro-logo', name: '인트로·로고', slug: 'intro-logo', parent_id: 'computer-graphics' },
          { id: 'typography-cg', name: '타이포그래피', slug: 'typography-cg', parent_id: 'computer-graphics' },
          { id: '3d-modeling-cg', name: '3D 모델링', slug: '3d-modeling-cg', parent_id: 'computer-graphics' },
          { id: 'ar-vr-xr', name: 'AR·VR·XR', slug: 'ar-vr-xr', parent_id: 'computer-graphics' },
        ]
      },
      {
        id: 'animation',
        name: '애니메이션',
        slug: 'animation',
        parent_id: 'video-photo',
        children: [
          { id: '2d-animation', name: '2D 애니메이션', slug: '2d-animation', parent_id: 'animation' },
          { id: '3d-animation', name: '3D 애니메이션', slug: '3d-animation', parent_id: 'animation' },
          { id: 'whiteboard-animation', name: '화이트보드 애니메이션', slug: 'whiteboard-animation', parent_id: 'animation' },
          { id: 'lottie-web-animation', name: '로티·web 애니메이션', slug: 'lottie-web-animation', parent_id: 'animation' },
        ]
      },
      {
        id: 'ai-content',
        name: 'AI 콘텐츠',
        slug: 'ai-content',
        parent_id: 'video-photo',
        children: [
          { id: 'ai-video', name: 'AI 영상', slug: 'ai-video', parent_id: 'ai-content', is_popular: true },
          { id: 'ai-image', name: 'AI 이미지', slug: 'ai-image', parent_id: 'ai-content', is_popular: true },
          { id: 'ai-sound', name: 'AI 음향', slug: 'ai-sound', parent_id: 'ai-content' },
        ]
      },
      {
        id: 'photography',
        name: '사진',
        slug: 'photography',
        parent_id: 'video-photo',
        children: [
          { id: 'product-promo-photography', name: '제품·홍보 사진', slug: 'product-promo-photography', parent_id: 'photography', is_popular: true },
          { id: 'personal-profile-photography', name: '개인·프로필 사진', slug: 'personal-profile-photography', parent_id: 'photography' },
          { id: 'event-snap', name: '이벤트 스냅', slug: 'event-snap', parent_id: 'photography' },
          { id: 'photo-retouching', name: '사진 보정', slug: 'photo-retouching', parent_id: 'photography', is_popular: true },
        ]
      },
      {
        id: 'audio',
        name: '음향',
        slug: 'audio',
        parent_id: 'video-photo',
        children: [
          { id: 'voice-actor', name: '성우', slug: 'voice-actor', parent_id: 'audio' },
          { id: 'music-source', name: '음악·음원', slug: 'music-source', parent_id: 'audio' },
          { id: 'audio-content', name: '오디오 콘텐츠', slug: 'audio-content', parent_id: 'audio' },
          { id: 'audio-engineering', name: '오디오 엔지니어링', slug: 'audio-engineering', parent_id: 'audio' },
          { id: 'audio-etc', name: '기타 음향·음악', slug: 'audio-etc', parent_id: 'audio' },
        ]
      },
      {
        id: 'entertainer',
        name: '엔터테이너',
        slug: 'entertainer',
        parent_id: 'video-photo',
        children: [
          { id: 'model', name: '모델', slug: 'model', parent_id: 'entertainer' },
          { id: 'actor', name: '배우', slug: 'actor', parent_id: 'entertainer' },
          { id: 'show-host', name: '쇼호스트', slug: 'show-host', parent_id: 'entertainer' },
          { id: 'mc', name: 'MC', slug: 'mc', parent_id: 'entertainer' },
          { id: 'performance', name: '공연', slug: 'performance', parent_id: 'entertainer' },
        ]
      },
      {
        id: 'video-photo-etc',
        name: '기타',
        slug: 'video-photo-etc',
        parent_id: 'video-photo',
        children: [
          { id: 'storyboard', name: '콘티·스토리보드', slug: 'storyboard', parent_id: 'video-photo-etc' },
          { id: 'hair-makeup', name: '헤어·메이크업', slug: 'hair-makeup', parent_id: 'video-photo-etc' },
          { id: 'studio-rental', name: '스튜디오 렌탈', slug: 'studio-rental', parent_id: 'video-photo-etc' },
          { id: 'video-photo-other', name: '기타 영상·사진·음향', slug: 'video-photo-other', parent_id: 'video-photo-etc' },
        ]
      }
    ]
  },

  // =============== 8. 번역/통역 ===============
  {
    id: 'translation',
    name: '번역/통역',
    slug: 'translation',
    icon: 'language',
    service_count: 25,
    popularity_score: 70,
    description: '전문 번역 및 통역 서비스',
    children: [
      {
        id: 'document-translation',
        name: '번역',
        slug: 'document-translation',
        parent_id: 'translation',
        children: [
          { id: 'english-translation', name: '영어 번역', slug: 'english-translation', parent_id: 'document-translation', is_popular: true },
          { id: 'chinese-translation', name: '중국어 번역', slug: 'chinese-translation', parent_id: 'document-translation', is_popular: true },
          { id: 'japanese-translation', name: '일본어 번역', slug: 'japanese-translation', parent_id: 'document-translation', is_popular: true },
          { id: 'spanish-translation', name: '스페인어 번역', slug: 'spanish-translation', parent_id: 'document-translation' },
          { id: 'french-translation', name: '프랑스어 번역', slug: 'french-translation', parent_id: 'document-translation' },
          { id: 'german-translation', name: '독일어 번역', slug: 'german-translation', parent_id: 'document-translation' },
          { id: 'other-language-translation', name: '기타 언어 번역', slug: 'other-language-translation', parent_id: 'document-translation' },
          { id: 'proofreading', name: '감수', slug: 'proofreading', parent_id: 'document-translation' },
          { id: 'notarized-translation', name: '번역공증대행', slug: 'notarized-translation', parent_id: 'document-translation' },
          { id: 'ai-translation-review', name: 'AI 번역 검수·편집', slug: 'ai-translation-review', parent_id: 'document-translation' },
        ]
      },
      {
        id: 'media-translation',
        name: '영상 번역',
        slug: 'media-translation',
        parent_id: 'translation',
        children: [
          { id: 'subtitle-translation', name: '자막 번역', slug: 'subtitle-translation', parent_id: 'media-translation', is_popular: true },
          { id: 'dubbing', name: '더빙', slug: 'dubbing', parent_id: 'media-translation' },
          { id: 'transcription', name: '음성 텍스트 변환', slug: 'transcription', parent_id: 'media-translation' },
        ]
      },
      {
        id: 'professional-translation',
        name: '전문 분야 번역',
        slug: 'professional-translation',
        parent_id: 'translation',
        children: [
          { id: 'legal-translation', name: '법률 번역', slug: 'legal-translation', parent_id: 'professional-translation' },
          { id: 'medical-translation', name: '의료 번역', slug: 'medical-translation', parent_id: 'professional-translation' },
          { id: 'technical-translation', name: '기술 번역', slug: 'technical-translation', parent_id: 'professional-translation' },
          { id: 'academic-translation', name: '학술 번역', slug: 'academic-translation', parent_id: 'professional-translation' },
        ]
      },
      {
        id: 'interpretation',
        name: '통역',
        slug: 'interpretation',
        parent_id: 'translation',
        children: [
          { id: 'english-interpretation', name: '영어 통역', slug: 'english-interpretation', parent_id: 'interpretation', is_popular: true },
          { id: 'chinese-interpretation', name: '중국어 통역', slug: 'chinese-interpretation', parent_id: 'interpretation' },
          { id: 'japanese-interpretation', name: '일본어 통역', slug: 'japanese-interpretation', parent_id: 'interpretation' },
          { id: 'other-language-interpretation', name: '기타 언어 통역', slug: 'other-language-interpretation', parent_id: 'interpretation' },
          { id: 'simultaneous-interpretation', name: '동시통역', slug: 'simultaneous-interpretation', parent_id: 'interpretation' },
          { id: 'consecutive-interpretation', name: '순차통역', slug: 'consecutive-interpretation', parent_id: 'interpretation' },
          { id: 'business-interpretation', name: '비즈니스 통역', slug: 'business-interpretation', parent_id: 'interpretation' },
          { id: 'ai-interpretation', name: 'AI 통역', slug: 'ai-interpretation', parent_id: 'interpretation' },
        ]
      }
    ]
  },

  // =============== 9. 문서/글쓰기 ===============
  {
    id: 'writing',
    name: '문서/글쓰기',
    slug: 'writing',
    icon: 'pen-fancy',
    service_count: 32,
    popularity_score: 80,
    description: '전문적인 문서 작성 서비스',
    children: [
      {
        id: 'content-writing',
        name: '콘텐츠 글쓰기',
        slug: 'content-writing',
        parent_id: 'writing',
        children: [
          { id: 'blog-cafe-manuscript', name: '블로그·카페 원고', slug: 'blog-cafe-manuscript', parent_id: 'content-writing', is_popular: true },
          { id: 'script-writing', name: '대본 작성', slug: 'script-writing', parent_id: 'content-writing' },
          { id: 'press-article-column', name: '보도자료·기사·칼럼', slug: 'press-article-column', parent_id: 'content-writing', is_popular: true },
          { id: 'book-ebook-publishing', name: '책·전자책 출판', slug: 'book-ebook-publishing', parent_id: 'content-writing' },
          { id: 'industry-specialized-writing', name: '산업별 전문 글작성', slug: 'industry-specialized-writing', parent_id: 'content-writing' },
        ]
      },
      {
        id: 'business-copy',
        name: '비즈니스 카피',
        slug: 'business-copy',
        parent_id: 'writing',
        children: [
          { id: 'naming-branding', name: '네이밍·브랜딩', slug: 'naming-branding', parent_id: 'business-copy', is_popular: true },
          { id: 'product-copywriting', name: '제품 카피라이팅', slug: 'product-copywriting', parent_id: 'business-copy', is_popular: true },
          { id: 'ad-copywriting', name: '광고 카피라이팅', slug: 'ad-copywriting', parent_id: 'business-copy', is_popular: true },
          { id: 'other-copywriting', name: '기타 카피라이팅', slug: 'other-copywriting', parent_id: 'business-copy' },
        ]
      },
      {
        id: 'thesis-research',
        name: '논문·자료 조사',
        slug: 'thesis-research',
        parent_id: 'writing',
        children: [
          { id: 'thesis-consulting', name: '논문 컨설팅', slug: 'thesis-consulting', parent_id: 'thesis-research' },
          { id: 'thesis-editing-proofreading', name: '논문 교정·편집', slug: 'thesis-editing-proofreading', parent_id: 'thesis-research', is_popular: true },
          { id: 'thesis-statistics-analysis', name: '논문 통계분석', slug: 'thesis-statistics-analysis', parent_id: 'thesis-research' },
          { id: 'data-research', name: '자료 조사', slug: 'data-research', parent_id: 'thesis-research' },
        ]
      },
      {
        id: 'typing-editing',
        name: '타이핑·편집',
        slug: 'typing-editing',
        parent_id: 'writing',
        children: [
          { id: 'typing-document', name: '타이핑(문서)', slug: 'typing-document', parent_id: 'typing-editing' },
          { id: 'typing-video', name: '타이핑(영상)', slug: 'typing-video', parent_id: 'typing-editing' },
          { id: 'document-editing', name: '문서 편집', slug: 'document-editing', parent_id: 'typing-editing' },
        ]
      },
      {
        id: 'proofreading-revision',
        name: '교정·첨삭',
        slug: 'proofreading-revision',
        parent_id: 'writing',
        children: [
          { id: 'proofreading-correction', name: '교정·교열 첨삭', slug: 'proofreading-correction', parent_id: 'proofreading-revision' },
        ]
      },
      {
        id: 'ai-writing',
        name: 'AI 글쓰기',
        slug: 'ai-writing',
        parent_id: 'writing',
        children: [
          { id: 'ai-content-production', name: 'AI 콘텐츠 생산', slug: 'ai-content-production', parent_id: 'ai-writing', is_popular: true },
          { id: 'ai-content-review-editing', name: 'AI 콘텐츠 검수·편집', slug: 'ai-content-review-editing', parent_id: 'ai-writing' },
        ]
      },
      {
        id: 'business-documents',
        name: '비즈니스 문서',
        slug: 'business-documents',
        parent_id: 'writing',
        children: [
          { id: 'business-plan', name: '사업계획서', slug: 'business-plan', parent_id: 'business-documents', is_popular: true },
          { id: 'proposal-writing', name: '제안서 작성', slug: 'proposal-writing', parent_id: 'business-documents' },
          { id: 'report-writing', name: '보고서 작성', slug: 'report-writing', parent_id: 'business-documents' },
          { id: 'presentation', name: '프레젠테이션', slug: 'presentation', parent_id: 'business-documents' },
          { id: 'cv-resume', name: '이력서/자소서', slug: 'cv-resume', parent_id: 'business-documents', is_popular: true },
        ]
      },
      {
        id: 'academic-documents',
        name: '학술 문서',
        slug: 'academic-documents',
        parent_id: 'writing',
        children: [
          { id: 'research-paper', name: '연구 보고서', slug: 'research-paper', parent_id: 'academic-documents' },
          { id: 'essay-writing', name: '에세이', slug: 'essay-writing', parent_id: 'academic-documents' },
        ]
      },
      {
        id: 'creative-writing',
        name: '창작 글쓰기',
        slug: 'creative-writing',
        parent_id: 'writing',
        children: [
          { id: 'novel-writing', name: '소설', slug: 'novel-writing', parent_id: 'creative-writing' },
          { id: 'scenario-writing', name: '시나리오', slug: 'scenario-writing', parent_id: 'creative-writing' },
          { id: 'webtoon-story', name: '웹툰 스토리', slug: 'webtoon-story', parent_id: 'creative-writing' },
          { id: 'poetry', name: '시/수필', slug: 'poetry', parent_id: 'creative-writing' },
        ]
      },
      {
        id: 'writing-etc',
        name: '기타',
        slug: 'writing-etc',
        parent_id: 'writing',
        children: [
          { id: 'other-writing', name: '기타 글쓰기', slug: 'other-writing', parent_id: 'writing-etc' },
          { id: 'document-materials', name: '문서 자료', slug: 'document-materials', parent_id: 'writing-etc' },
        ]
      }
    ]
  },

  // =============== 10. 음악/오디오 ===============
  {
    id: 'music-audio',
    name: '음악/오디오',
    slug: 'music-audio',
    icon: 'music',
    service_count: 10,
    popularity_score: 65,
    description: '음악 제작 및 오디오 서비스',
    children: [
      {
        id: 'music-production',
        name: '음악 제작',
        slug: 'music-production',
        parent_id: 'music-audio',
        children: [
          { id: 'music-composition', name: '작곡', slug: 'music-composition', parent_id: 'music-production' },
          { id: 'music-arrangement', name: '편곡', slug: 'music-arrangement', parent_id: 'music-production' },
          { id: 'bgm-production', name: 'BGM 제작', slug: 'bgm-production', parent_id: 'music-production' },
          { id: 'jingle-production', name: '징글/CM송', slug: 'jingle-production', parent_id: 'music-production' },
        ]
      },
      {
        id: 'audio-production',
        name: '오디오 작업',
        slug: 'audio-production',
        parent_id: 'music-audio',
        children: [
          { id: 'mixing-mastering', name: '믹싱/마스터링', slug: 'mixing-mastering', parent_id: 'audio-production' },
          { id: 'sound-effects', name: '효과음 제작', slug: 'sound-effects', parent_id: 'audio-production' },
          { id: 'audio-editing', name: '오디오 편집', slug: 'audio-editing', parent_id: 'audio-production' },
          { id: 'podcast-editing', name: '팟캐스트 편집', slug: 'podcast-editing', parent_id: 'audio-production' },
        ]
      },
      {
        id: 'voice-narration',
        name: '보이스/나레이션',
        slug: 'voice-narration',
        parent_id: 'music-audio',
        children: [
          { id: 'voice-over', name: '성우/나레이션', slug: 'voice-over', parent_id: 'voice-narration', is_popular: true },
          { id: 'ars-recording', name: 'ARS 녹음', slug: 'ars-recording', parent_id: 'voice-narration' },
          { id: 'audiobook', name: '오디오북', slug: 'audiobook', parent_id: 'voice-narration' },
        ]
      }
    ]
  },

  // =============== 11. 비즈니스 ===============
  {
    id: 'business',
    name: '비즈니스',
    slug: 'business',
    icon: 'briefcase',
    service_count: 42,
    popularity_score: 78,
    description: '비즈니스 성장을 위한 전문 서비스',
    children: [
      {
        id: 'business-plan',
        name: '사업계획',
        slug: 'business-plan',
        parent_id: 'business',
        children: [
          { id: 'business-plan-investment-proposal', name: '사업계획서·투자제안서', slug: 'business-plan-investment-proposal', parent_id: 'business-plan', is_popular: true },
          { id: 'business-research', name: '리서치', slug: 'business-research', parent_id: 'business-plan' },
        ]
      },
      {
        id: 'corporate-consulting',
        name: '기업 자문',
        slug: 'corporate-consulting',
        parent_id: 'business',
        children: [
          { id: 'sales-consulting', name: '세일즈', slug: 'sales-consulting', parent_id: 'corporate-consulting', is_popular: true },
          { id: 'general-management-consulting', name: '일반 경영 자문', slug: 'general-management-consulting', parent_id: 'corporate-consulting' },
          { id: 'branding-consulting', name: '브랜딩', slug: 'branding-consulting', parent_id: 'corporate-consulting' },
          { id: 'logistics-production', name: '물류·생산', slug: 'logistics-production', parent_id: 'corporate-consulting' },
          { id: 'hr-corporate-culture', name: 'HR·기업문화', slug: 'hr-corporate-culture', parent_id: 'corporate-consulting' },
          { id: 'global-business', name: '해외 사업·해외 진출', slug: 'global-business', parent_id: 'corporate-consulting' },
          { id: 'it-consulting', name: 'IT 컨설팅', slug: 'it-consulting', parent_id: 'corporate-consulting' },
          { id: 'financial-consulting', name: '재무 자문', slug: 'financial-consulting', parent_id: 'corporate-consulting' },
          { id: 'operation-support', name: '운영 지원', slug: 'operation-support', parent_id: 'corporate-consulting' },
        ]
      },
      {
        id: 'industry-startup',
        name: '업종별 창업',
        slug: 'industry-startup',
        parent_id: 'business',
        children: [
          { id: 'online-store-startup', name: '온라인 쇼핑몰 창업', slug: 'online-store-startup', parent_id: 'industry-startup', is_popular: true },
          { id: 'cafe-restaurant-startup', name: '카페·요식업 창업', slug: 'cafe-restaurant-startup', parent_id: 'industry-startup', is_popular: true },
          { id: 'fashion-startup', name: '패션 창업', slug: 'fashion-startup', parent_id: 'industry-startup' },
          { id: 'beauty-care-startup', name: '미용·뷰티케어 창업', slug: 'beauty-care-startup', parent_id: 'industry-startup' },
          { id: 'health-food-startup', name: '건강기능식품 창업', slug: 'health-food-startup', parent_id: 'industry-startup' },
          { id: 'cosmetics-startup', name: '화장품 창업', slug: 'cosmetics-startup', parent_id: 'industry-startup' },
          { id: 'hospital-pharmacy-startup', name: '병원·약국 창업', slug: 'hospital-pharmacy-startup', parent_id: 'industry-startup' },
          { id: 'franchise-startup', name: '프랜차이즈 창업', slug: 'franchise-startup', parent_id: 'industry-startup' },
          { id: 'unmanned-space-rental-startup', name: '무인점포·공간대여 창업', slug: 'unmanned-space-rental-startup', parent_id: 'industry-startup' },
          { id: 'pet-startup', name: '반려동물 창업', slug: 'pet-startup', parent_id: 'industry-startup' },
          { id: 'other-startup', name: '기타 창업', slug: 'other-startup', parent_id: 'industry-startup' },
        ]
      },
      {
        id: 'startup-consulting',
        name: '스타트업 자문',
        slug: 'startup-consulting',
        parent_id: 'business',
        children: [
          { id: 'vision-mission-branding', name: '비전·미션·초기 브랜딩', slug: 'vision-mission-branding', parent_id: 'startup-consulting', is_popular: true },
          { id: 'personal-org-goal-management', name: '개인·조직 목표 관리', slug: 'personal-org-goal-management', parent_id: 'startup-consulting' },
          { id: 'startup-hr-consulting', name: '스타트업 인사 자문', slug: 'startup-hr-consulting', parent_id: 'startup-consulting' },
          { id: 'startup-investment-attraction', name: '스타트업 투자 유치', slug: 'startup-investment-attraction', parent_id: 'startup-consulting', is_popular: true },
        ]
      },
      {
        id: 'consulting',
        name: '컨설팅',
        slug: 'consulting',
        parent_id: 'business',
        children: [
          { id: 'startup-consulting-general', name: '창업 컨설팅', slug: 'startup-consulting-general', parent_id: 'consulting', is_popular: true },
          { id: 'management-consulting', name: '경영 컨설팅', slug: 'management-consulting', parent_id: 'consulting' },
          { id: 'marketing-consulting', name: '마케팅 컨설팅', slug: 'marketing-consulting', parent_id: 'consulting' },
          { id: 'hr-consulting', name: '인사 컨설팅', slug: 'hr-consulting', parent_id: 'consulting' },
        ]
      },
      {
        id: 'finance-accounting',
        name: '재무/회계',
        slug: 'finance-accounting',
        parent_id: 'business',
        children: [
          { id: 'bookkeeping', name: '장부 기장', slug: 'bookkeeping', parent_id: 'finance-accounting' },
          { id: 'tax-service', name: '세무 서비스', slug: 'tax-service', parent_id: 'finance-accounting', is_popular: true },
          { id: 'financial-planning', name: '재무 설계', slug: 'financial-planning', parent_id: 'finance-accounting' },
          { id: 'investment-consulting', name: '투자 컨설팅', slug: 'investment-consulting', parent_id: 'finance-accounting' },
        ]
      },
      {
        id: 'legal-services',
        name: '법률 서비스',
        slug: 'legal-services',
        parent_id: 'business',
        children: [
          { id: 'legal-consulting', name: '법률 자문', slug: 'legal-consulting', parent_id: 'legal-services' },
          { id: 'patent-trademark', name: '특허/상표', slug: 'patent-trademark', parent_id: 'legal-services' },
          { id: 'contract-drafting', name: '계약서 작성', slug: 'contract-drafting', parent_id: 'legal-services' },
        ]
      },
      {
        id: 'business-support',
        name: '비즈니스 지원',
        slug: 'business-support',
        parent_id: 'business',
        children: [
          { id: 'virtual-assistant', name: '가상 비서', slug: 'virtual-assistant', parent_id: 'business-support' },
          { id: 'data-entry', name: '데이터 입력', slug: 'data-entry', parent_id: 'business-support' },
          { id: 'market-research', name: '시장 조사', slug: 'market-research', parent_id: 'business-support' },
        ]
      },
      {
        id: 'business-materials',
        name: '자료·콘텐츠',
        slug: 'business-materials',
        parent_id: 'business',
        children: [
          { id: 'business-documents', name: '비즈니스 문서', slug: 'business-documents', parent_id: 'business-materials' },
        ]
      },
      {
        id: 'business-etc',
        name: '기타',
        slug: 'business-etc',
        parent_id: 'business',
        children: [
          { id: 'other-consulting-support', name: '기타 자문·지원', slug: 'other-consulting-support', parent_id: 'business-etc' },
        ]
      }
    ]
  },

  // =============== 10. 라이프스타일 ===============
  {
    id: 'lifestyle',
    name: '라이프스타일',
    slug: 'lifestyle',
    icon: 'book',
    service_count: 20,
    description: '삶의 질을 높이는 서비스',
    children: [
      {
        id: 'online-lessons',
        name: '온라인 레슨',
        slug: 'online-lessons',
        parent_id: 'lifestyle',
        children: [
          { id: 'language-lesson', name: '외국어 레슨', slug: 'language-lesson', parent_id: 'online-lessons', is_popular: true },
          { id: 'music-lesson', name: '음악 레슨', slug: 'music-lesson', parent_id: 'online-lessons' },
          { id: 'art-lesson', name: '미술 레슨', slug: 'art-lesson', parent_id: 'online-lessons' },
          { id: 'cooking-lesson', name: '요리 레슨', slug: 'cooking-lesson', parent_id: 'online-lessons' },
          { id: 'coding-lesson', name: '코딩 레슨', slug: 'coding-lesson', parent_id: 'online-lessons', is_popular: true },
        ]
      },
      {
        id: 'health-wellness',
        name: '건강/웰니스',
        slug: 'health-wellness',
        parent_id: 'lifestyle',
        children: [
          { id: 'fitness-training', name: '피트니스 트레이닝', slug: 'fitness-training', parent_id: 'health-wellness', is_popular: true },
          { id: 'diet-consulting', name: '다이어트 상담', slug: 'diet-consulting', parent_id: 'health-wellness' },
          { id: 'yoga-pilates', name: '요가/필라테스', slug: 'yoga-pilates', parent_id: 'health-wellness' },
          { id: 'meditation', name: '명상', slug: 'meditation', parent_id: 'health-wellness' },
        ]
      },
      {
        id: 'coaching-counseling',
        name: '코칭/상담',
        slug: 'coaching-counseling',
        parent_id: 'lifestyle',
        children: [
          { id: 'life-coaching', name: '라이프 코칭', slug: 'life-coaching', parent_id: 'coaching-counseling' },
          { id: 'career-coaching', name: '커리어 코칭', slug: 'career-coaching', parent_id: 'coaching-counseling', is_popular: true },
          { id: 'relationship-counseling', name: '연애 상담', slug: 'relationship-counseling', parent_id: 'coaching-counseling' },
          { id: 'psychological-counseling', name: '심리 상담', slug: 'psychological-counseling', parent_id: 'coaching-counseling' },
        ]
      },
      {
        id: 'astrology-fortune',
        name: '운세/타로',
        slug: 'astrology-fortune',
        parent_id: 'lifestyle',
        children: [
          { id: 'tarot-reading', name: '타로 리딩', slug: 'tarot-reading', parent_id: 'astrology-fortune' },
          { id: 'fortune-telling', name: '사주/운세', slug: 'fortune-telling', parent_id: 'astrology-fortune' },
          { id: 'naming-service', name: '작명', slug: 'naming-service', parent_id: 'astrology-fortune' },
        ]
      }
    ]
  },

  // =============== 11. 이벤트 ===============
  {
    id: 'event',
    name: '이벤트',
    slug: 'event',
    icon: 'calendar',
    service_count: 14,
    description: '특별한 날을 위한 서비스',
    children: [
      {
        id: 'event-planning',
        name: '행사 기획',
        slug: 'event-planning',
        parent_id: 'event',
        children: [
          { id: 'wedding-planning', name: '웨딩 플래닝', slug: 'wedding-planning', parent_id: 'event-planning' },
          { id: 'birthday-party', name: '생일 파티', slug: 'birthday-party', parent_id: 'event-planning' },
          { id: 'corporate-event', name: '기업 행사', slug: 'corporate-event', parent_id: 'event-planning' },
          { id: 'seminar-conference', name: '세미나/컨퍼런스', slug: 'seminar-conference', parent_id: 'event-planning' },
        ]
      },
      {
        id: 'event-services',
        name: '행사 서비스',
        slug: 'event-services',
        parent_id: 'event',
        children: [
          { id: 'mc-hosting', name: '사회/진행', slug: 'mc-hosting', parent_id: 'event-services' },
          { id: 'performance', name: '공연', slug: 'performance', parent_id: 'event-services' },
          { id: 'dj-service', name: 'DJ 서비스', slug: 'dj-service', parent_id: 'event-services' },
          { id: 'catering', name: '케이터링', slug: 'catering', parent_id: 'event-services' },
        ]
      }
    ]
  },

  // =============== 12. 취미/핸드메이드 ===============
  {
    id: 'hobby-handmade',
    name: '취미/핸드메이드',
    slug: 'hobby-handmade',
    icon: 'scissors',
    service_count: 23,
    description: '취미 활동과 수제 작품',
    children: [
      {
        id: 'handmade-craft',
        name: '핸드메이드',
        slug: 'handmade-craft',
        parent_id: 'hobby-handmade',
        children: [
          { id: 'custom-goods', name: '맞춤 제작', slug: 'custom-goods', parent_id: 'handmade-craft' },
          { id: 'jewelry-making', name: '액세서리', slug: 'jewelry-making', parent_id: 'handmade-craft' },
          { id: 'pottery', name: '도자기', slug: 'pottery', parent_id: 'handmade-craft' },
          { id: 'knitting', name: '뜨개질', slug: 'knitting', parent_id: 'handmade-craft' },
        ]
      },
      {
        id: 'gift-items',
        name: '선물/기념품',
        slug: 'gift-items',
        parent_id: 'hobby-handmade',
        children: [
          { id: 'personalized-gift', name: '개인화 선물', slug: 'personalized-gift', parent_id: 'gift-items' },
          { id: 'gift-wrapping', name: '선물 포장', slug: 'gift-wrapping', parent_id: 'gift-items' },
          { id: 'flower-arrangement', name: '꽃꽂이', slug: 'flower-arrangement', parent_id: 'gift-items' },
        ]
      },
      {
        id: 'gaming',
        name: '게임',
        slug: 'gaming',
        parent_id: 'hobby-handmade',
        children: [
          { id: 'game-coaching', name: '게임 코칭', slug: 'game-coaching', parent_id: 'gaming' },
          { id: 'game-leveling', name: '레벨링 대행', slug: 'game-leveling', parent_id: 'gaming' },
          { id: 'game-account', name: '게임 계정', slug: 'game-account', parent_id: 'gaming' },
        ]
      }
    ]
  },

  // =============== 13. 뷰티/패션 ===============
  {
    id: 'beauty-fashion',
    name: '뷰티/패션',
    slug: 'beauty-fashion',
    icon: 'spa',
    service_count: 14,
    description: '뷰티와 패션 관련 서비스',
    children: [
      {
        id: 'beauty-services',
        name: '뷰티 서비스',
        slug: 'beauty-services',
        parent_id: 'beauty-fashion',
        children: [
          { id: 'makeup', name: '메이크업', slug: 'makeup', parent_id: 'beauty-services' },
          { id: 'hair-styling', name: '헤어 스타일링', slug: 'hair-styling', parent_id: 'beauty-services' },
          { id: 'nail-art', name: '네일아트', slug: 'nail-art', parent_id: 'beauty-services' },
        ]
      },
      {
        id: 'fashion-styling',
        name: '패션 스타일링',
        slug: 'fashion-styling',
        parent_id: 'beauty-fashion',
        children: [
          { id: 'personal-color', name: '퍼스널 컬러', slug: 'personal-color', parent_id: 'fashion-styling' },
          { id: 'styling-consulting', name: '스타일링 컨설팅', slug: 'styling-consulting', parent_id: 'fashion-styling' },
        ]
      }
    ]
  },

  // =============== 14. 상담/코칭 ===============
  {
    id: 'counseling-coaching',
    name: '상담/코칭',
    slug: 'counseling-coaching',
    icon: 'bullseye',
    service_count: 14,
    description: '전문적인 상담과 코칭',
    children: [
      {
        id: 'life-coaching',
        name: '라이프 코칭',
        slug: 'life-coaching',
        parent_id: 'counseling-coaching',
        children: [
          { id: 'career-coaching', name: '커리어 코칭', slug: 'career-coaching', parent_id: 'life-coaching' },
          { id: 'relationship-counseling', name: '관계 상담', slug: 'relationship-counseling', parent_id: 'life-coaching' },
        ]
      },
      {
        id: 'psychological-counseling',
        name: '심리 상담',
        slug: 'psychological-counseling',
        parent_id: 'counseling-coaching',
        children: [
          { id: 'stress-management', name: '스트레스 관리', slug: 'stress-management', parent_id: 'psychological-counseling' },
          { id: 'emotional-healing', name: '감정 치유', slug: 'emotional-healing', parent_id: 'psychological-counseling' },
        ]
      }
    ]
  },

  // =============== 15. 운세/타로 ===============
  {
    id: 'fortune-tarot',
    name: '운세/타로',
    slug: 'fortune-tarot',
    icon: 'star',
    service_count: 16,
    description: '운세와 타로 상담',
    children: [
      {
        id: 'tarot-reading',
        name: '타로 리딩',
        slug: 'tarot-reading',
        parent_id: 'fortune-tarot',
        children: [
          { id: 'love-tarot', name: '연애운 타로', slug: 'love-tarot', parent_id: 'tarot-reading' },
          { id: 'career-tarot', name: '직업운 타로', slug: 'career-tarot', parent_id: 'tarot-reading' },
        ]
      },
      {
        id: 'fortune-telling',
        name: '사주/운세',
        slug: 'fortune-telling',
        parent_id: 'fortune-tarot',
        children: [
          { id: 'saju-reading', name: '사주 풀이', slug: 'saju-reading', parent_id: 'fortune-telling' },
          { id: 'naming', name: '작명/개명', slug: 'naming', parent_id: 'fortune-telling' },
        ]
      }
    ]
  },

  // =============== 16. 전자책/템플릿 ===============
  {
    id: 'ebook-template',
    name: '전자책/템플릿',
    slug: 'ebook-template',
    icon: 'book-open',
    service_count: 15,
    description: '전자책과 각종 템플릿',
    children: [
      {
        id: 'ebook',
        name: '전자책',
        slug: 'ebook',
        parent_id: 'ebook-template',
        children: [
          { id: 'ebook-creation', name: '전자책 제작', slug: 'ebook-creation', parent_id: 'ebook' },
          { id: 'ebook-publishing', name: '전자책 출판', slug: 'ebook-publishing', parent_id: 'ebook' },
        ]
      },
      {
        id: 'templates',
        name: '템플릿',
        slug: 'templates',
        parent_id: 'ebook-template',
        children: [
          { id: 'ppt-template', name: 'PPT 템플릿', slug: 'ppt-template', parent_id: 'templates' },
          { id: 'excel-template', name: '엑셀 템플릿', slug: 'excel-template', parent_id: 'templates' },
          { id: 'notion-template', name: '노션 템플릿', slug: 'notion-template', parent_id: 'templates' },
        ]
      }
    ]
  },

  // =============== 17. 세무/법무/노무 ===============
  {
    id: 'tax-legal-labor',
    name: '세무/법무/노무',
    slug: 'tax-legal-labor',
    icon: 'gavel',
    service_count: 16,
    description: '세무, 법률, 노무 전문 서비스',
    children: [
      {
        id: 'legal-service',
        name: '법무',
        slug: 'legal-service',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'business-legal-consulting', name: '사업자 법률 자문', slug: 'business-legal-consulting', parent_id: 'legal-service', is_popular: true },
          { id: 'personal-legal-consulting', name: '개인 법률 자문', slug: 'personal-legal-consulting', parent_id: 'legal-service', is_popular: true },
          { id: 'legal-administration', name: '법무·행정', slug: 'legal-administration', parent_id: 'legal-service' },
          { id: 'contract-review', name: '계약서 검토', slug: 'contract-review', parent_id: 'legal-service' },
          { id: 'legal-consulting', name: '법률 상담', slug: 'legal-consulting', parent_id: 'legal-service' },
        ]
      },
      {
        id: 'tax-accounting',
        name: '세무·회계',
        slug: 'tax-accounting',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'business-tax-accounting', name: '사업자 세무·회계', slug: 'business-tax-accounting', parent_id: 'tax-accounting', is_popular: true },
          { id: 'personal-tax-accounting', name: '개인 세무·회계', slug: 'personal-tax-accounting', parent_id: 'tax-accounting', is_popular: true },
          { id: 'tax-return', name: '세금 신고', slug: 'tax-return', parent_id: 'tax-accounting' },
          { id: 'tax-consulting', name: '세무 상담', slug: 'tax-consulting', parent_id: 'tax-accounting' },
        ]
      },
      {
        id: 'intellectual-property',
        name: '지식재산권 보호',
        slug: 'intellectual-property',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'domestic-patent-trademark', name: '국내 특허·상표', slug: 'domestic-patent-trademark', parent_id: 'intellectual-property', is_popular: true },
          { id: 'other-intellectual-property', name: '기타 지식재산권', slug: 'other-intellectual-property', parent_id: 'intellectual-property' },
        ]
      },
      {
        id: 'labor-service',
        name: '노무',
        slug: 'labor-service',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'employer-labor-consulting', name: '고용인 노무 상담', slug: 'employer-labor-consulting', parent_id: 'labor-service', is_popular: true },
          { id: 'worker-labor-consulting', name: '근로자 노무 상담', slug: 'worker-labor-consulting', parent_id: 'labor-service' },
          { id: 'employment-contract-consulting', name: '근로계약서 상담', slug: 'employment-contract-consulting', parent_id: 'labor-service' },
          { id: 'employment-subsidy-consulting', name: '고용지원금 상담', slug: 'employment-subsidy-consulting', parent_id: 'labor-service' },
        ]
      },
      {
        id: 'tax-legal-labor-etc',
        name: '기타',
        slug: 'tax-legal-labor-etc',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'other-consulting-customs', name: '기타 자문(관세사 등)', slug: 'other-consulting-customs', parent_id: 'tax-legal-labor-etc' },
        ]
      }
    ]
  },

  // =============== 18. 주문제작 ===============
  {
    id: 'custom-order',
    name: '주문제작',
    slug: 'custom-order',
    icon: 'hammer',
    service_count: 13,
    description: '맞춤형 주문 제작 서비스',
    children: [
      {
        id: 'print-promotional',
        name: '인쇄·판촉물',
        slug: 'print-promotional',
        parent_id: 'custom-order',
        children: [
          { id: 'printing', name: '인쇄', slug: 'printing', parent_id: 'print-promotional', is_popular: true },
          { id: '3d-printing', name: '3D프린팅', slug: '3d-printing', parent_id: 'print-promotional' },
          { id: 'package-making', name: '패키지 제작', slug: 'package-making', parent_id: 'print-promotional' },
          { id: 'store-goods-making', name: '가게용품 제작', slug: 'store-goods-making', parent_id: 'print-promotional' },
          { id: 'souvenir-making', name: '기념품 제작', slug: 'souvenir-making', parent_id: 'print-promotional', is_popular: true },
          { id: 'model-making', name: '모형 제작', slug: 'model-making', parent_id: 'print-promotional' },
          { id: 'product-making', name: '제품 제작', slug: 'product-making', parent_id: 'print-promotional' },
        ]
      },
      {
        id: 'custom-goods',
        name: '굿즈 제작',
        slug: 'custom-goods',
        parent_id: 'custom-order',
        children: [
          { id: 'tshirt-making', name: '티셔츠 제작', slug: 'tshirt-making', parent_id: 'custom-goods', is_popular: true },
          { id: 'mug-making', name: '머그컵 제작', slug: 'mug-making', parent_id: 'custom-goods' },
          { id: 'sticker-making', name: '스티커 제작', slug: 'sticker-making', parent_id: 'custom-goods' },
        ]
      },
      {
        id: 'printing-materials',
        name: '인쇄물',
        slug: 'printing-materials',
        parent_id: 'custom-order',
        children: [
          { id: 'business-card-printing', name: '명함 인쇄', slug: 'business-card-printing', parent_id: 'printing-materials' },
          { id: 'poster-printing', name: '포스터 인쇄', slug: 'poster-printing', parent_id: 'printing-materials' },
        ]
      },
      {
        id: 'custom-order-etc',
        name: '기타',
        slug: 'custom-order-etc',
        parent_id: 'custom-order',
        children: [
          { id: 'other-custom-order', name: '기타 주문제작', slug: 'other-custom-order', parent_id: 'custom-order-etc' },
        ]
      }
    ]
  },

  // =============== 19. 취업/입시 ===============
  {
    id: 'career-admission',
    name: '취업/입시',
    slug: 'career-admission',
    icon: 'graduation-cap',
    service_count: 14,
    description: '취업과 입시 준비 서비스',
    children: [
      {
        id: 'job-preparation',
        name: '취업 준비',
        slug: 'job-preparation',
        parent_id: 'career-admission',
        children: [
          { id: 'resume-writing', name: '이력서 작성', slug: 'resume-writing', parent_id: 'job-preparation' },
          { id: 'interview-coaching', name: '면접 코칭', slug: 'interview-coaching', parent_id: 'job-preparation' },
          { id: 'portfolio-making', name: '포트폴리오 제작', slug: 'portfolio-making', parent_id: 'job-preparation' },
        ]
      },
      {
        id: 'admission-prep',
        name: '입시 준비',
        slug: 'admission-prep',
        parent_id: 'career-admission',
        children: [
          { id: 'college-consulting', name: '대입 컨설팅', slug: 'college-consulting', parent_id: 'admission-prep' },
          { id: 'essay-writing', name: '자소서 작성', slug: 'essay-writing', parent_id: 'admission-prep' },
        ]
      }
    ]
  },

  // =============== 20. 직무역량 ===============
  {
    id: 'job-skills',
    name: '직무역량',
    slug: 'job-skills',
    icon: 'chart-line',
    service_count: 16,
    description: '직무 능력 향상 서비스',
    children: [
      {
        id: 'office-skills',
        name: '오피스 스킬',
        slug: 'office-skills',
        parent_id: 'job-skills',
        children: [
          { id: 'excel-training', name: '엑셀 교육', slug: 'excel-training', parent_id: 'office-skills' },
          { id: 'ppt-training', name: 'PPT 교육', slug: 'ppt-training', parent_id: 'office-skills' },
        ]
      },
      {
        id: 'business-skills',
        name: '비즈니스 스킬',
        slug: 'business-skills',
        parent_id: 'job-skills',
        children: [
          { id: 'presentation-skill', name: '프레젠테이션', slug: 'presentation-skill', parent_id: 'business-skills' },
          { id: 'negotiation-skill', name: '협상 스킬', slug: 'negotiation-skill', parent_id: 'business-skills' },
        ]
      }
    ]
  }
]

// 유틸리티 함수들
export const getPopularCategories = (): CategoryItem[] => {
  const popular: CategoryItem[] = []
  const extractPopular = (categories: CategoryItem[]) => {
    categories.forEach(cat => {
      if (cat.is_popular) popular.push(cat)
      if (cat.children) extractPopular(cat.children)
    })
  }
  extractPopular(FULL_CATEGORIES)
  return popular
}

export const searchCategories = (query: string): CategoryItem[] => {
  const results: CategoryItem[] = []
  const searchTerm = query.toLowerCase()

  const search = (categories: CategoryItem[]) => {
    categories.forEach(cat => {
      if (
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.slug.includes(searchTerm) ||
        cat.keywords?.some(k => k.toLowerCase().includes(searchTerm))
      ) {
        results.push(cat)
      }
      if (cat.children) search(cat.children)
    })
  }

  search(FULL_CATEGORIES)
  return results
}

export const getCategoryById = (id: string): CategoryItem | null => {
  const find = (categories: CategoryItem[]): CategoryItem | null => {
    for (const cat of categories) {
      if (cat.id === id) return cat
      if (cat.children) {
        const found = find(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return find(FULL_CATEGORIES)
}

export const getCategoryBySlug = (slug: string): CategoryItem | null => {
  const find = (categories: CategoryItem[]): CategoryItem | null => {
    for (const cat of categories) {
      if (cat.slug === slug) return cat
      if (cat.children) {
        const found = find(cat.children)
        if (found) return found
      }
    }
    return null
  }
  return find(FULL_CATEGORIES)
}

export const getCategoryPath = (categoryId: string): CategoryItem[] => {
  const path: CategoryItem[] = []
  const findPath = (categories: CategoryItem[], targetId: string, currentPath: CategoryItem[]): boolean => {
    for (const cat of categories) {
      const newPath = [...currentPath, cat]
      if (cat.id === targetId) {
        path.push(...newPath)
        return true
      }
      if (cat.children && findPath(cat.children, targetId, newPath)) {
        return true
      }
    }
    return false
  }
  findPath(FULL_CATEGORIES, categoryId, [])
  return path
}

export const getCategoryStats = () => {
  let totalCategories = 0
  let aiCategories = 0
  const count = (categories: CategoryItem[]) => {
    categories.forEach(cat => {
      totalCategories++
      if (cat.is_ai) aiCategories++
      if (cat.children) count(cat.children)
    })
  }
  count(FULL_CATEGORIES)

  return {
    totalCategories,
    aiCategories,
    mainCategories: FULL_CATEGORIES.length,
    popularCategories: getPopularCategories().length
  }
}