'use client'

import React from 'react'
import { Palette, Video, Code2, Megaphone, Wand2, TrendingUp } from 'lucide-react'

interface CardData {
  id: number
  title: string
  icon: React.ElementType
  listItems: string[]
  description: string
  theme: 'purple' | 'indigo' | 'blue' | 'green' | 'pink' | 'teal'
}

const cardData: CardData[] = [
  {
    id: 1,
    title: 'AI 디자인',
    icon: Palette,
    listItems: ['AI 실사 · 모델', 'AI 캐릭터', 'AI 광고소재 디자인'],
    description: 'AI로 다양한 시안을, 더 빠르게!',
    theme: 'purple',
  },
  {
    id: 2,
    title: 'AI 영상 · 사진 · 음향',
    icon: Video,
    listItems: ['AI 광고 영상', 'AI 채팅 사진', 'AI 더빙 · 내레이션'],
    description: '상상만 했던 영상, AI로 실현',
    theme: 'indigo',
  },
  {
    id: 3,
    title: 'AI 개발 · 자동화',
    icon: Code2,
    listItems: ['AI 시스템 서비스', 'AI 자동화 프로그램', 'AI 모델링 최적화'],
    description: '업무 자동화부터 LLM 챗봇 도입까지',
    theme: 'blue',
  },
  {
    id: 4,
    title: 'AI 마케팅 · 글작성',
    icon: Megaphone,
    listItems: ['AI 마케팅 콘텐츠', 'AI SEO · GEO', 'AI 프린트 생성'],
    description: '압도적인 글쓰기, 정확한 노출, AI답게',
    theme: 'green',
  },
  {
    id: 5,
    title: 'AI 프롬프트',
    icon: Wand2,
    listItems: ['디자인 프롬프트', '글쓰기 프롬프트', '영상 프롬프트'],
    description: '원하는 결과물, 더 정확하게!',
    theme: 'pink',
  },
  {
    id: 6,
    title: 'AI 활용 · 수익화',
    icon: TrendingUp,
    listItems: ['AI 수익화', 'AI 컨설팅', 'AI 교육'],
    description: 'AI로 N잡러부터 사업화까지',
    theme: 'teal',
  },
]

const THEMES = {
  purple: {
    gradient: 'from-violet-500 to-purple-500',
    beforeBg: 'before:bg-gradient-to-br before:from-violet-50 before:to-purple-50',
    afterBg: 'after:bg-gradient-to-r after:from-violet-500 after:to-purple-500',
    bulletColor: 'text-violet-500',
    borderColor: 'border-violet-200 hover:border-violet-300',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-500',
    beforeBg: 'before:bg-gradient-to-br before:from-indigo-50 before:to-blue-50',
    afterBg: 'after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500',
    bulletColor: 'text-indigo-500',
    borderColor: 'border-indigo-200 hover:border-indigo-300',
  },
  blue: {
    gradient: 'from-blue-500 to-sky-500',
    beforeBg: 'before:bg-gradient-to-br before:from-blue-50 before:to-sky-50',
    afterBg: 'after:bg-gradient-to-r after:from-blue-500 after:to-sky-500',
    bulletColor: 'text-blue-500',
    borderColor: 'border-sky-200 hover:border-sky-300',
  },
  green: {
    gradient: 'from-emerald-500 to-green-500',
    beforeBg: 'before:bg-gradient-to-br before:from-emerald-50 before:to-green-50',
    afterBg: 'after:bg-gradient-to-r after:from-emerald-500 after:to-green-500',
    bulletColor: 'text-emerald-500',
    borderColor: 'border-emerald-200 hover:border-emerald-300',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    beforeBg: 'before:bg-gradient-to-br before:from-pink-50 before:to-rose-50',
    afterBg: 'after:bg-gradient-to-r after:from-pink-500 after:to-rose-500',
    bulletColor: 'text-pink-500',
    borderColor: 'border-pink-200 hover:border-pink-300',
  },
  teal: {
    gradient: 'from-teal-500 to-cyan-500',
    beforeBg: 'before:bg-gradient-to-br before:from-teal-50 before:to-cyan-50',
    afterBg: 'after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500',
    bulletColor: 'text-teal-500',
    borderColor: 'border-cyan-200 hover:border-cyan-300',
  },
}

interface CardProps {
  data: CardData
  animationDelay: string
}

const Card: React.FC<CardProps> = ({ data, animationDelay }) => {
  const { title, icon: Icon, listItems, description, theme } = data
  const currentTheme = THEMES[theme]

  return (
    <div
      className={`group relative bg-white bg-opacity-60 backdrop-blur-sm p-7 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border shadow-lg hover:shadow-2xl hover:-translate-y-3 ${currentTheme.beforeBg} ${currentTheme.afterBg} ${currentTheme.borderColor}`}
      style={{ animationDelay }}
    >
      {/* Background Hover Effect */}
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-95 transition-opacity duration-400" />

      {/* Top Border Hover Effect */}
      <div className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      <div className="relative z-10 flex flex-col">
        <header className="flex items-center gap-4 mb-4">
          <Icon className={`w-12 h-12 flex-shrink-0 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-120 group-hover:rotate-12 ${currentTheme.bulletColor}`} />
          <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{title}</h3>
        </header>

        <ul className="list-none mb-4 space-y-1">
          {listItems.map((item, index) => (
            <li key={index} className="text-gray-600 pl-6 relative text-base group-hover:text-gray-900 transition-colors duration-300">
              <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-current ${currentTheme.bulletColor}`} />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-gray-500 text-sm font-semibold pt-4 border-t border-gray-900/10">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function AIServicesShowcase() {
  return (
    <section className="pt-0 pb-12 md:py-24 bg-white overflow-hidden">
      <div className="container-1200 px-4">
        {/* 제목 */}
        <div className="mb-6 md:mb-8">
          <span className="text-xs md:text-sm font-bold uppercase text-[#0f3460]">AI Services</span>
          <h2 className="text-lg md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            미래를 여는 기술, AI 전문가
          </h2>
        </div>

        {/* 모바일: 가로 스크롤 */}
        <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-4 snap-x snap-mandatory md:hidden hide-scrollbar">
          {cardData.map((data, index) => (
            <div key={data.id} className="w-[85vw] max-w-sm flex-shrink-0 snap-center">
              <Card data={data} animationDelay={`${index * 100}ms`} />
            </div>
          ))}
        </div>

        {/* 데스크톱: 그리드 */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cardData.map((data, index) => (
            <Card key={data.id} data={data} animationDelay={`${index * 100}ms`} />
          ))}
        </div>
      </div>
    </section>
  )
}
