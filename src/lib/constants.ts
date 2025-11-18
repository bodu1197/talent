import { Category } from '@/types'

export const AI_TOOLS = {
  IMAGE: ['Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Leonardo AI', 'Adobe Firefly'],
  VIDEO: ['Runway', 'Pika Labs', 'Synthesia', 'D-ID', 'HeyGen'],
  WRITING: ['ChatGPT', 'Claude', 'Gemini', 'Jasper', 'Copy.ai'],
  CODING: ['GitHub Copilot', 'Cursor', 'Tabnine', 'Amazon CodeWhisperer', 'Replit AI'],
  AUDIO: ['ElevenLabs', 'Murf', 'Speechify', 'WellSaid Labs', 'Resemble AI'],
  MUSIC: ['Suno AI', 'Soundraw', 'Boomy', 'Amper Music', 'AIVA']
} as const

export const CATEGORIES: Category[] = [
  // AI 카테고리
  {
    id: 'ai-image-design',
    name: 'AI 이미지/디자인',
    slug: 'ai-image-design',
    description: 'Midjourney, DALL-E, Stable Diffusion을 활용한 창의적인 디자인',
    icon: '🎨',
    display_order: 1,
    is_ai: true,
    is_active: true,
    created_at: new Date().toISOString(),
    children: [
      {
        id: 'ai-logo-brand',
        name: 'AI 로고/브랜딩',
        slug: 'ai-logo-brand',
        parent_id: 'ai-image-design',
        display_order: 1,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-illustration',
        name: 'AI 일러스트레이션',
        slug: 'ai-illustration',
        parent_id: 'ai-image-design',
        display_order: 2,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-product-image',
        name: 'AI 제품 이미지',
        slug: 'ai-product-image',
        parent_id: 'ai-image-design',
        display_order: 3,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-social-media',
        name: 'AI 소셜미디어 디자인',
        slug: 'ai-social-media',
        parent_id: 'ai-image-design',
        display_order: 4,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ai-video-motion',
    name: 'AI 영상/모션',
    slug: 'ai-video-motion',
    description: 'Runway, Pika Labs를 활용한 매력적인 영상 제작',
    icon: '🎬',
    display_order: 2,
    is_ai: true,
    is_active: true,
    created_at: new Date().toISOString(),
    children: [
      {
        id: 'ai-video-editing',
        name: 'AI 영상 편집',
        slug: 'ai-video-editing',
        parent_id: 'ai-video-motion',
        display_order: 1,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-animation',
        name: 'AI 애니메이션',
        slug: 'ai-animation',
        parent_id: 'ai-video-motion',
        display_order: 2,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-avatar-video',
        name: 'AI 아바타 영상',
        slug: 'ai-avatar-video',
        parent_id: 'ai-video-motion',
        display_order: 3,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ai-writing-content',
    name: 'AI 글쓰기/콘텐츠',
    slug: 'ai-writing-content',
    description: 'ChatGPT, Claude를 활용한 전문 콘텐츠 작성',
    icon: '✍️',
    display_order: 3,
    is_ai: true,
    is_active: true,
    created_at: new Date().toISOString(),
    children: [
      {
        id: 'ai-blog-article',
        name: 'AI 블로그/아티클',
        slug: 'ai-blog-article',
        parent_id: 'ai-writing-content',
        display_order: 1,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-marketing-copy',
        name: 'AI 마케팅 카피',
        slug: 'ai-marketing-copy',
        parent_id: 'ai-writing-content',
        display_order: 2,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-translation',
        name: 'AI 번역/현지화',
        slug: 'ai-translation',
        parent_id: 'ai-writing-content',
        display_order: 3,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ai-programming',
    name: 'AI 프로그래밍',
    slug: 'ai-programming',
    description: 'GitHub Copilot, Cursor를 활용한 스마트 개발',
    icon: '💻',
    display_order: 4,
    is_ai: true,
    is_active: true,
    created_at: new Date().toISOString(),
    children: [
      {
        id: 'ai-web-development',
        name: 'AI 웹 개발',
        slug: 'ai-web-development',
        parent_id: 'ai-programming',
        display_order: 1,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-app-development',
        name: 'AI 앱 개발',
        slug: 'ai-app-development',
        parent_id: 'ai-programming',
        display_order: 2,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-automation',
        name: 'AI 자동화/스크립트',
        slug: 'ai-automation',
        parent_id: 'ai-programming',
        display_order: 3,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'ai-audio-music',
    name: 'AI 음악/사운드',
    slug: 'ai-audio-music',
    description: 'Suno AI, ElevenLabs를 활용한 오디오 제작',
    icon: '🎵',
    display_order: 5,
    is_ai: true,
    is_active: true,
    created_at: new Date().toISOString(),
    children: [
      {
        id: 'ai-music-composition',
        name: 'AI 음악 작곡',
        slug: 'ai-music-composition',
        parent_id: 'ai-audio-music',
        display_order: 1,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'ai-voice-over',
        name: 'AI 보이스오버',
        slug: 'ai-voice-over',
        parent_id: 'ai-audio-music',
        display_order: 2,
        is_ai: true,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  },
  // 일반 카테고리
  {
    id: 'general-design',
    name: '일반 디자인',
    slug: 'general-design',
    description: '전통적인 디자인 서비스',
    icon: '🎨',
    display_order: 10,
    is_ai: false,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'general-development',
    name: '일반 개발',
    slug: 'general-development',
    description: '전통적인 개발 서비스',
    icon: '💻',
    display_order: 11,
    is_ai: false,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'marketing',
    name: '마케팅',
    slug: 'marketing',
    description: '디지털 마케팅 서비스',
    icon: '📢',
    display_order: 12,
    is_ai: false,
    is_active: true,
    created_at: new Date().toISOString()
  }
]

export const PACKAGE_TYPES = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  CUSTOM: 'custom'
} as const

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const SERVICE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  REJECTED: 'rejected'
} as const