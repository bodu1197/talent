import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileMyPageNav from '@/components/mypage/MobileMyPageNav';

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
let mockPathname = '/mypage/buyer/orders';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('MobileMyPageNav', () => {
  const mockOnRoleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/mypage/buyer/orders';
  });

  describe('구매자 모드', () => {
    it('구매자 메뉴를 렌더링한다', () => {
      render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      expect(screen.getByText('주문 내역')).toBeInTheDocument();
      expect(screen.getByText('찜한 서비스')).toBeInTheDocument();
      expect(screen.getByText('리뷰 관리')).toBeInTheDocument();
      expect(screen.getByText('견적 요청')).toBeInTheDocument();
    });

    it('구매자 버튼이 활성화 상태다', () => {
      render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      const buyerButton = screen.getByRole('button', { name: '구매자' });
      expect(buyerButton).toHaveClass('bg-white', 'text-brand-primary');
    });

    it('현재 경로와 일치하는 메뉴가 활성화된다', () => {
      mockPathname = '/mypage/buyer/orders';
      render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      const orderLink = screen.getByRole('link', { name: /주문 내역/ });
      expect(orderLink).toHaveClass('bg-brand-primary/10', 'text-brand-primary');
    });
  });

  describe('전문가 모드', () => {
    it('전문가 메뉴를 렌더링한다', () => {
      mockPathname = '/mypage/seller/services';
      render(
        <MobileMyPageNav currentRole="seller" onRoleChange={mockOnRoleChange} isSeller={true} />
      );

      expect(screen.getByText('서비스 관리')).toBeInTheDocument();
      expect(screen.getByText('주문 관리')).toBeInTheDocument();
      expect(screen.getByText('정산 관리')).toBeInTheDocument();
      expect(screen.getByText('포트폴리오')).toBeInTheDocument();
    });

    it('전문가 버튼이 활성화 상태다', () => {
      mockPathname = '/mypage/seller/services';
      render(
        <MobileMyPageNav currentRole="seller" onRoleChange={mockOnRoleChange} isSeller={true} />
      );

      const sellerButton = screen.getByRole('button', { name: '전문가' });
      expect(sellerButton).toHaveClass('bg-white', 'text-brand-primary');
    });
  });

  describe('역할 전환', () => {
    it('전문가 버튼 클릭 시 onRoleChange가 호출된다', () => {
      render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      fireEvent.click(screen.getByRole('button', { name: '전문가' }));

      expect(mockOnRoleChange).toHaveBeenCalledWith('seller');
    });

    it('구매자 버튼 클릭 시 onRoleChange가 호출된다', () => {
      mockPathname = '/mypage/seller/services';
      render(
        <MobileMyPageNav currentRole="seller" onRoleChange={mockOnRoleChange} isSeller={true} />
      );

      fireEvent.click(screen.getByRole('button', { name: '구매자' }));

      expect(mockOnRoleChange).toHaveBeenCalledWith('buyer');
    });
  });

  describe('스타일', () => {
    it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
      const { container } = render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('lg:hidden');
    });

    it('그리드 레이아웃이 적용된다', () => {
      const { container } = render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-4');
    });
  });

  describe('링크', () => {
    it('올바른 href를 가진다', () => {
      render(
        <MobileMyPageNav currentRole="buyer" onRoleChange={mockOnRoleChange} isSeller={false} />
      );

      expect(screen.getByRole('link', { name: /주문 내역/ })).toHaveAttribute(
        'href',
        '/mypage/buyer/orders'
      );
      expect(screen.getByRole('link', { name: /찜한 서비스/ })).toHaveAttribute(
        'href',
        '/mypage/buyer/favorites'
      );
    });
  });
});
