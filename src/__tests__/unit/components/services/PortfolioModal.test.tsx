import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PortfolioModal from '@/components/services/PortfolioModal';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('PortfolioModal', () => {
  const mockPortfolio = {
    id: 'portfolio-1',
    title: '웹사이트 디자인 프로젝트',
    description: '반응형 웹사이트 디자인입니다.\n여러 기능을 포함합니다.',
    thumbnail_url: 'https://example.com/thumb.jpg',
    image_urls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    youtube_url: null,
    project_url: 'https://example.com/project',
    tags: ['웹디자인', 'UI/UX', '반응형'],
    created_at: '2024-01-15',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = 'auto';
  });

  it('포트폴리오 모달을 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByText('웹사이트 디자인 프로젝트')).toBeInTheDocument();
  });

  it('포트폴리오 설명을 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByText(/반응형 웹사이트 디자인입니다/)).toBeInTheDocument();
  });

  it('닫기 버튼이 렌더링된다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByLabelText('포트폴리오 닫기')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText('포트폴리오 닫기'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('배경 클릭 시 onClose가 호출된다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    fireEvent.click(screen.getByLabelText('모달 닫기'));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키 누르면 onClose가 호출된다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('썸네일 이미지를 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByAltText('웹사이트 디자인 프로젝트')).toBeInTheDocument();
  });

  it('추가 이미지들을 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByText('추가 이미지')).toBeInTheDocument();
    expect(screen.getByAltText('웹사이트 디자인 프로젝트 추가 이미지 1')).toBeInTheDocument();
    expect(screen.getByAltText('웹사이트 디자인 프로젝트 추가 이미지 2')).toBeInTheDocument();
  });

  it('프로젝트 URL 링크를 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    const projectLink = screen.getByRole('link', { name: /프로젝트 보기/ });
    expect(projectLink).toHaveAttribute('href', 'https://example.com/project');
    expect(projectLink).toHaveAttribute('target', '_blank');
  });

  it('태그들을 렌더링한다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(screen.getByText('#웹디자인')).toBeInTheDocument();
    expect(screen.getByText('#UI/UX')).toBeInTheDocument();
    expect(screen.getByText('#반응형')).toBeInTheDocument();
  });

  it('YouTube URL이 있으면 iframe을 렌더링한다', () => {
    const portfolioWithYoutube = {
      ...mockPortfolio,
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };

    render(<PortfolioModal portfolio={portfolioWithYoutube} onClose={mockOnClose} />);

    const iframe = screen.getByTitle('웹사이트 디자인 프로젝트');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  });

  it('모달 열릴 때 body overflow가 hidden으로 설정된다', () => {
    render(<PortfolioModal portfolio={mockPortfolio} onClose={mockOnClose} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('프로젝트 URL이 없으면 링크가 렌더링되지 않는다', () => {
    const portfolioWithoutUrl = {
      ...mockPortfolio,
      project_url: null,
    };

    render(<PortfolioModal portfolio={portfolioWithoutUrl} onClose={mockOnClose} />);

    expect(screen.queryByText('프로젝트 보기')).not.toBeInTheDocument();
  });

  it('추가 이미지가 없으면 섹션이 렌더링되지 않는다', () => {
    const portfolioWithoutImages = {
      ...mockPortfolio,
      image_urls: [],
    };

    render(<PortfolioModal portfolio={portfolioWithoutImages} onClose={mockOnClose} />);

    expect(screen.queryByText('추가 이미지')).not.toBeInTheDocument();
  });

  it('태그가 없으면 태그 섹션이 렌더링되지 않는다', () => {
    const portfolioWithoutTags = {
      ...mockPortfolio,
      tags: [],
    };

    render(<PortfolioModal portfolio={portfolioWithoutTags} onClose={mockOnClose} />);

    expect(screen.queryByText(/#/)).not.toBeInTheDocument();
  });
});
