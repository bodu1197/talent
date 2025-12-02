import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceCard from '@/components/services/ServiceCard';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ServiceCard', () => {
  const mockService = {
    id: 'service-1',
    title: '전문 로고 디자인',
    thumbnail_url: 'https://example.com/logo.jpg',
    price: 50000,
    rating: 4.5,
    is_featured: false,
    is_advertised: false,
    seller: {
      display_name: '디자인스튜디오',
      is_verified: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('서비스 제목을 렌더링한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('전문 로고 디자인')).toBeInTheDocument();
  });

  it('전문가 이름을 렌더링한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('디자인스튜디오')).toBeInTheDocument();
  });

  it('가격을 포맷팅하여 렌더링한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('50,000원')).toBeInTheDocument();
  });

  it('평점을 렌더링한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('인증된 전문가는 인증 아이콘을 표시한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByLabelText('인증된 전문가')).toBeInTheDocument();
  });

  it('인증되지 않은 전문가는 인증 아이콘을 표시하지 않는다', () => {
    const unverifiedService = {
      ...mockService,
      seller: { display_name: '테스트', is_verified: false },
    };
    render(<ServiceCard service={unverifiedService} />);

    expect(screen.queryByLabelText('인증된 전문가')).not.toBeInTheDocument();
  });

  it('프리미엄 서비스는 PREMIUM 배지를 표시한다', () => {
    const featuredService = { ...mockService, is_featured: true };
    render(<ServiceCard service={featuredService} />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
  });

  it('광고 서비스는 추천 배지를 표시한다', () => {
    const advertisedService = { ...mockService, is_advertised: true };
    render(<ServiceCard service={advertisedService} />);

    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('is_promoted 서비스도 추천 배지를 표시한다', () => {
    const promotedService = { ...mockService, is_promoted: true };
    render(<ServiceCard service={promotedService} />);

    expect(screen.getByText('추천')).toBeInTheDocument();
  });

  it('썸네일이 없으면 기본 아이콘을 표시한다', () => {
    const noThumbService = { ...mockService, thumbnail_url: null };
    const { container } = render(<ServiceCard service={noThumbService} />);

    // Package 아이콘이 표시되어야 함
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('서비스 상세 페이지 링크가 올바르다', () => {
    render(<ServiceCard service={mockService} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/services/service-1');
  });

  it('aria-label이 올바르게 설정된다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByLabelText('전문 로고 디자인 서비스 상세보기')).toBeInTheDocument();
  });

  it('가격이 0이면 0원을 표시한다', () => {
    const freeService = { ...mockService, price: 0 };
    render(<ServiceCard service={freeService} />);

    expect(screen.getByText('0원')).toBeInTheDocument();
  });

  it('평점이 없으면 0.0을 표시한다', () => {
    const noRatingService = { ...mockService, rating: undefined };
    render(<ServiceCard service={noRatingService} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('광고 서비스 클릭 시 추적 API를 호출한다', async () => {
    const advertisedService = { ...mockService, is_advertised: true };
    render(<ServiceCard service={advertisedService} />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/advertising/track/click',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('일반 서비스 클릭 시 추적 API를 호출하지 않는다', () => {
    render(<ServiceCard service={mockService} />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    // 클릭 추적은 광고 서비스에서만 발생
    expect(mockFetch).not.toHaveBeenCalledWith('/api/advertising/track/click', expect.anything());
  });

  it('전문가 이름의 첫 글자를 아바타에 표시한다', () => {
    render(<ServiceCard service={mockService} />);

    expect(screen.getByText('디')).toBeInTheDocument();
  });

  it('전문가가 없으면 기본값 S를 표시한다', () => {
    const noSellerService = { ...mockService, seller: null };
    render(<ServiceCard service={noSellerService} />);

    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('priority가 true면 이미지가 eager 로딩된다', () => {
    render(<ServiceCard service={mockService} priority />);

    const img = screen.getByAltText('전문 로고 디자인 썸네일 이미지');
    // priority가 true면 loading 속성이 없거나 eager
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });
});
