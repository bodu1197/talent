'use client';

import { useState, useEffect, useRef } from 'react';
import { type GradientTemplate, createGradientBackground } from '@/lib/template-generator';
import {
  FaEye,
  FaFont,
  FaKeyboard,
  FaMapMarkerAlt,
  FaPalette,
  FaTextHeight,
  FaBold,
  FaAdjust,
  FaLightbulb,
  FaCheck,
} from 'react-icons/fa';

interface TextStyle {
  text: string;
  x: number; // 0-1
  y: number; // 0-1
  fontSize: number;
  color: string;
  textAlign: CanvasTextAlign;
  fontWeight: string;
  shadowBlur: number;
}

interface Props {
  readonly template: GradientTemplate;
  readonly onTextChange: (style: TextStyle) => void;
  readonly initialText?: string;
}

const PRESET_COLORS = [
  { name: '화이트', value: '#ffffff' },
  { name: '블랙', value: '#000000' },
  { name: '브랜드 블루', value: '#0f3460' },
  { name: '골드', value: '#ffd700' },
  { name: '실버', value: '#c0c0c0' },
];

const PRESET_POSITIONS = [
  { name: '상단 중앙', x: 0.5, y: 0.25 },
  { name: '중앙', x: 0.5, y: 0.5 },
  { name: '하단 중앙', x: 0.5, y: 0.75 },
  { name: '좌측 상단', x: 0.25, y: 0.25 },
  { name: '우측 상단', x: 0.75, y: 0.25 },
];

