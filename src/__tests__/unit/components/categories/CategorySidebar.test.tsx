import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategorySidebar from '@/components/categories/CategorySidebar';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
    [key: string]: unknown;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe('CategorySidebar', () => {
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'AI 서비스',
      slug: 'ai-services',
      icon: 'robot',
      parent_id: undefined,
      level: 1,
      children: [
        {
          id: 'cat-1-1',
          name: 'AI 이미지',
          slug: 'ai-images',
          parent_id: 'cat-1',
          level: 2,
          children: [
            {
              id: 'cat-1-1-1',
              name: 'AI 사진 편집',
              slug: 'ai-photo-editing',
              parent_id: 'cat-1-1',
              level: 3,
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: 'cat-2',
      name: '디자인',
      slug: 'design',
      icon: 'palette',
      parent_id: undefined,
      level: 1,
      children: [],
    },
  ];

  const mockCategoryPath = [
    { id: 'cat-1', name: 'AI 서비스', slug: 'ai-services', parent_id: undefined, level: 1 },
  ];

  it('카테고리 목록을 렌더링한다', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    expect(screen.getByText('AI 서비스')).toBeInTheDocument();
    expect(screen.getByText('디자인')).toBeInTheDocument();
  });

  it('카테고리 링크가 올바른 href를 가진다', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    const aiLink = screen.getByRole('link', { name: /AI 서비스/ });
    expect(aiLink).toHaveAttribute('href', '/categories/ai-services');

    const designLink = screen.getByRole('link', { name: /디자인/ });
    expect(designLink).toHaveAttribute('href', '/categories/design');
  });

  it('현재 카테고리가 하이라이트된다', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    const currentLink = screen.getByRole('link', { name: /AI 서비스/ });
    expect(currentLink).toHaveClass('bg-gray-100');
  });

  it('하위 카테고리가 있는 경우 chevron 아이콘을 표시한다', () => {
    const { container } = render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    // AI 서비스는 하위 카테고리가 있으므로 chevron이 있어야 함
    const chevrons = container.querySelectorAll('svg');
    expect(chevrons.length).toBeGreaterThanOrEqual(1);
  });

  it('현재 경로에 있는 카테고리는 확장된 상태로 시작한다', () => {
    render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    // AI 서비스의 하위 카테고리인 'AI 이미지'가 보여야 함
    expect(screen.getByText('AI 이미지')).toBeInTheDocument();
  });

  it('PC에서만 보이도록 hidden lg:block 클래스가 적용된다', () => {
    const { container } = render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('hidden', 'lg:block');
  });

  it('1차 카테고리 클릭 시 토글된다', () => {
    render(
      <CategorySidebar categories={mockCategories} currentCategoryId="cat-2" categoryPath={[]} />
    );

    // 처음에는 AI 이미지가 보이지 않음 (경로에 없으므로)
    const aiLink = screen.getByRole('link', { name: /AI 서비스/ });

    // 클릭하면 토글
    fireEvent.click(aiLink);

    // AI 이미지가 보여야 함
    expect(screen.getByText('AI 이미지')).toBeInTheDocument();
  });

  it('빈 카테고리 배열을 처리한다', () => {
    const { container } = render(
      <CategorySidebar categories={[]} currentCategoryId="" categoryPath={[]} />
    );

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(0);
  });

  it('아이콘이 있는 카테고리는 아이콘을 표시한다', () => {
    const { container } = render(
      <CategorySidebar
        categories={mockCategories}
        currentCategoryId="cat-1"
        categoryPath={mockCategoryPath}
      />
    );

    // 아이콘 SVG가 렌더링되어야 함
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });
});
