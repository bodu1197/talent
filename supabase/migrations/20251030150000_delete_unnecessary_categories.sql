-- ============================================
-- 불필요한 7개 카테고리 삭제
-- ============================================
-- 이 카테고리들은 초기 스키마에서 생성되었지만
-- categories-full.ts에 정의되지 않은 카테고리들입니다.

-- 삭제할 카테고리 목록:
-- 1. ai-image-design (AI 이미지/디자인)
-- 2. ai-programming (AI 프로그래밍/개발)
-- 3. ai-video-motion (AI 영상/모션)
-- 4. ai-music-sound (AI 음악/사운드)
-- 5. ai-writing-content (AI 글쓰기/콘텐츠)
-- 6. general-design (일반 디자인)
-- 7. general-development (일반 개발)

-- 카테고리 삭제 (CASCADE로 인해 연결된 하위 카테고리도 함께 삭제됨)
DELETE FROM public.categories
WHERE slug IN (
    'ai-image-design',
    'ai-programming',
    'ai-video-motion',
    'ai-music-sound',
    'ai-writing-content',
    'general-design',
    'general-development'
);
