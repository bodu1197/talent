/**
 * 서비스 썸네일 배경 템플릿 생성 유틸리티
 * Canvas API를 사용하여 652x488px 그라디언트 배경 생성
 * 텍스트 최대 25자 지원
 */

export interface GradientTemplate {
  id: string;
  name: string;
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number; // linear용 (도 단위)
}

export const BACKGROUND_TEMPLATES: GradientTemplate[] = [
  // 비즈니스/전문가 느낌
  {
    id: 'bg-1',
    name: '프로페셔널 블루',
    type: 'linear',
    colors: ['#0f3460', '#1a5490'],
    angle: 135,
  },
  { id: 'bg-2', name: '다크 네이비', type: 'linear', colors: ['#2c3e50', '#3498db'], angle: 45 },
  {
    id: 'bg-3',
    name: '비즈니스 그레이',
    type: 'linear',
    colors: ['#434343', '#000000'],
    angle: 180,
  },

  // 크리에이티브/디자인
  {
    id: 'bg-4',
    name: '크리에이티브 퍼플',
    type: 'linear',
    colors: ['#667eea', '#764ba2'],
    angle: 135,
  },
  { id: 'bg-5', name: '선셋 오렌지', type: 'linear', colors: ['#f093fb', '#f5576c'], angle: 45 },
  { id: 'bg-6', name: '트로피컬 블루', type: 'linear', colors: ['#4facfe', '#00f2fe'], angle: 90 },

  // 활기찬/에너지
  { id: 'bg-7', name: '에너지 레드', type: 'linear', colors: ['#fa709a', '#fee140'], angle: 135 },
  { id: 'bg-8', name: '프레시 그린', type: 'linear', colors: ['#30cfd0', '#330867'], angle: 45 },
  { id: 'bg-9', name: '스카이 블루', type: 'linear', colors: ['#a8edea', '#fed6e3'], angle: 180 },

  // 우아한/고급스러운
  { id: 'bg-10', name: '골드 럭셔리', type: 'linear', colors: ['#ffd89b', '#19547b'], angle: 135 },
  { id: 'bg-11', name: '로얄 퍼플', type: 'linear', colors: ['#a044ff', '#6a3093'], angle: 90 },
  { id: 'bg-12', name: '미드나잇 블루', type: 'linear', colors: ['#2d3561', '#c05c7e'], angle: 45 },

  // Radial 그라디언트
  { id: 'bg-13', name: '스포트라이트', type: 'radial', colors: ['#ffffff', '#0f3460'] },
  { id: 'bg-14', name: '센터 글로우', type: 'radial', colors: ['#ffecd2', '#fcb69f'] },
  { id: 'bg-15', name: '다크 센터', type: 'radial', colors: ['#434343', '#000000'] },

  // 모던/미니멀
  { id: 'bg-16', name: '모던 핑크', type: 'linear', colors: ['#ff9a9e', '#fecfef'], angle: 120 },
  { id: 'bg-17', name: '민트 프레시', type: 'linear', colors: ['#a1ffce', '#faffd1'], angle: 135 },
  { id: 'bg-18', name: '소프트 피치', type: 'linear', colors: ['#ffecd2', '#fcb69f'], angle: 90 },

  // AI/테크 느낌
  { id: 'bg-19', name: 'AI 사이버', type: 'linear', colors: ['#08aeea', '#2af598'], angle: 45 },
  { id: 'bg-20', name: '테크 퓨처', type: 'linear', colors: ['#3f5efb', '#fc466b'], angle: 135 },
];

/**
 * Canvas에 그라디언트 배경 생성
 */
