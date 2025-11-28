import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioGrid from '@/components/services/PortfolioGrid';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock dynamic import of PortfolioModal
vi.mock('next/dynamic', () => ({
  default: () => {
    const DynamicComponent = ({ portfolio, onClose }: { portfolio: { title: string }; onClose: () => void }) => (
      <div data-testid="portfolio-modal">
        <span>{portfolio.title}</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
    return DynamicComponent;
  },
}));

describe('PortfolioGrid', () => {
  const mockPortfolios = [
    {
      id: 'portfolio-1',
      title: '웹사이트 디자인 프로젝트',
      description: '반응형 웹사이트 디자인',
      thumbnail_url: 'https://example.com/thumb1.jpg',
      image_urls: ['https://example.com/img1.jpg'],
      youtube_url: null,
      project_url: 'https://example.com',
      tags: ['웹디자인', 'UI/UX'],
      created_at: '2024-01-15',
    },
    {
      id: 'portfolio-2',
      title: '모바일 앱 디자인',
      description: '앱 UI 디자인',
      thumbnail_url: null,
      image_urls: [],
      youtube_url: null,
      project_url: null,
      tags: ['앱디자인'],
      created_at: '2024-01-10',
    },
  ];

  it('포트폴리오 그리드를 렌더링한다', () => {
    render(<PortfolioGrid portfolios={mockPortfolios} />);

    expect(screen.getByAltText('웹사이트 디자인 프로젝트')).toBeInTheDocument();
  });

  it('썸네일이 없는 포트폴리오는 기본 아이콘을 표시한다', () => {
    const { container } = render(<PortfolioGrid portfolios={mockPortfolios} />);

    // ImageIcon SVG가 표시되어야 함
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('포트폴리오 클릭 시 모달이 열린다', () => {
    render(<PortfolioGrid portfolios={mockPortfolios} />);

    // 첫 번째 포트폴리오 버튼 클릭
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    // 모달이 열려야 함
    expect(screen.getByTestId('portfolio-modal')).toBeInTheDocument();
  });

  it('포트폴리오 개수만큼 버튼이 렌더링된다', () => {
    render(<PortfolioGrid portfolios={mockPortfolios} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('호버 시 오버레이에 제목이 표시된다', () => {
    render(<PortfolioGrid portfolios={mockPortfolios} />);

    // 제목이 오버레이에 있음 (h3 태그로)
    expect(screen.getByText('웹사이트 디자인 프로젝트')).toBeInTheDocument();
    expect(screen.getByText('모바일 앱 디자인')).toBeInTheDocument();
  });

  it('자세히 보기 텍스트가 표시된다', () => {
    render(<PortfolioGrid portfolios={mockPortfolios} />);

    const detailTexts = screen.getAllByText('자세히 보기');
    expect(detailTexts.length).toBe(2);
  });

  it('빈 포트폴리오 배열을 처리한다', () => {
    const { container } = render(<PortfolioGrid portfolios={[]} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('포트폴리오 버튼에 올바른 스타일이 적용된다', () => {
    const { container } = render(<PortfolioGrid portfolios={mockPortfolios} />);

    const button = container.querySelector('button');
    expect(button).toHaveClass('group', 'relative', 'bg-gray-100', 'rounded-lg');
  });
});
