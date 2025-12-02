import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '@/components/mypage/Sidebar';

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

// Mock next/navigation
let mockPathname = '/mypage/seller/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock ProfileImage
vi.mock('@/components/common/ProfileImage', () => ({
  default: ({ alt }: { alt: string }) => <div data-testid="profile-image">{alt}</div>,
}));

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/mypage/seller/dashboard';
  });

  describe('전문가 모드', () => {
    const profileData = { name: '홍길동', profile_image: 'https://example.com/profile.jpg' };

    it('전문가 사이드바를 렌더링한다', () => {
      render(<Sidebar mode="seller" profileData={profileData} />);

      expect(screen.getByText('판매 대시보드')).toBeInTheDocument();
      expect(screen.getByText('주문 관리')).toBeInTheDocument();
      expect(screen.getByText('서비스 관리')).toBeInTheDocument();
    });

    it('프로필 정보를 표시한다', () => {
      render(<Sidebar mode="seller" profileData={profileData} />);

      // 이름이 여러 곳에 나타날 수 있음
      const nameTexts = screen.getAllByText('홍길동');
      expect(nameTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('전문가 프로필')).toBeInTheDocument();
    });

    it('구매자 페이지 전환 버튼을 표시한다', () => {
      render(<Sidebar mode="seller" profileData={profileData} />);

      expect(screen.getByText('구매자 페이지로')).toBeInTheDocument();
    });

    it('하위 메뉴가 있는 항목 클릭 시 확장된다', () => {
      render(<Sidebar mode="seller" profileData={profileData} />);

      const orderButton = screen.getByRole('button', { name: /주문 관리/ });
      fireEvent.click(orderButton);

      expect(screen.getByText('신규 주문')).toBeInTheDocument();
      expect(screen.getByText('진행중')).toBeInTheDocument();
    });

    it('isRegisteredSeller가 true일 때 전문가 등록 메뉴가 숨겨진다', () => {
      render(<Sidebar mode="seller" profileData={profileData} isRegisteredSeller={true} />);

      expect(screen.queryByText('전문가 등록')).not.toBeInTheDocument();
    });

    it('isRegisteredSeller가 false일 때 전문가 등록 메뉴가 표시된다', () => {
      render(<Sidebar mode="seller" profileData={profileData} isRegisteredSeller={false} />);

      expect(screen.getByText('전문가 등록')).toBeInTheDocument();
    });

    it('올바른 링크 경로를 가진다', () => {
      render(<Sidebar mode="seller" profileData={profileData} />);

      expect(screen.getByRole('link', { name: '판매 대시보드' })).toHaveAttribute(
        'href',
        '/mypage/seller/dashboard'
      );
    });
  });

  describe('구매자 모드', () => {
    const profileData = { name: '김철수', profile_image: null };

    it('구매자 사이드바를 렌더링한다', () => {
      mockPathname = '/mypage/buyer/dashboard';
      render(<Sidebar mode="buyer" profileData={profileData} />);

      expect(screen.getByText('구매 대시보드')).toBeInTheDocument();
      expect(screen.getByText('주문 내역')).toBeInTheDocument();
      expect(screen.getByText('찜 목록')).toBeInTheDocument();
    });

    it('프로필 정보를 표시한다', () => {
      mockPathname = '/mypage/buyer/dashboard';
      render(<Sidebar mode="buyer" profileData={profileData} />);

      // 이름이 여러 곳에 나타날 수 있음
      const nameTexts = screen.getAllByText('김철수');
      expect(nameTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('프로필 설정')).toBeInTheDocument();
    });

    it('전문가 페이지 전환 버튼을 표시한다', () => {
      mockPathname = '/mypage/buyer/dashboard';
      render(<Sidebar mode="buyer" profileData={profileData} />);

      expect(screen.getByText('전문가 페이지로')).toBeInTheDocument();
    });

    it('주문 내역 하위 메뉴가 확장된다', () => {
      mockPathname = '/mypage/buyer/dashboard';
      render(<Sidebar mode="buyer" profileData={profileData} />);

      const orderButton = screen.getByRole('button', { name: /주문 내역/ });
      fireEvent.click(orderButton);

      expect(screen.getByText('전체')).toBeInTheDocument();
      expect(screen.getByText('결제완료')).toBeInTheDocument();
    });
  });

  describe('공통 동작', () => {
    it('profileData가 없을 때 기본 이름을 표시한다', () => {
      render(<Sidebar mode="seller" profileData={null} />);

      // '회원'이 프로필 이름으로 표시되어야 함
      const memberTexts = screen.getAllByText('회원');
      expect(memberTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('aside 태그로 렌더링된다', () => {
      const { container } = render(<Sidebar mode="seller" profileData={null} />);

      expect(container.querySelector('aside')).toBeInTheDocument();
    });

    it('lg:flex 클래스가 적용된다', () => {
      const { container } = render(<Sidebar mode="seller" profileData={null} />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('hidden', 'lg:flex');
    });

    it('현재 경로와 일치하는 메뉴가 활성화된다', () => {
      mockPathname = '/mypage/seller/dashboard';
      render(<Sidebar mode="seller" profileData={null} />);

      const dashboardLink = screen.getByRole('link', { name: '판매 대시보드' });
      expect(dashboardLink).toHaveClass('bg-brand-primary', 'text-white');
    });
  });
});
