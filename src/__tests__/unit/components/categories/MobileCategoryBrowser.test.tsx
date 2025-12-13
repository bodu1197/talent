import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MobileCategoryBrowser from '@/components/categories/MobileCategoryBrowser';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('MobileCategoryBrowser', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'AI 서비스',
      slug: 'ai-services',
      icon: 'robot',
      children: [
        {
          id: 'cat-1-1',
          name: 'AI 이미지',
          slug: 'ai-images',
          children: [
            { id: 'cat-1-1-1', name: 'AI 사진 편집', slug: 'ai-photo-editing' },
            { id: 'cat-1-1-2', name: 'AI 일러스트', slug: 'ai-illustration' },
          ],
        },
        {
          id: 'cat-1-2',
          name: 'AI 텍스트',
          slug: 'ai-text',
          children: [],
        },
      ],
    },
    {
      id: 'cat-2',
      name: '디자인',
      slug: 'design',
      icon: 'palette',
      children: [
        {
          id: 'cat-2-1',
          name: '로고 디자인',
          slug: 'logo-design',
          children: [],
        },
      ],
    },
  ];

  it('카테고리 브라우저를 렌더링한다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    expect(screen.getByText('AI 서비스')).toBeInTheDocument();
    expect(screen.getByText('디자인')).toBeInTheDocument();
  });

  it('첫 번째 카테고리가 기본으로 선택된다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    // AI 서비스의 하위 카테고리가 표시되어야 함
    expect(screen.getByText('AI 이미지')).toBeInTheDocument();
    expect(screen.getByText('AI 텍스트')).toBeInTheDocument();
  });

  it('1차 카테고리 클릭 시 해당 카테고리의 하위 카테고리를 표시한다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    // 디자인 클릭
    fireEvent.click(screen.getByText('디자인'));

    // 디자인의 하위 카테고리가 표시되어야 함
    expect(screen.getByText('로고 디자인')).toBeInTheDocument();
  });

  it('전체보기 링크가 렌더링된다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    expect(screen.getByText(/AI 서비스 전체보기/)).toBeInTheDocument();
  });

  it('전체보기 링크가 올바른 href를 가진다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    const viewAllLink = screen.getByRole('link', { name: /AI 서비스 전체보기/ });
    expect(viewAllLink).toHaveAttribute('href', '/categories/ai-services');
  });

  it('2차 카테고리 링크가 올바른 href를 가진다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    const aiImageLink = screen.getByRole('link', { name: 'AI 이미지' });
    expect(aiImageLink).toHaveAttribute('href', '/categories/ai-images');
  });

  it('3차 카테고리 링크가 렌더링된다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    expect(screen.getByText('AI 사진 편집')).toBeInTheDocument();
    expect(screen.getByText('AI 일러스트')).toBeInTheDocument();
  });

  it('3차 카테고리 링크가 올바른 href를 가진다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    const photoEditLink = screen.getByRole('link', { name: 'AI 사진 편집' });
    expect(photoEditLink).toHaveAttribute('href', '/categories/ai-photo-editing');
  });

  it('하위 카테고리가 없으면 메시지를 표시한다', () => {
    const categoriesWithoutChildren = [{ id: 'cat-1', name: '기타', slug: 'others', children: [] }];

    render(<MobileCategoryBrowser categories={categoriesWithoutChildren} />);

    expect(screen.getByText('하위 카테고리가 없습니다')).toBeInTheDocument();
  });

  it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
    const { container } = render(<MobileCategoryBrowser categories={mockCategories} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });

  it('선택된 카테고리는 하이라이트된다', () => {
    render(<MobileCategoryBrowser categories={mockCategories} />);

    const aiButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('AI 서비스'));
    expect(aiButton).toHaveClass('bg-white', 'text-brand-primary');
  });

  it('빈 카테고리 배열을 처리한다', () => {
    const { container } = render(<MobileCategoryBrowser categories={[]} />);

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});