export function createGradientBackground(
  template: GradientTemplate,
  width: number = 652,
  height: number = 488
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  let gradient: CanvasGradient;

  if (template.type === 'linear') {
    // 각도를 라디안으로 변환
    const angle = (template.angle || 135) * (Math.PI / 180);

    // 시작점과 끝점 계산
    const x0 = width / 2 - (Math.cos(angle) * width) / 2;
    const y0 = height / 2 - (Math.sin(angle) * height) / 2;
    const x1 = width / 2 + (Math.cos(angle) * width) / 2;
    const y1 = height / 2 + (Math.sin(angle) * height) / 2;

    gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  } else {
    // Radial gradient
    gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2
    );
  }

  // 색상 추가
  for (const [index, color] of template.colors.entries()) {
    gradient.addColorStop(index / (template.colors.length - 1), color);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

/**
 * 배경 이미지 + 텍스트 오버레이로 최종 썸네일 생성
 */
export interface TextOverlayOptions {
  text: string;
  x: number; // 0-1 비율 (0.5 = 중앙)
  y: number; // 0-1 비율 (0.5 = 중앙)
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: CanvasTextAlign;
  fontWeight: string;
  shadowBlur?: number;
  shadowColor?: string;
}

export async function generateThumbnailWithText(
  template: GradientTemplate,
  textOptions: TextOverlayOptions,
  width: number = 652,
  height: number = 488
): Promise<Blob> {
  // 1. 배경 생성
  const canvas = createGradientBackground(template, width, height);
  const ctx = canvas.getContext('2d')!;

  // 2. 텍스트 그리기 설정
  ctx.font = `${textOptions.fontWeight} ${textOptions.fontSize}px ${textOptions.fontFamily}`;
  ctx.fillStyle = textOptions.color;
  ctx.textAlign = textOptions.textAlign;
  ctx.textBaseline = 'middle';

  // 텍스트 그림자 (선택사항)
  if (textOptions.shadowBlur) {
    ctx.shadowBlur = textOptions.shadowBlur;
    ctx.shadowColor = textOptions.shadowColor || 'rgba(0,0,0,0.5)';
  }

  // 좌우 여백 설정 (전체 너비의 10%)
  const horizontalPadding = width * 0.1;
  const maxTextWidth = width - horizontalPadding * 2;

  // 텍스트를 2줄로 분할 (개선된 로직)
  const words = textOptions.text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxTextWidth) {
      // 단어 하나가 너무 긴 경우 강제로 자름
      if (ctx.measureText(word).width > maxTextWidth) {
        // 현재 줄이 있으면 먼저 push
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }

        // 긴 단어를 글자 단위로 쪼개서 넣기
        let remainingWord = word;
        while (remainingWord) {
          let sliceLength = 1;
          while (sliceLength <= remainingWord.length) {
            const slice = remainingWord.substring(0, sliceLength);
            if (ctx.measureText(slice).width > maxTextWidth) {
              // 넘치기 직전까지 자름
              const validSlice = remainingWord.substring(0, sliceLength - 1);
              lines.push(validSlice);
              remainingWord = remainingWord.substring(sliceLength - 1);
              break;
            }
            if (sliceLength === remainingWord.length) {
              // 남은 단어가 한 줄에 들어감
              currentLine = remainingWord;
              remainingWord = '';
              break;
            }
            sliceLength++;
          }
        }
      } else {
        // 일반적인 줄바꿈
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // 최대 2줄까지만 표시
  const displayLines = lines.slice(0, 2);

  // 실제 위치 계산
  let actualX = textOptions.x * width;
  let actualY = textOptions.y * height;

  // textAlign에 따라 X 좌표 조정 (여백 고려)
  if (textOptions.textAlign === 'left') {
    actualX = Math.max(actualX, horizontalPadding);
  } else if (textOptions.textAlign === 'right') {
    actualX = Math.min(actualX, width - horizontalPadding);
  }

  // 2줄일 경우 줄 간격 설정
  const lineHeight = textOptions.fontSize * 1.3;

  if (displayLines.length === 2) {
    // 2줄이면 중앙 기준으로 위아래 배치
    actualY -= lineHeight / 2;
  }

  // 각 줄 그리기
  for (const [index, line] of displayLines.entries()) {
    const y = actualY + index * lineHeight;
    ctx.fillText(line, actualX, y);
  }

  // 3. Canvas를 Blob으로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.95
    );
  });
}

/**
 * 템플릿 미리보기 이미지 생성 (작은 사이즈)
 */
export function createTemplatePreview(
  template: GradientTemplate,
  width: number = 200,
  height: number = 150
): string {
  const canvas = createGradientBackground(template, width, height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
