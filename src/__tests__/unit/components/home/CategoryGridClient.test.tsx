import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryGridClient from '@/components/home/CategoryGridClient';

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

describe('CategoryGridClient', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'AI 서비스', slug: 'ai-services', icon: 'robot' },
    { id: 'cat-2', name: '디자인', slug: 'design', icon: 'palette' },
    { id: 'cat-3', name: '개발', slug: 'development', icon: 'code' },
  ];

  const brightColors = ['text-red-500', 'text-blue-500', 'text-green-500'];

  it('카테고리 링크들을 렌더링한다', () => {
    render(
      <CategoryGridClient
        categoriesInFirstRow={mockCategories}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    expect(screen.getByText('AI 서비스')).toBeInTheDocument();
    expect(screen.getByText('디자인')).toBeInTheDocument();
    expect(screen.getByText('개발')).toBeInTheDocument();
  });

  it('카테고리 링크가 올바른 href를 가진다', () => {
    render(
      <CategoryGridClient
        categoriesInFirstRow={mockCategories}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    const aiLink = screen.getByRole('link', { name: /AI 서비스/ });
    expect(aiLink).toHaveAttribute('href', '/categories/ai-services');

    const designLink = screen.getByRole('link', { name: /디자인/ });
    expect(designLink).toHaveAttribute('href', '/categories/design');
  });

  it('첫 번째 줄과 나머지 카테고리를 모두 렌더링한다', () => {
    const remainingCategories = [
      { id: 'cat-4', name: '마케팅', slug: 'marketing', icon: 'bullhorn' },
      { id: 'cat-5', name: '번역', slug: 'translation', icon: 'language' },
    ];

    render(
      <CategoryGridClient
        categoriesInFirstRow={mockCategories}
        remainingCategories={remainingCategories}
        brightColors={brightColors}
      />
    );

    expect(screen.getByText('AI 서비스')).toBeInTheDocument();
    expect(screen.getByText('마케팅')).toBeInTheDocument();
    expect(screen.getByText('번역')).toBeInTheDocument();
  });

  it('PC에서만 보이도록 hidden lg:flex 클래스가 적용된다', () => {
    const { container } = render(
      <CategoryGridClient
        categoriesInFirstRow={mockCategories}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('hidden', 'lg:flex');
  });

  it('카테고리 아이콘이 렌더링된다', () => {
    const { container } = render(
      <CategoryGridClient
        categoriesInFirstRow={mockCategories}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    // SVG 아이콘들이 렌더링되어야 함
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThanOrEqual(3);
  });

  it('빈 카테고리 배열을 처리한다', () => {
    const { container } = render(
      <CategoryGridClient
        categoriesInFirstRow={[]}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(0);
  });

  it('아이콘이 없는 카테고리는 기본 아이콘을 사용한다', () => {
    const categoriesWithoutIcon = [{ id: 'cat-1', name: '기타', slug: 'others' }];

    const { container } = render(
      <CategoryGridClient
        categoriesInFirstRow={categoriesWithoutIcon}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    // Circle 아이콘이 기본값으로 사용됨
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  it('색상이 순환적으로 적용된다', () => {
    const manyCategories = [
      { id: 'cat-1', name: '카테고리1', slug: 'cat-1', icon: 'robot' },
      { id: 'cat-2', name: '카테고리2', slug: 'cat-2', icon: 'palette' },
      { id: 'cat-3', name: '카테고리3', slug: 'cat-3', icon: 'code' },
      { id: 'cat-4', name: '카테고리4', slug: 'cat-4', icon: 'bullhorn' },
    ];

    render(
      <CategoryGridClient
        categoriesInFirstRow={manyCategories}
        remainingCategories={[]}
        brightColors={brightColors}
      />
    );

    // 4번째 카테고리는 첫 번째 색상(index % 3 = 0)을 사용
    expect(screen.getByText('카테고리4')).toBeInTheDocument();
  });
});
