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
}

export const FULL_CATEGORIES: CategoryItem[] = [
  // =============== 1. AI 서비스 (별도 대메뉴) ===============
  {
    id: 'ai-services',
    name: 'AI 서비스',
    slug: 'ai-services',
    icon: 'robot',

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

  // =============== 2. 디자인 ===============
  {
    id: 'design',
    name: '디자인',
    slug: 'design',
    icon: 'palette',
    service_count: 23,
    description: '창의적인 디자인 솔루션',
    children: [
      {
        id: 'graphic-design',
        name: '그래픽 디자인',
        slug: 'graphic-design',
        parent_id: 'design',
        children: [
          { id: 'logo-design', name: '로고 디자인', slug: 'logo-design', parent_id: 'graphic-design', is_popular: true },
          { id: 'business-card', name: '명함 디자인', slug: 'business-card', parent_id: 'graphic-design' },
          { id: 'poster-design', name: '포스터 디자인', slug: 'poster-design', parent_id: 'graphic-design' },
          { id: 'banner-design', name: '배너 디자인', slug: 'banner-design', parent_id: 'graphic-design' },
          { id: 'infographic', name: '인포그래픽', slug: 'infographic', parent_id: 'graphic-design' },
          { id: 'ppt-design', name: 'PPT 디자인', slug: 'ppt-design', parent_id: 'graphic-design', is_popular: true },
          { id: 'thumbnail-design', name: '썸네일 디자인', slug: 'thumbnail-design', parent_id: 'graphic-design', is_popular: true },
          { id: 'social-media-design', name: 'SNS 디자인', slug: 'social-media-design', parent_id: 'graphic-design' },
        ]
      },
      {
        id: 'web-app-design',
        name: '웹/앱 디자인',
        slug: 'web-app-design',
        parent_id: 'design',
        children: [
          { id: 'website-design', name: '웹사이트 디자인', slug: 'website-design', parent_id: 'web-app-design' },
          { id: 'landing-page', name: '랜딩페이지', slug: 'landing-page', parent_id: 'web-app-design' },
          { id: 'ui-ux-design', name: 'UI/UX 디자인', slug: 'ui-ux-design', parent_id: 'web-app-design', is_popular: true },
          { id: 'mobile-app-design', name: '모바일 앱 디자인', slug: 'mobile-app-design', parent_id: 'web-app-design' },
          { id: 'responsive-design', name: '반응형 디자인', slug: 'responsive-design', parent_id: 'web-app-design' },
          { id: 'dashboard-design', name: '대시보드 디자인', slug: 'dashboard-design', parent_id: 'web-app-design' },
        ]
      },
      {
        id: 'product-package-design',
        name: '제품/패키지 디자인',
        slug: 'product-package-design',
        parent_id: 'design',
        children: [
          { id: 'packaging-design', name: '패키지 디자인', slug: 'packaging-design', parent_id: 'product-package-design' },
          { id: 'label-design', name: '라벨 디자인', slug: 'label-design', parent_id: 'product-package-design' },
          { id: 'product-mockup', name: '제품 목업', slug: 'product-mockup', parent_id: 'product-package-design' },
        ]
      },
      {
        id: 'print-publishing',
        name: '인쇄/출판물',
        slug: 'print-publishing',
        parent_id: 'design',
        children: [
          { id: 'brochure-design', name: '브로슈어', slug: 'brochure-design', parent_id: 'print-publishing' },
          { id: 'catalog-design', name: '카탈로그', slug: 'catalog-design', parent_id: 'print-publishing' },
          { id: 'book-cover', name: '책 표지', slug: 'book-cover', parent_id: 'print-publishing' },
          { id: 'magazine-layout', name: '잡지 레이아웃', slug: 'magazine-layout', parent_id: 'print-publishing' },
          { id: 'menu-design', name: '메뉴판 디자인', slug: 'menu-design', parent_id: 'print-publishing' },
        ]
      },
      {
        id: '3d-ar-design',
        name: '3D/AR 디자인',
        slug: '3d-ar-design',
        parent_id: 'design',
        children: [
          { id: '3d-modeling', name: '3D 모델링', slug: '3d-modeling', parent_id: '3d-ar-design' },
          { id: '3d-rendering', name: '3D 렌더링', slug: '3d-rendering', parent_id: '3d-ar-design' },
          { id: 'cad-design', name: 'CAD 설계', slug: 'cad-design', parent_id: '3d-ar-design' },
          { id: 'ar-filter', name: 'AR 필터', slug: 'ar-filter', parent_id: '3d-ar-design' },
        ]
      },
      {
        id: 'fashion-design',
        name: '패션 디자인',
        slug: 'fashion-design',
        parent_id: 'design',
        children: [
          { id: 'clothing-design', name: '의류 디자인', slug: 'clothing-design', parent_id: 'fashion-design' },
          { id: 'textile-pattern', name: '텍스타일 패턴', slug: 'textile-pattern', parent_id: 'fashion-design' },
          { id: 'accessory-design', name: '액세서리 디자인', slug: 'accessory-design', parent_id: 'fashion-design' },
        ]
      }
    ]
  },

  // =============== 3. IT/프로그래밍 ===============
  {
    id: 'it-programming',
    name: 'IT/프로그래밍',
    slug: 'it-programming',
    icon: 'code',
    service_count: 18,
    description: '웹, 앱, 소프트웨어 개발',
    children: [
      {
        id: 'web-development',
        name: '웹 개발',
        slug: 'web-development',
        parent_id: 'it-programming',
        children: [
          { id: 'frontend-dev', name: '프론트엔드', slug: 'frontend-dev', parent_id: 'web-development', is_popular: true },
          { id: 'backend-dev', name: '백엔드', slug: 'backend-dev', parent_id: 'web-development' },
          { id: 'fullstack-dev', name: '풀스택', slug: 'fullstack-dev', parent_id: 'web-development' },
          { id: 'wordpress-dev', name: '워드프레스', slug: 'wordpress-dev', parent_id: 'web-development', is_popular: true },
          { id: 'shopify-dev', name: '쇼피파이', slug: 'shopify-dev', parent_id: 'web-development' },
          { id: 'wix-dev', name: 'WIX', slug: 'wix-dev', parent_id: 'web-development' },
          { id: 'landing-page-dev', name: '랜딩페이지 개발', slug: 'landing-page-dev', parent_id: 'web-development' },
        ]
      },
      {
        id: 'mobile-app-dev',
        name: '모바일 앱',
        slug: 'mobile-app-dev',
        parent_id: 'it-programming',
        children: [
          { id: 'android-app', name: '안드로이드 앱', slug: 'android-app', parent_id: 'mobile-app-dev' },
          { id: 'ios-app', name: 'iOS 앱', slug: 'ios-app', parent_id: 'mobile-app-dev' },
          { id: 'hybrid-app', name: '하이브리드 앱', slug: 'hybrid-app', parent_id: 'mobile-app-dev' },
          { id: 'flutter-app', name: 'Flutter', slug: 'flutter-app', parent_id: 'mobile-app-dev' },
          { id: 'react-native-app', name: 'React Native', slug: 'react-native-app', parent_id: 'mobile-app-dev' },
        ]
      },
      {
        id: 'software-dev',
        name: '소프트웨어 개발',
        slug: 'software-dev',
        parent_id: 'it-programming',
        children: [
          { id: 'desktop-app', name: '데스크톱 앱', slug: 'desktop-app', parent_id: 'software-dev' },
          { id: 'api-dev', name: 'API 개발', slug: 'api-dev', parent_id: 'software-dev' },
          { id: 'plugin-dev', name: '플러그인 개발', slug: 'plugin-dev', parent_id: 'software-dev' },
          { id: 'bot-dev', name: '봇 개발', slug: 'bot-dev', parent_id: 'software-dev' },
        ]
      },
      {
        id: 'game-development',
        name: '게임 개발',
        slug: 'game-development',
        parent_id: 'it-programming',
        children: [
          { id: 'unity-dev', name: 'Unity 개발', slug: 'unity-dev', parent_id: 'game-development' },
          { id: 'unreal-dev', name: 'Unreal 개발', slug: 'unreal-dev', parent_id: 'game-development' },
          { id: 'mobile-game', name: '모바일 게임', slug: 'mobile-game', parent_id: 'game-development' },
          { id: 'web-game', name: '웹 게임', slug: 'web-game', parent_id: 'game-development' },
        ]
      },
      {
        id: 'data-analytics',
        name: '데이터 분석',
        slug: 'data-analytics',
        parent_id: 'it-programming',
        children: [
          { id: 'data-analysis', name: '데이터 분석', slug: 'data-analysis', parent_id: 'data-analytics' },
          { id: 'data-visualization', name: '데이터 시각화', slug: 'data-visualization', parent_id: 'data-analytics' },
          { id: 'machine-learning', name: '머신러닝', slug: 'machine-learning', parent_id: 'data-analytics' },
          { id: 'web-crawling', name: '웹 크롤링', slug: 'web-crawling', parent_id: 'data-analytics', is_popular: true },
          { id: 'excel-automation', name: '엑셀 자동화', slug: 'excel-automation', parent_id: 'data-analytics', is_popular: true },
        ]
      },
      {
        id: 'it-support',
        name: 'IT 지원',
        slug: 'it-support',
        parent_id: 'it-programming',
        children: [
          { id: 'server-hosting', name: '서버 호스팅', slug: 'server-hosting', parent_id: 'it-support' },
          { id: 'database-admin', name: 'DB 관리', slug: 'database-admin', parent_id: 'it-support' },
          { id: 'tech-support', name: '기술 지원', slug: 'tech-support', parent_id: 'it-support' },
          { id: 'security-audit', name: '보안 점검', slug: 'security-audit', parent_id: 'it-support' },
        ]
      }
    ]
  },

  // =============== 4. 마케팅 ===============
  {
    id: 'marketing',
    name: '마케팅',
    slug: 'marketing',
    icon: 'bullhorn',
    service_count: 16,
    description: '효과적인 마케팅 전략',
    children: [
      {
        id: 'digital-advertising',
        name: '디지털 광고',
        slug: 'digital-advertising',
        parent_id: 'marketing',
        children: [
          { id: 'google-ads', name: '구글 광고', slug: 'google-ads', parent_id: 'digital-advertising' },
          { id: 'facebook-ads', name: '페이스북 광고', slug: 'facebook-ads', parent_id: 'digital-advertising' },
          { id: 'naver-ads', name: '네이버 광고', slug: 'naver-ads', parent_id: 'digital-advertising', is_popular: true },
          { id: 'kakao-ads', name: '카카오 광고', slug: 'kakao-ads', parent_id: 'digital-advertising' },
          { id: 'instagram-ads', name: '인스타그램 광고', slug: 'instagram-ads', parent_id: 'digital-advertising' },
        ]
      },
      {
        id: 'content-marketing',
        name: '콘텐츠 마케팅',
        slug: 'content-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'blog-management', name: '블로그 운영 대행', slug: 'blog-management', parent_id: 'content-marketing', is_popular: true },
          { id: 'seo-optimization', name: 'SEO 최적화', slug: 'seo-optimization', parent_id: 'content-marketing', is_popular: true },
          { id: 'content-planning', name: '콘텐츠 기획', slug: 'content-planning', parent_id: 'content-marketing' },
          { id: 'viral-marketing', name: '바이럴 마케팅', slug: 'viral-marketing', parent_id: 'content-marketing' },
        ]
      },
      {
        id: 'sns-marketing',
        name: 'SNS 마케팅',
        slug: 'sns-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'instagram-marketing', name: '인스타그램 마케팅', slug: 'instagram-marketing', parent_id: 'sns-marketing', is_popular: true },
          { id: 'youtube-marketing', name: '유튜브 마케팅', slug: 'youtube-marketing', parent_id: 'sns-marketing', is_popular: true },
          { id: 'facebook-marketing', name: '페이스북 마케팅', slug: 'facebook-marketing', parent_id: 'sns-marketing' },
          { id: 'tiktok-marketing', name: '틱톡 마케팅', slug: 'tiktok-marketing', parent_id: 'sns-marketing' },
          { id: 'naver-blog-marketing', name: '네이버 블로그', slug: 'naver-blog-marketing', parent_id: 'sns-marketing', is_popular: true },
        ]
      },
      {
        id: 'branding-ci',
        name: '브랜딩/CI',
        slug: 'branding-ci',
        parent_id: 'marketing',
        children: [
          { id: 'brand-identity', name: '브랜드 아이덴티티', slug: 'brand-identity', parent_id: 'branding-ci' },
          { id: 'naming', name: '네이밍', slug: 'naming', parent_id: 'branding-ci' },
          { id: 'brand-story', name: '브랜드 스토리', slug: 'brand-story', parent_id: 'branding-ci' },
          { id: 'slogan', name: '슬로건', slug: 'slogan', parent_id: 'branding-ci' },
        ]
      },
      {
        id: 'influencer-marketing',
        name: '인플루언서 마케팅',
        slug: 'influencer-marketing',
        parent_id: 'marketing',
        children: [
          { id: 'influencer-matching', name: '인플루언서 매칭', slug: 'influencer-matching', parent_id: 'influencer-marketing' },
          { id: 'product-review', name: '제품 리뷰', slug: 'product-review', parent_id: 'influencer-marketing' },
          { id: 'sponsored-content', name: '스폰서 콘텐츠', slug: 'sponsored-content', parent_id: 'influencer-marketing' },
        ]
      }
    ]
  },

  // =============== 5. 영상/사진 ===============
  {
    id: 'video-photo',
    name: '영상/사진',
    slug: 'video-photo',
    icon: 'camera',
    service_count: 11,
    description: '영상 제작 및 사진 촬영',
    children: [
      {
        id: 'video-editing',
        name: '영상 편집',
        slug: 'video-editing',
        parent_id: 'video-photo',
        children: [
          { id: 'youtube-editing', name: '유튜브 영상 편집', slug: 'youtube-editing', parent_id: 'video-editing', is_popular: true },
          { id: 'shorts-editing', name: '숏폼 영상 편집', slug: 'shorts-editing', parent_id: 'video-editing', is_popular: true },
          { id: 'vlog-editing', name: '브이로그 편집', slug: 'vlog-editing', parent_id: 'video-editing' },
          { id: 'wedding-video', name: '웨딩 영상', slug: 'wedding-video', parent_id: 'video-editing' },
          { id: 'event-video', name: '행사 영상', slug: 'event-video', parent_id: 'video-editing' },
        ]
      },
      {
        id: 'video-production',
        name: '영상 제작',
        slug: 'video-production',
        parent_id: 'video-photo',
        children: [
          { id: 'promotional-video', name: '홍보 영상', slug: 'promotional-video', parent_id: 'video-production' },
          { id: 'product-video', name: '제품 영상', slug: 'product-video', parent_id: 'video-production' },
          { id: 'drone-filming', name: '드론 촬영', slug: 'drone-filming', parent_id: 'video-production' },
          { id: 'music-video', name: '뮤직비디오', slug: 'music-video', parent_id: 'video-production' },
        ]
      },
      {
        id: 'animation-motion',
        name: '애니메이션/모션',
        slug: 'animation-motion',
        parent_id: 'video-photo',
        children: [
          { id: 'motion-graphics', name: '모션그래픽', slug: 'motion-graphics', parent_id: 'animation-motion' },
          { id: '2d-animation', name: '2D 애니메이션', slug: '2d-animation', parent_id: 'animation-motion' },
          { id: '3d-animation', name: '3D 애니메이션', slug: '3d-animation', parent_id: 'animation-motion' },
          { id: 'whiteboard-animation', name: '화이트보드 애니메이션', slug: 'whiteboard-animation', parent_id: 'animation-motion' },
        ]
      },
      {
        id: 'photography',
        name: '사진 촬영',
        slug: 'photography',
        parent_id: 'video-photo',
        children: [
          { id: 'product-photography', name: '제품 사진', slug: 'product-photography', parent_id: 'photography', is_popular: true },
          { id: 'profile-photography', name: '프로필 사진', slug: 'profile-photography', parent_id: 'photography' },
          { id: 'food-photography', name: '음식 사진', slug: 'food-photography', parent_id: 'photography' },
          { id: 'event-photography', name: '행사 사진', slug: 'event-photography', parent_id: 'photography' },
          { id: 'wedding-photography', name: '웨딩 촬영', slug: 'wedding-photography', parent_id: 'photography' },
        ]
      },
      {
        id: 'photo-editing',
        name: '사진 편집',
        slug: 'photo-editing',
        parent_id: 'video-photo',
        children: [
          { id: 'photo-retouching', name: '사진 보정', slug: 'photo-retouching', parent_id: 'photo-editing', is_popular: true },
          { id: 'background-removal', name: '배경 제거', slug: 'background-removal', parent_id: 'photo-editing' },
          { id: 'photo-restoration', name: '사진 복원', slug: 'photo-restoration', parent_id: 'photo-editing' },
        ]
      }
    ]
  },

  // =============== 6. 번역/통역 ===============
  {
    id: 'translation',
    name: '번역/통역',
    slug: 'translation',
    icon: 'language',
    service_count: 16,
    description: '전문 번역 및 통역 서비스',
    children: [
      {
        id: 'document-translation',
        name: '문서 번역',
        slug: 'document-translation',
        parent_id: 'translation',
        children: [
          { id: 'english-translation', name: '영어 번역', slug: 'english-translation', parent_id: 'document-translation', is_popular: true },
          { id: 'chinese-translation', name: '중국어 번역', slug: 'chinese-translation', parent_id: 'document-translation' },
          { id: 'japanese-translation', name: '일본어 번역', slug: 'japanese-translation', parent_id: 'document-translation' },
          { id: 'spanish-translation', name: '스페인어 번역', slug: 'spanish-translation', parent_id: 'document-translation' },
          { id: 'french-translation', name: '프랑스어 번역', slug: 'french-translation', parent_id: 'document-translation' },
          { id: 'german-translation', name: '독일어 번역', slug: 'german-translation', parent_id: 'document-translation' },
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
          { id: 'simultaneous-interpretation', name: '동시통역', slug: 'simultaneous-interpretation', parent_id: 'interpretation' },
          { id: 'consecutive-interpretation', name: '순차통역', slug: 'consecutive-interpretation', parent_id: 'interpretation' },
          { id: 'business-interpretation', name: '비즈니스 통역', slug: 'business-interpretation', parent_id: 'interpretation' },
        ]
      }
    ]
  },

  // =============== 7. 문서/글쓰기 ===============
  {
    id: 'writing',
    name: '문서/글쓰기',
    slug: 'writing',
    icon: 'pen-fancy',
    service_count: 11,
    description: '전문적인 문서 작성 서비스',
    children: [
      {
        id: 'content-writing',
        name: '콘텐츠 작성',
        slug: 'content-writing',
        parent_id: 'writing',
        children: [
          { id: 'blog-posting', name: '블로그 포스팅', slug: 'blog-posting', parent_id: 'content-writing', is_popular: true },
          { id: 'article-writing', name: '기사 작성', slug: 'article-writing', parent_id: 'content-writing' },
          { id: 'product-description', name: '상품 설명', slug: 'product-description', parent_id: 'content-writing' },
          { id: 'copywriting', name: '카피라이팅', slug: 'copywriting', parent_id: 'content-writing', is_popular: true },
          { id: 'press-release', name: '보도자료', slug: 'press-release', parent_id: 'content-writing' },
          { id: 'script-writing', name: '스크립트 작성', slug: 'script-writing', parent_id: 'content-writing' },
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
        ]
      },
      {
        id: 'academic-documents',
        name: '학술 문서',
        slug: 'academic-documents',
        parent_id: 'writing',
        children: [
          { id: 'thesis-editing', name: '논문 교정', slug: 'thesis-editing', parent_id: 'academic-documents' },
          { id: 'research-paper', name: '연구 보고서', slug: 'research-paper', parent_id: 'academic-documents' },
          { id: 'essay-writing', name: '에세이', slug: 'essay-writing', parent_id: 'academic-documents' },
          { id: 'cv-resume', name: '이력서/자소서', slug: 'cv-resume', parent_id: 'academic-documents', is_popular: true },
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
      }
    ]
  },

  // =============== 8. 음악/오디오 ===============
  {
    id: 'music-audio',
    name: '음악/오디오',
    slug: 'music-audio',
    icon: 'music',
    service_count: 10,
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

  // =============== 9. 비즈니스 ===============
  {
    id: 'business',
    name: '비즈니스',
    slug: 'business',
    icon: 'briefcase',
    service_count: 14,
    description: '비즈니스 성장을 위한 전문 서비스',
    children: [
      {
        id: 'consulting',
        name: '컨설팅',
        slug: 'consulting',
        parent_id: 'business',
        children: [
          { id: 'startup-consulting', name: '창업 컨설팅', slug: 'startup-consulting', parent_id: 'consulting', is_popular: true },
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
    icon: 'palette',
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
    service_count: 14,
    description: '세무, 법률, 노무 전문 서비스',
    children: [
      {
        id: 'tax-service',
        name: '세무 서비스',
        slug: 'tax-service',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'tax-return', name: '세금 신고', slug: 'tax-return', parent_id: 'tax-service' },
          { id: 'tax-consulting', name: '세무 상담', slug: 'tax-consulting', parent_id: 'tax-service' },
        ]
      },
      {
        id: 'legal-service',
        name: '법무 서비스',
        slug: 'legal-service',
        parent_id: 'tax-legal-labor',
        children: [
          { id: 'contract-review', name: '계약서 검토', slug: 'contract-review', parent_id: 'legal-service' },
          { id: 'legal-consulting', name: '법률 상담', slug: 'legal-consulting', parent_id: 'legal-service' },
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
    service_count: 16,
    description: '맞춤형 주문 제작 서비스',
    children: [
      {
        id: 'custom-goods',
        name: '굿즈 제작',
        slug: 'custom-goods',
        parent_id: 'custom-order',
        children: [
          { id: 'tshirt-making', name: '티셔츠 제작', slug: 'tshirt-making', parent_id: 'custom-goods' },
          { id: 'mug-making', name: '머그컵 제작', slug: 'mug-making', parent_id: 'custom-goods' },
          { id: 'sticker-making', name: '스티커 제작', slug: 'sticker-making', parent_id: 'custom-goods' },
        ]
      },
      {
        id: 'printing',
        name: '인쇄물',
        slug: 'printing',
        parent_id: 'custom-order',
        children: [
          { id: 'business-card', name: '명함 인쇄', slug: 'business-card', parent_id: 'printing' },
          { id: 'poster-printing', name: '포스터 인쇄', slug: 'poster-printing', parent_id: 'printing' },
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