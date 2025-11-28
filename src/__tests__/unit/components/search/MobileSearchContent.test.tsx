import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileSearchContent from '@/components/search/MobileSearchContent';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock MobileSearchBar
vi.mock('@/components/home/MobileSearchBar', () => ({
  default: () => <div data-testid="mobile-search-bar">Mobile Search Bar</div>,
}));

describe('MobileSearchContent', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'AI 서비스',
      slug: 'ai-services',
      icon: 'robot',
      children: [
        { id: 'child-1', name: 'AI 이미지', slug: 'ai-images' },
        { id: 'child-2', name: 'AI 글쓰기', slug: 'ai-writing' },
      ],
    },
    {
      id: 'cat-2',
      name: 'IT/프로그래밍',
      slug: 'it-programming',
      icon: 'code',
      children: [],
    },
    {
      id: 'cat-3',
      name: '생활서비스',
      slug: 'life-service',
      icon: 'home',
      children: [
        { id: 'child-3', name: '청소', slug: 'cleaning' },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('컴포넌트를 렌더링한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    expect(screen.getByTestId('mobile-search-bar')).toBeInTheDocument();
  });

  it('추천 검색어 섹션을 렌더링한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    expect(screen.getByText('추천 검색어')).toBeInTheDocument();
    expect(screen.getByText('로고 디자인')).toBeInTheDocument();
    expect(screen.getByText('AI 이미지')).toBeInTheDocument();
    expect(screen.getByText('영상 편집')).toBeInTheDocument();
    expect(screen.getByText('번역')).toBeInTheDocument();
  });

  it('추천 검색어 클릭 시 검색 페이지로 이동한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    fireEvent.click(screen.getByText('로고 디자인'));

    expect(mockPush).toHaveBeenCalledWith('/search?q=%EB%A1%9C%EA%B3%A0%20%EB%94%94%EC%9E%90%EC%9D%B8');
  });

  it('내주변 전문가 섹션을 렌더링한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    expect(screen.getByText('내주변 전문가')).toBeInTheDocument();
  });

  it('생활서비스 카테고리를 표시한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    // 생활서비스가 여러 번 나타날 수 있음 (내주변 전문가 + 전체 카테고리)
    const lifeServiceTexts = screen.getAllByText('생활서비스');
    expect(lifeServiceTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('전체 카테고리 섹션을 렌더링한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
    expect(screen.getByText('AI 서비스')).toBeInTheDocument();
    expect(screen.getByText('IT/프로그래밍')).toBeInTheDocument();
  });

  it('상세보기 링크를 렌더링한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    expect(screen.getByText('상세보기')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /상세보기/ })).toHaveAttribute('href', '/categories');
  });

  it('카테고리 링크가 올바른 href를 가진다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    // AI 서비스 카테고리 링크
    const aiLinks = screen.getAllByRole('link', { name: /AI 서비스/ });
    expect(aiLinks[0]).toHaveAttribute('href', '/categories/ai-services');
  });

  it('하위 카테고리를 표시한다', () => {
    render(<MobileSearchContent categories={mockCategories} />);

    // 생활서비스의 하위 카테고리
    expect(screen.getByRole('link', { name: '청소' })).toBeInTheDocument();
  });

  it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
    const { container } = render(<MobileSearchContent categories={mockCategories} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });

  it('빈 카테고리 배열을 처리한다', () => {
    render(<MobileSearchContent categories={[]} />);

    expect(screen.getByText('추천 검색어')).toBeInTheDocument();
    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
  });
});
