'use client'

import { useState, useEffect, useRef } from 'react'
import { type GradientTemplate, createGradientBackground } from '@/lib/template-generator'

interface TextStyle {
  text: string
  x: number // 0-1
  y: number // 0-1
  fontSize: number
  color: string
  textAlign: CanvasTextAlign
  fontWeight: string
  shadowBlur: number
}

interface Props {
  template: GradientTemplate
  onTextChange: (style: TextStyle) => void
  initialText?: string
}

const PRESET_COLORS = [
  { name: '화이트', value: '#ffffff' },
  { name: '블랙', value: '#000000' },
  { name: '브랜드 블루', value: '#0f3460' },
  { name: '골드', value: '#ffd700' },
  { name: '실버', value: '#c0c0c0' },
]

const PRESET_POSITIONS = [
  { name: '상단 중앙', x: 0.5, y: 0.25 },
  { name: '중앙', x: 0.5, y: 0.5 },
  { name: '하단 중앙', x: 0.5, y: 0.75 },
  { name: '좌측 상단', x: 0.25, y: 0.25 },
  { name: '우측 상단', x: 0.75, y: 0.25 },
]

export default function TextOverlayEditor({ template, onTextChange, initialText = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [textStyle, setTextStyle] = useState<TextStyle>({
    text: initialText,
    x: 0.5,
    y: 0.5,
    fontSize: 48,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    shadowBlur: 10,
  })

  // 텍스트 스타일 변경 시 부모에게 전달
  useEffect(() => {
    onTextChange(textStyle)
  }, [textStyle, onTextChange])

  // Canvas에 미리보기 그리기
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const displayWidth = canvas.offsetWidth
    const displayHeight = canvas.offsetHeight

    // 실제 캔버스 해상도 (652x488)
    canvas.width = 652
    canvas.height = 488

    const ctx = canvas.getContext('2d')!

    // 1. 배경 그리기
    const bgCanvas = createGradientBackground(template, 652, 488)
    ctx.drawImage(bgCanvas, 0, 0)

    // 2. 텍스트가 있으면 그리기
    if (textStyle.text.trim()) {
      ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px "Noto Sans KR", sans-serif`
      ctx.fillStyle = textStyle.color
      ctx.textAlign = textStyle.textAlign
      ctx.textBaseline = 'middle'

      // 그림자
      if (textStyle.shadowBlur > 0) {
        ctx.shadowBlur = textStyle.shadowBlur
        ctx.shadowColor = 'rgba(0,0,0,0.5)'
      }

      const actualX = textStyle.x * 652
      const actualY = textStyle.y * 488

      ctx.fillText(textStyle.text, actualX, actualY)
    }
  }, [template, textStyle])

  const handleTextChange = (value: string) => {
    // 최대 25자 제한
    if (value.length <= 25) {
      setTextStyle(prev => ({ ...prev, text: value }))
    }
  }

  return (
    <div className="space-y-6">
      {/* 미리보기 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <i className="fas fa-eye text-brand-primary"></i>
          미리보기
        </h3>
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ aspectRatio: '652/488' }}
          />
        </div>
      </div>

      {/* 텍스트 입력 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-text text-brand-primary"></i>
          텍스트 입력
          <span className="text-sm text-gray-500 font-normal">
            ({textStyle.text.length}/25자)
          </span>
        </label>
        <input
          type="text"
          value={textStyle.text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="최대 25자까지 입력 가능 (띄어쓰기 포함)"
          maxLength={25}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-lg"
        />
      </div>

      {/* 위치 프리셋 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-location-dot text-brand-primary"></i>
          텍스트 위치
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_POSITIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setTextStyle(prev => ({ ...prev, x: preset.x, y: preset.y, textAlign: 'center' }))}
              className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                textStyle.x === preset.x && textStyle.y === preset.y
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'border-gray-300 hover:border-brand-primary'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 텍스트 색상 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-palette text-brand-primary"></i>
          텍스트 색상
        </label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setTextStyle(prev => ({ ...prev, color: color.value }))}
              className={`relative h-12 rounded-lg border-2 transition-all ${
                textStyle.color === color.value
                  ? 'border-brand-primary scale-105'
                  : 'border-gray-300 hover:border-brand-primary'
              }`}
              style={{ backgroundColor: color.value }}
            >
              {textStyle.color === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className={`fas fa-check text-xl ${
                    color.value === '#ffffff' ? 'text-gray-800' : 'text-white'
                  }`}></i>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 텍스트 크기 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-text-height text-brand-primary"></i>
          텍스트 크기
          <span className="text-sm text-gray-500 font-normal">({textStyle.fontSize}px)</span>
        </label>
        <input
          type="range"
          min="24"
          max="96"
          step="4"
          value={textStyle.fontSize}
          onChange={(e) => setTextStyle(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>작게 (24px)</span>
          <span>크게 (96px)</span>
        </div>
      </div>

      {/* 텍스트 굵기 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-bold text-brand-primary"></i>
          텍스트 굵기
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '보통', value: 'normal' },
            { label: '중간', value: '600' },
            { label: '굵게', value: 'bold' },
          ].map((weight) => (
            <button
              key={weight.value}
              type="button"
              onClick={() => setTextStyle(prev => ({ ...prev, fontWeight: weight.value }))}
              className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                textStyle.fontWeight === weight.value
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'border-gray-300 hover:border-brand-primary'
              }`}
            >
              {weight.label}
            </button>
          ))}
        </div>
      </div>

      {/* 그림자 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <i className="fas fa-circle-half-stroke text-brand-primary"></i>
          텍스트 그림자
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="2"
          value={textStyle.shadowBlur}
          onChange={(e) => setTextStyle(prev => ({ ...prev, shadowBlur: parseInt(e.target.value) }))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>없음</span>
          <span>강하게</span>
        </div>
      </div>

      {/* 중요 안내 */}
      <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
        <div className="flex items-start gap-3">
          <i className="fas fa-lightbulb text-blue-600 text-xl mt-0.5"></i>
          <div>
            <p className="font-bold text-blue-900 mb-1">중요!</p>
            <p className="text-sm text-blue-800">
              편집이 완료되면 반드시 아래 <strong>"썸네일 생성하기"</strong> 버튼을 눌러주세요.
              버튼을 누르지 않으면 썸네일이 저장되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
