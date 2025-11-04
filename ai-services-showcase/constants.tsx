import React from 'react';
import type { CardData } from './types';
import { DesignIcon, VideoIcon, CodeIcon, MarketingIcon, PromptIcon, GrowthIcon } from './components/Icons';

export const cardData: CardData[] = [
  {
    id: 1,
    title: 'AI 디자인',
    icon: DesignIcon,
    listItems: ['AI 실사 · 모델', 'AI 캐릭터', 'AI 광고소재 디자인'],
    description: 'AI로 다양한 시안을, 더 빠르게!',
    theme: 'purple',
  },
  {
    id: 2,
    title: 'AI 영상 · 사진 · 음향',
    icon: VideoIcon,
    listItems: ['AI 광고 영상', 'AI 채팅 사진', 'AI 더빙 · 내레이션'],
    description: '상상만 했던 영상, AI로 실현',
    theme: 'indigo',
  },
  {
    id: 3,
    title: 'AI 개발 · 자동화',
    icon: CodeIcon,
    listItems: ['AI 시스템 서비스', 'AI 자동화 프로그램', 'AI 모델링 최적화'],
    description: '업무 자동화부터 LLM 챗봇 도입까지',
    theme: 'blue',
  },
  {
    id: 4,
    title: 'AI 마케팅 · 글작성',
    icon: MarketingIcon,
    listItems: ['AI 마케팅 콘텐츠', 'AI SEO · GEO', 'AI 프린트 생성'],
    description: '압도적인 글쓰기, 정확한 노출, AI답게',
    theme: 'green',
  },
  {
    id: 5,
    title: 'AI 프롬프트',
    icon: PromptIcon,
    listItems: ['디자인 프롬프트', '글쓰기 프롬프트', '영상 프롬프트'],
    description: '원하는 결과물, 더 정확하게!',
    theme: 'pink',
  },
  {
    id: 6,
    title: 'AI 활용 · 수익화',
    icon: GrowthIcon,
    listItems: ['AI 수익화', 'AI 컨설팅', 'AI 교육'],
    description: 'AI로 N잡러부터 사업화까지',
    theme: 'teal',
  },
];