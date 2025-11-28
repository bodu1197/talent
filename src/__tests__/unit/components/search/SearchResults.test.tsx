import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchResults from '@/components/search/SearchResults';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock ServiceCard - 더 단순하게
vi.mock('@/components/services/ServiceCard', () => ({
  default: ({ service }: { service: { id: string; title: string } }) => (
    <div data-testid={`service-card-${service.id}`}>{service.title}</div>
  ),
}));

describe('SearchResults', () => {
  const mockServices = [
    {
      id: 'service-1',
      title: '로고 디자인',
      description: '고품질 로고 디자인',
      price: 50000,
      thumbnail_url: null,
      orders_count: 10,
      seller: {
        id: 'seller-1',
        business_name: '디자인 스튜디오',
        display_name: '김디자인',
        profile_image: null,
        is_verified: true,
      },
      order_count: 10,
      rating: 4.5,
      review_count: 8,
      is_promoted: false,
    },
  ];

  const mockExperts = [
    {
      id: 'expert-1',
      profile_image: 'https://example.com/expert.jpg',
      display_name: '김전문가',
      business_name: '전문가 스튜디오',
      is_verified: true,
      bio: '10년 경력의 디자이너입니다.',
      rating: 4.8,
      review_count: 50,
      service_count: 5,
    },
  ];

  const mockPortfolios = [
    {
      id: 'portfolio-1',
      title: '웹사이트 디자인 프로젝트',
      thumbnail_url: 'https://example.com/portfolio.jpg',
      seller: {
        id: 'seller-1',
        business_name: '디자인 스튜디오',
        display_name: '김디자인',
        profile_image: null,
        is_verified: true,
      },
    },
  ];

  it('검색 결과 헤더를 렌더링한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={mockExperts}
        portfolios={mockPortfolios}
        query="로고 디자인"
      />
    );

    expect(screen.getByText("'로고 디자인'")).toBeInTheDocument();
    expect(screen.getByText(/에 대한 검색결과/)).toBeInTheDocument();
  });

  it('탭 네비게이션을 렌더링한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={mockExperts}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    expect(screen.getByText('서비스 (1)')).toBeInTheDocument();
    expect(screen.getByText('전문가 (1)')).toBeInTheDocument();
    expect(screen.getByText('포트폴리오 (1)')).toBeInTheDocument();
  });

  it('기본적으로 서비스 탭이 활성화된다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={[]}
        portfolios={[]}
        query="테스트"
      />
    );

    expect(screen.getByTestId('service-card-service-1')).toBeInTheDocument();
  });

  it('전문가 탭 클릭 시 전문가 목록을 표시한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={mockExperts}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (1)'));

    expect(screen.getByText('김전문가')).toBeInTheDocument();
    expect(screen.getByText('10년 경력의 디자이너입니다.')).toBeInTheDocument();
  });

  it('포트폴리오 탭 클릭 시 포트폴리오 목록을 표시한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={mockExperts}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('포트폴리오 (1)'));

    expect(screen.getByText('웹사이트 디자인 프로젝트')).toBeInTheDocument();
  });

  it('서비스가 없으면 빈 상태 메시지를 표시한다', () => {
    render(
      <SearchResults
        services={[]}
        experts={mockExperts}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    expect(screen.getByText('서비스 검색 결과가 없습니다')).toBeInTheDocument();
    expect(screen.getByText('다른 검색어로 다시 시도해보세요.')).toBeInTheDocument();
  });

  it('전문가가 없으면 빈 상태 메시지를 표시한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={[]}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (0)'));

    expect(screen.getByText('전문가 검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('포트폴리오가 없으면 빈 상태 메시지를 표시한다', () => {
    render(
      <SearchResults
        services={mockServices}
        experts={mockExperts}
        portfolios={[]}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('포트폴리오 (0)'));

    expect(screen.getByText('포트폴리오 검색 결과가 없습니다')).toBeInTheDocument();
  });

  it('전문가 카드에 올바른 링크가 있다', () => {
    render(
      <SearchResults
        services={[]}
        experts={mockExperts}
        portfolios={[]}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (1)'));

    const expertLink = screen.getByRole('link', { name: /김전문가/ });
    expect(expertLink).toHaveAttribute('href', '/experts/expert-1');
  });

  it('포트폴리오 카드에 올바른 링크가 있다', () => {
    render(
      <SearchResults
        services={[]}
        experts={[]}
        portfolios={mockPortfolios}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('포트폴리오 (1)'));

    const portfolioLinks = screen.getAllByRole('link');
    const portfolioLink = portfolioLinks.find(link => link.getAttribute('href') === '/portfolio/portfolio-1');
    expect(portfolioLink).toBeInTheDocument();
  });

  it('전문가의 평점과 리뷰 수를 표시한다', () => {
    render(
      <SearchResults
        services={[]}
        experts={mockExperts}
        portfolios={[]}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (1)'));

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(50)')).toBeInTheDocument();
  });

  it('전문가의 서비스 수를 표시한다', () => {
    render(
      <SearchResults
        services={[]}
        experts={mockExperts}
        portfolios={[]}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (1)'));

    expect(screen.getByText('서비스 5개')).toBeInTheDocument();
  });

  it('프로필 이미지가 없는 전문가는 이니셜을 표시한다', () => {
    const expertsWithoutImage = [{
      ...mockExperts[0],
      profile_image: null,
    }];

    render(
      <SearchResults
        services={[]}
        experts={expertsWithoutImage}
        portfolios={[]}
        query="테스트"
      />
    );

    fireEvent.click(screen.getByText('전문가 (1)'));

    // 이니셜 'ㄱ' 또는 'K'가 표시되어야 함
    expect(screen.getByText('김')).toBeInTheDocument();
  });
});