export default function TextOverlayEditor({ template, onTextChange, initialText = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    text: initialText,
    x: 0.5,
    y: 0.5,
    fontSize: 48,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    shadowBlur: 10,
  });

  // 텍스트 스타일 변경 시 부모에게 전달
  useEffect(() => {
    onTextChange(textStyle);
  }, [textStyle, onTextChange]);

  // Canvas에 미리보기 그리기
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    initializeCanvas(canvas);

    const ctx = canvas.getContext('2d')!;
    drawBackground(ctx);

    if (textStyle.text.trim()) {
      drawText(ctx);
    }
  }, [template, textStyle]);

  // Helper functions for canvas rendering
  function initializeCanvas(canvas: HTMLCanvasElement) {
    canvas.width = 652;
    canvas.height = 488;
  }

  function drawBackground(ctx: CanvasRenderingContext2D) {
    const bgCanvas = createGradientBackground(template, 652, 488);
    ctx.drawImage(bgCanvas, 0, 0);
  }

  function setupTextContext(ctx: CanvasRenderingContext2D) {
    ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px "Noto Sans KR", sans-serif`;
    ctx.fillStyle = textStyle.color;
    ctx.textAlign = textStyle.textAlign;
    ctx.textBaseline = 'middle';

    if (textStyle.shadowBlur > 0) {
      ctx.shadowBlur = textStyle.shadowBlur;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
    }
  }

  function wrapTextLines(ctx: CanvasRenderingContext2D, maxTextWidth: number): string[] {
    const manualLines = textStyle.text.split('\n');
    const lines: string[] = [];

    for (const manualLine of manualLines) {
      const words = manualLine.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxTextWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines.slice(0, 3); // 최대 3줄까지 표시
  }

  function calculateTextPosition(width: number, height: number, horizontalPadding: number) {
    let actualX = textStyle.x * width;
    const actualY = textStyle.y * height;

    // textAlign에 따라 X 좌표 조정 (여백 고려)
    if (textStyle.textAlign === 'left') {
      actualX = Math.max(actualX, horizontalPadding);
    } else if (textStyle.textAlign === 'right') {
      actualX = Math.min(actualX, width - horizontalPadding);
    }

    return { actualX, actualY };
  }

  function drawText(ctx: CanvasRenderingContext2D) {
    setupTextContext(ctx);

    const width = 652;
    const height = 488;
    const horizontalPadding = width * 0.1;
    const maxTextWidth = width - horizontalPadding * 2;

    const displayLines = wrapTextLines(ctx, maxTextWidth);
    const { actualX, actualY: baseY } = calculateTextPosition(width, height, horizontalPadding);

    // 줄 간격 설정
    const lineHeight = textStyle.fontSize * 1.3;

    // 여러 줄일 경우 중앙 정렬을 위한 Y 위치 조정
    const adjustedY =
      displayLines.length > 1 ? baseY - (lineHeight * (displayLines.length - 1)) / 2 : baseY;

    // 각 줄 그리기
    for (const [index, line] of displayLines.entries()) {
      const y = adjustedY + index * lineHeight;
      ctx.fillText(line, actualX, y);
    }
  }

  const handleTextChange = (value: string) => {
    // 최대 25자 제한
    if (value.length <= 25) {
      setTextStyle((prev) => ({ ...prev, text: value }));
    }
  };

  return (
    <div className="space-y-6">
      {/* 미리보기 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FaEye className="text-brand-primary" />
          미리보기
        </h3>
        <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
          <canvas ref={canvasRef} className="w-full h-auto" style={{ aspectRatio: '652/488' }} />
        </div>
      </div>

      {/* 텍스트 입력 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <FaFont className="text-brand-primary" />
          텍스트 입력
          <span className="text-sm text-gray-500 font-normal">({textStyle.text.length}/25자)</span>
        </label>
        <textarea
          value={textStyle.text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={(e) => {
            // Enter 키 누를 때 form submit 방지
            if (e.key === 'Enter') {
              e.stopPropagation();
            }
          }}
          placeholder="예시:&#10;AI 서비스&#10;전문가"
          maxLength={25}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-lg resize-none"
        />
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900 font-medium mb-1">
            <FaKeyboard className="mr-1 inline" />
            줄바꿈 방법
          </p>
          <p className="text-xs text-blue-800">
            <strong>키보드 Enter 키</strong>를 누르면 다음 줄로 이동합니다.
            <br />
            예: "AI 서비스" 입력 후{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs">
              Enter
            </kbd>{' '}
            누르고 "전문가" 입력
          </p>
        </div>
      </div>

      {/* 위치 프리셋 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <FaMapMarkerAlt className="text-brand-primary" />
          텍스트 위치
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESET_POSITIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() =>
                setTextStyle((prev) => ({
                  ...prev,
                  x: preset.x,
                  y: preset.y,
                  textAlign: 'center',
                }))
              }
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
          <FaPalette className="text-brand-primary" />
          텍스트 색상
        </label>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setTextStyle((prev) => ({ ...prev, color: color.value }))}
              className={`relative h-12 rounded-lg border-2 transition-all ${
                textStyle.color === color.value
                  ? 'border-brand-primary scale-105'
                  : 'border-gray-300 hover:border-brand-primary'
              }`}
              style={{ backgroundColor: color.value }}
            >
              {textStyle.color === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaCheck
                    className={`text-xl ${
                      color.value === '#ffffff' ? 'text-gray-800' : 'text-white'
                    }`}
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 텍스트 크기 */}
      <div className="space-y-2">
        <label className="block font-semibold flex items-center gap-2">
          <FaTextHeight className="text-brand-primary" />
          텍스트 크기
          <span className="text-sm text-gray-500 font-normal">({textStyle.fontSize}px)</span>
        </label>
        <input
          type="range"
          min="24"
          max="96"
          step="4"
          value={textStyle.fontSize}
          onChange={(e) =>
            setTextStyle((prev) => ({
              ...prev,
              fontSize: Number.parseInt(e.target.value),
            }))
          }
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
          <FaBold className="text-brand-primary" />
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
              onClick={() => setTextStyle((prev) => ({ ...prev, fontWeight: weight.value }))}
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
          <FaAdjust className="text-brand-primary" />
          텍스트 그림자
        </label>
        <input
          type="range"
          min="0"
          max="20"
          step="2"
          value={textStyle.shadowBlur}
          onChange={(e) =>
            setTextStyle((prev) => ({
              ...prev,
              shadowBlur: Number.parseInt(e.target.value),
            }))
          }
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
          <FaLightbulb className="text-blue-600 text-xl mt-0.5" />
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
  );
}
