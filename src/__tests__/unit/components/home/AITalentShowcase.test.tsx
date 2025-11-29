import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AITalentShowcase from '@/components/home/AITalentShowcase';

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

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('AITalentShowcase', () => {
  const mockServices = [
    {
      id: 'service-1',
      title: 'AI 이미지 생성 서비스',
      description: 'AI로 이미지를 생성합니다',
      price: 50000,
      thumbnail_url: '/images/service1.jpg',
      rating: 4.8,
      orders_count: 100,
      seller: {
        id: 'seller-1',
        display_name: '홍길동',
        is_verified: true,
      },
    },
    {
      id: 'service-2',
      title: 'AI 글쓰기 서비스',
      price: 30000,
      rating: 4.5,
      seller: {
        id: 'seller-2',
        display_name: '김철수',
        is_verified: false,
      },
    },
  ];

  it('섹션을 렌더링한다', () => {
    render(<AITalentShowcase services={mockServices} />);

    expect(screen.getByText('AI 재능 쇼케이스')).toBeInTheDocument();
    expect(screen.getByText('AI 전문가들의 인기 서비스')).toBeInTheDocument();
  });

  it('빈 배열로도 렌더링된다', () => {
    render(<AITalentShowcase services={[]} />);

    expect(screen.getByText('AI 재능 쇼케이스')).toBeInTheDocument();
  });

  it('서비스 카드를 렌더링한다', () => {
    render(<AITalentShowcase services={mockServices} />);

    expect(screen.getByText('AI 이미지 생성 서비스')).toBeInTheDocument();
    expect(screen.getByText('AI 글쓰기 서비스')).toBeInTheDocument();
  });

  it('판매자 이름을 표시한다', () => {
    render(<AITalentShowcase services={mockServices} />);

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
  });

  it('가격을 포맷팅하여 표시한다', () => {
    render(<AITalentShowcase services={mockServices} />);

    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('30,000원')).toBeInTheDocument();
  });

  it('평점을 표시한다', () => {
    render(<AITalentShowcase services={mockServices} />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('서비스 링크가 올바른 href를 가진다', () => {
    render(<AITalentShowcase services={mockServices} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/services/service-1');
    expect(links[1]).toHaveAttribute('href', '/services/service-2');
  });

  it('검증된 판매자에게 체크 아이콘이 표시된다', () => {
    const { container } = render(<AITalentShowcase services={mockServices} />);

    // lucide-react CheckCircle icon (verified seller)
    const checkIcons = container.querySelectorAll('.text-blue-500');
    expect(checkIcons.length).toBe(1); // Only 홍길동 is verified
  });

  it('썸네일이 없을 때 기본 아이콘을 표시한다', () => {
    const servicesWithoutThumbnail = [
      {
        id: 'service-3',
        title: 'No Thumbnail Service',
        price: 10000,
        seller: {
          id: 'seller-3',
          display_name: '박영희',
          is_verified: false,
        },
      },
    ];

    const { container } = render(<AITalentShowcase services={servicesWithoutThumbnail} />);

    // Bot icon should be visible when no thumbnail
    const botIcon = container.querySelector('.text-gray-400');
    expect(botIcon).toBeInTheDocument();
  });
});
