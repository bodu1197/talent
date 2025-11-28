import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TemplateSelector from '@/components/services/TemplateSelector';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock template-generator
const mockTemplates = [
  { id: 'gradient-blue', name: '파란 그라디언트', colors: ['#0000FF', '#00FFFF'] },
  { id: 'gradient-purple', name: '보라 그라디언트', colors: ['#800080', '#FF00FF'] },
  { id: 'gradient-green', name: '초록 그라디언트', colors: ['#00FF00', '#008000'] },
];

vi.mock('@/lib/template-generator', () => ({
  BACKGROUND_TEMPLATES: [
    { id: 'gradient-blue', name: '파란 그라디언트', colors: ['#0000FF', '#00FFFF'] },
    { id: 'gradient-purple', name: '보라 그라디언트', colors: ['#800080', '#FF00FF'] },
    { id: 'gradient-green', name: '초록 그라디언트', colors: ['#00FF00', '#008000'] },
  ],
  createTemplatePreview: (template: { id: string }, _width: number, _height: number) =>
    `data:image/png;base64,${template.id}`,
}));

describe('TemplateSelector', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컴포넌트를 렌더링한다', () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('배경 템플릿 선택')).toBeInTheDocument();
  });

  it('템플릿 개수를 표시한다', () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('(3개)')).toBeInTheDocument();
  });

  it('템플릿 목록을 렌더링한다', async () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('파란 그라디언트')).toBeInTheDocument();
      expect(screen.getByText('보라 그라디언트')).toBeInTheDocument();
      expect(screen.getByText('초록 그라디언트')).toBeInTheDocument();
    });
  });

  it('템플릿 클릭 시 onSelect가 호출된다', async () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('파란 그라디언트')).toBeInTheDocument();
    });

    const blueTemplate = screen.getByText('파란 그라디언트').closest('button');
    fireEvent.click(blueTemplate!);

    expect(mockOnSelect).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('선택된 템플릿에 특별한 스타일이 적용된다', async () => {
    render(<TemplateSelector onSelect={mockOnSelect} selectedTemplateId="gradient-blue" />);

    await waitFor(() => {
      expect(screen.getByText('파란 그라디언트')).toBeInTheDocument();
    });

    const selectedButton = screen.getByText('파란 그라디언트').closest('button');
    expect(selectedButton).toHaveClass('ring-4', 'ring-brand-primary');
  });

  it('선택된 템플릿에 체크 아이콘이 표시된다', async () => {
    const { container } = render(
      <TemplateSelector onSelect={mockOnSelect} selectedTemplateId="gradient-blue" />
    );

    await waitFor(() => {
      expect(screen.getByText('파란 그라디언트')).toBeInTheDocument();
    });

    // Check icon in the selected template
    const checkIcon = container.querySelector('.bg-brand-primary.text-white');
    expect(checkIcon).toBeInTheDocument();
  });

  it('안내 문구를 표시한다', () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('템플릿 사용 방법')).toBeInTheDocument();
    expect(screen.getByText(/원하는 배경을 선택하세요/)).toBeInTheDocument();
    expect(screen.getByText(/최종 이미지는 652×488 픽셀/)).toBeInTheDocument();
  });

  it('미리보기 이미지를 렌더링한다', async () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(3);
    });
  });

  it('선택되지 않은 템플릿에 호버 스타일이 있다', async () => {
    render(<TemplateSelector onSelect={mockOnSelect} />);

    await waitFor(() => {
      expect(screen.getByText('파란 그라디언트')).toBeInTheDocument();
    });

    const button = screen.getByText('파란 그라디언트').closest('button');
    expect(button).toHaveClass('hover:ring-2');
  });
});
