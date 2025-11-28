import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminSidebar from '@/components/admin/Sidebar';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
let mockPathname = '/admin/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock Supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: mockSelect,
    }),
  }),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/admin/dashboard';
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({ count: 0 });
  });

  it('사이드바를 렌더링한다', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('Admin 로고를 표시한다', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('메뉴 항목들을 렌더링한다', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('사용자 관리')).toBeInTheDocument();
    expect(screen.getByText('서비스 관리')).toBeInTheDocument();
    expect(screen.getByText('주문 관리')).toBeInTheDocument();
  });

  it('현재 경로와 일치하는 메뉴가 활성화된다', () => {
    mockPathname = '/admin/dashboard';
    render(<AdminSidebar />);

    const dashboardLink = screen.getByRole('link', { name: '대시보드' });
    expect(dashboardLink).toHaveClass('bg-white/20');
  });

  it('사이트 이동 링크를 렌더링한다', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: '사이트로 이동' })).toHaveAttribute('href', '/');
  });

  it('축소 버튼을 클릭하면 사이드바가 축소된다', () => {
    const { container } = render(<AdminSidebar />);

    const collapseButton = container.querySelector('button');
    fireEvent.click(collapseButton!);

    // 축소 시 Admin 텍스트가 사라짐
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('올바른 링크 경로를 가진다', () => {
    render(<AdminSidebar />);

    expect(screen.getByRole('link', { name: '대시보드' })).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.getByRole('link', { name: '사용자 관리' })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: '서비스 관리' })).toHaveAttribute('href', '/admin/services');
  });

  it('모든 메뉴 항목이 렌더링된다', () => {
    render(<AdminSidebar />);

    const menuItems = [
      '대시보드',
      '사용자 관리',
      '서비스 관리',
      '수정 요청 관리',
      '주문 관리',
      '정산 관리',
      '출금 관리',
      '광고 관리',
      '세금계산서',
      '리뷰 관리',
      '신고 관리',
      '분쟁 관리',
      '카테고리 관리',
      '통계 분석',
      '활동 로그',
      '시스템 설정',
    ];

    for (const item of menuItems) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it('하위 경로도 메뉴를 활성화한다', () => {
    mockPathname = '/admin/users/123';
    render(<AdminSidebar />);

    const usersLink = screen.getByRole('link', { name: '사용자 관리' });
    expect(usersLink).toHaveClass('bg-white/20');
  });
});
