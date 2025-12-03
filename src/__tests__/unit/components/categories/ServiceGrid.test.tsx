import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceGrid from '@/components/categories/ServiceGrid';
import type { Service } from '@/types';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

// Mock ServiceCard
vi.mock('@/components/services/ServiceCard', () => ({
  default: ({ service }: { service: { id: string; title: string } }) => (
    <div data-testid={`service-card-${service.id}`}>{service.title}</div>
  ),
}));

describe('ServiceGrid', () => {
  const mockServices: Service[] = [
    {
      id: 'service-1',
      seller_id: 'seller-1',
      category_id: 'cat-1',
      title: '로고 디자인',
      description: '고품질 로고',
      price: 50000,
      delivery_days: 3,
      revision_count: 2,
      is_express_available: false,
      status: 'active' as const,
      views: 100,
      orders_count: 10,
      rating: 4.5,
      review_count: 8,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      thumbnail_url: undefined,
      seller: undefined,
      is_promoted: false,
    },
    {
      id: 'service-2',
      seller_id: 'seller-2',
      category_id: 'cat-1',
      title: '웹 개발',
      description: '웹사이트 개발',
      price: 150000,
      delivery_days: 7,
      revision_count: 3,
      is_express_available: false,
      status: 'active' as const,
      views: 200,
      orders_count: 5,
      rating: 4.8,
      review_count: 12,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      thumbnail_url: undefined,
      seller: undefined,
      is_promoted: false,
    },
    {
      id: 'service-3',
      seller_id: 'seller-3',
      category_id: 'cat-1',
      title: '앱 개발',
      description: '앱 개발',
      price: 300000,
      delivery_days: 14,
      revision_count: 5,
      is_express_available: false,
      status: 'active' as const,
      views: 150,
      orders_count: 3,
      rating: 4.2,
      review_count: 5,
      is_featured: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      thumbnail_url: undefined,
      seller: undefined,
      is_promoted: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('sort');
    mockSearchParams.delete('price');
  });

  it('서비스 카드들을 렌더링한다', () => {
    render(<ServiceGrid initialServices={mockServices} />);

    expect(screen.getByTestId('service-card-service-1')).toBeInTheDocument();
    expect(screen.getByTestId('service-card-service-2')).toBeInTheDocument();
    expect(screen.getByTestId('service-card-service-3')).toBeInTheDocument();
  });

  it('서비스가 없으면 빈 상태 메시지를 표시한다', () => {
    render(<ServiceGrid initialServices={[]} />);

    expect(screen.getByText('해당 조건의 서비스가 없습니다.')).toBeInTheDocument();
  });

  it('가격 필터(5만원 미만)가 적용된다', () => {
    mockSearchParams.set('price', 'under-50000');

    render(<ServiceGrid initialServices={mockServices} />);

    // 5만원 미만인 서비스만 표시되어야 함 (없음)
    expect(screen.getByText('해당 조건의 서비스가 없습니다.')).toBeInTheDocument();
  });

  it('가격 필터(5-10만원)가 적용된다', () => {
    mockSearchParams.set('price', '50000-100000');

    render(<ServiceGrid initialServices={mockServices} />);

    // 5-10만원 서비스: service-1 (50000원)
    expect(screen.getByTestId('service-card-service-1')).toBeInTheDocument();
    expect(screen.queryByTestId('service-card-service-2')).not.toBeInTheDocument();
  });

  it('가격 낮은순 정렬이 적용된다', () => {
    mockSearchParams.set('sort', 'price_low');

    const { container } = render(<ServiceGrid initialServices={mockServices} />);

    const cards = container.querySelectorAll('[data-testid^="service-card-"]');
    expect(cards[0]).toHaveTextContent('로고 디자인'); // 50000
    expect(cards[1]).toHaveTextContent('웹 개발'); // 150000
    expect(cards[2]).toHaveTextContent('앱 개발'); // 300000
  });

  it('가격 높은순 정렬이 적용된다', () => {
    mockSearchParams.set('sort', 'price_high');

    const { container } = render(<ServiceGrid initialServices={mockServices} />);

    const cards = container.querySelectorAll('[data-testid^="service-card-"]');
    expect(cards[0]).toHaveTextContent('앱 개발'); // 300000
    expect(cards[1]).toHaveTextContent('웹 개발'); // 150000
    expect(cards[2]).toHaveTextContent('로고 디자인'); // 50000
  });

  it('평점순 정렬이 적용된다', () => {
    mockSearchParams.set('sort', 'rating');

    const { container } = render(<ServiceGrid initialServices={mockServices} />);

    const cards = container.querySelectorAll('[data-testid^="service-card-"]');
    expect(cards[0]).toHaveTextContent('웹 개발'); // 4.8
    expect(cards[1]).toHaveTextContent('로고 디자인'); // 4.5
    expect(cards[2]).toHaveTextContent('앱 개발'); // 4.2
  });

  it('인기순은 원래 순서를 유지한다', () => {
    mockSearchParams.set('sort', 'popular');

    const { container } = render(<ServiceGrid initialServices={mockServices} />);

    const cards = container.querySelectorAll('[data-testid^="service-card-"]');
    expect(cards[0]).toHaveTextContent('로고 디자인');
    expect(cards[1]).toHaveTextContent('웹 개발');
    expect(cards[2]).toHaveTextContent('앱 개발');
  });

  it('최신순은 원래 순서를 유지한다', () => {
    mockSearchParams.set('sort', 'latest');

    const { container } = render(<ServiceGrid initialServices={mockServices} />);

    const cards = container.querySelectorAll('[data-testid^="service-card-"]');
    expect(cards.length).toBe(3);
  });

  it('categoryId와 page props를 전달한다', () => {
    render(<ServiceGrid initialServices={mockServices} categoryId="cat-1" page={2} />);

    expect(screen.getByTestId('service-card-service-1')).toBeInTheDocument();
  });
});
