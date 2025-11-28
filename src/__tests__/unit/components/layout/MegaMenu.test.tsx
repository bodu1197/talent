import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MegaMenu from '@/components/layout/MegaMenu';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('MegaMenu', () => {
  const mockCategories = [
    {
      id: 'ai-services',
      name: 'AI 서비스',
      slug: 'ai-services',
      icon: 'robot',
      is_ai: true,
      service_count: 100,
      children: [
        {
          id: 'ai-images',
          name: 'AI 이미지',
          slug: 'ai-images',
          children: [
            { id: 'ai-photo', name: 'AI 사진 편집', slug: 'ai-photo' },
          ],
        },
      ],
    },
    {
      id: 'it-programming',
      name: 'IT/프로그래밍',
      slug: 'it-programming',
      icon: 'code',
      service_count: 80,
      children: [
        {
          id: 'web-dev',
          name: '웹 개발',
          slug: 'web-dev',
          children: [],
        },
      ],
    },
    {
      id: 'design',
      name: '디자인',
      slug: 'design',
      icon: 'palette',
      service_count: 50,
      children: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('메가 메뉴를 렌더링한다', () => {
    render(<MegaMenu categories={mockCategories} />);

    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
  });

  it('AI 서비스 퀵링크가 표시된다', () => {
    render(<MegaMenu categories={mockCategories} />);

    expect(screen.getByRole('link', { name: 'AI 서비스 카테고리 보기' })).toBeInTheDocument();
  });

  it('IT/프로그래밍 퀵링크가 표시된다', () => {
    render(<MegaMenu categories={mockCategories} />);

    expect(screen.getByRole('link', { name: 'IT/프로그래밍 카테고리 보기' })).toBeInTheDocument();
  });

  it('AI Hub 버튼이 표시된다', () => {
    render(<MegaMenu categories={mockCategories} />);

    expect(screen.getByRole('link', { name: 'AI Hub 페이지로 이동' })).toHaveAttribute('href', '/ai');
  });

  it('전체 카테고리 버튼 클릭 시 드롭다운이 열린다', () => {
    render(<MegaMenu categories={mockCategories} />);

    fireEvent.click(screen.getByRole('button', { name: '전체 카테고리 메뉴' }));

    // 드롭다운이 열리면 카테고리 목록이 표시됨
    expect(screen.getByText('인기 카테고리')).toBeInTheDocument();
  });

  it('카테고리 호버 시 하위 카테고리가 표시된다', () => {
    render(<MegaMenu categories={mockCategories} />);

    // 먼저 메뉴 열기
    fireEvent.click(screen.getByRole('button', { name: '전체 카테고리 메뉴' }));

    // AI 서비스 카테고리 호버
    const aiCategoryLink = screen.getByRole('link', { name: 'AI 서비스 카테고리로 이동' });
    fireEvent.mouseEnter(aiCategoryLink);

    // AI 이미지 하위 카테고리가 표시됨
    expect(screen.getByText('AI 이미지')).toBeInTheDocument();
  });

  it('PC에서만 보이도록 hidden lg:block 클래스가 적용된다', () => {
    const { container } = render(<MegaMenu categories={mockCategories} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('hidden', 'lg:block');
  });

  it('AI 카테고리에 AI 뱃지가 표시된다', () => {
    render(<MegaMenu categories={mockCategories} />);

    // 먼저 메뉴 열기
    fireEvent.click(screen.getByRole('button', { name: '전체 카테고리 메뉴' }));

    // AI 뱃지 확인
    const aiBadge = screen.getByLabelText('AI 카테고리');
    expect(aiBadge).toBeInTheDocument();
  });

  it('올바른 링크 경로를 가진다', () => {
    render(<MegaMenu categories={mockCategories} />);

    expect(screen.getByRole('link', { name: 'AI 서비스 카테고리 보기' })).toHaveAttribute(
      'href',
      '/categories/ai-services'
    );
    expect(screen.getByRole('link', { name: 'IT/프로그래밍 카테고리 보기' })).toHaveAttribute(
      'href',
      '/categories/it-programming'
    );
  });

  it('빈 카테고리 배열을 처리한다', () => {
    render(<MegaMenu categories={[]} />);

    expect(screen.getByText('전체 카테고리')).toBeInTheDocument();
  });
});
