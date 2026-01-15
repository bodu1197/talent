import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

// Mock usePathname
const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockUseAuth = vi.fn(() => ({
  user: mockUser as { id: string; email: string } | null,
}));
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useChatUnreadCount
const mockUnreadCount = vi.fn(() => ({ unreadCount: 0 }));
vi.mock('@/components/providers/ChatUnreadProvider', () => ({
  useChatUnreadCount: () => mockUnreadCount(),
}));

describe('MobileBottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/');
    mockUseAuth.mockReturnValue({ user: mockUser });
    mockUnreadCount.mockReturnValue({ unreadCount: 0 });
  });

  it('네비게이션을 렌더링한다', () => {
    render(<MobileBottomNav />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('모든 기본 네비게이션 항목을 렌더링한다', () => {
    render(<MobileBottomNav />);

    expect(screen.getByText('홈')).toBeInTheDocument();
    expect(screen.getByText('검색')).toBeInTheDocument();
    expect(screen.getByText('찜 목록')).toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
    expect(screen.getByText('마이페이지')).toBeInTheDocument();
  });

  it('현재 경로에 따라 활성화 상태가 변경된다', () => {
    mockPathname.mockReturnValue('/');
    render(<MobileBottomNav />);

    const homeLink = screen.getByLabelText('홈');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('검색 페이지에서 검색 링크가 활성화된다', () => {
    mockPathname.mockReturnValue('/search');
    render(<MobileBottomNav />);

    const searchLink = screen.getByLabelText('검색');
    expect(searchLink).toHaveAttribute('aria-current', 'page');
  });

  it('읽지 않은 메시지가 있으면 배지를 표시한다', () => {
    mockUnreadCount.mockReturnValue({ unreadCount: 5 });
    render(<MobileBottomNav />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('메시지 5개')).toBeInTheDocument();
  });

  it('읽지 않은 메시지가 99개 이상이면 99+를 표시한다', () => {
    mockUnreadCount.mockReturnValue({ unreadCount: 150 });
    render(<MobileBottomNav />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('읽지 않은 메시지가 0개면 배지를 표시하지 않는다', () => {
    mockUnreadCount.mockReturnValue({ unreadCount: 0 });
    render(<MobileBottomNav />);

    expect(screen.queryByText('99+')).not.toBeInTheDocument();
    expect(screen.getByText('메시지')).toBeInTheDocument();
  });

  it('비로그인 상태에서 마이페이지가 로그인으로 표시된다', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<MobileBottomNav />);

    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.queryByText('마이페이지')).not.toBeInTheDocument();
  });

  it('인증 필요한 메뉴는 비로그인 시 로그인 페이지로 리다이렉트', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<MobileBottomNav />);

    // 찜 목록 링크가 로그인으로 리다이렉트
    const favoritesLink = screen.getByLabelText('찜 목록');
    expect(favoritesLink).toHaveAttribute('href', '/auth/login');
  });

  it('로그인 상태에서 찜 목록 링크가 올바르다', () => {
    render(<MobileBottomNav />);

    const favoritesLink = screen.getByLabelText('찜 목록');
    expect(favoritesLink).toHaveAttribute('href', '/mypage/buyer/favorites');
  });

  it('마이페이지 경로에서 마이페이지 링크가 활성화된다', () => {
    mockPathname.mockReturnValue('/mypage/buyer/dashboard');
    render(<MobileBottomNav />);

    const mypageLink = screen.getByLabelText('마이페이지');
    expect(mypageLink).toHaveAttribute('aria-current', 'page');
  });

  it('채팅 페이지에서 메시지 링크가 활성화된다', () => {
    mockPathname.mockReturnValue('/chat/room-123');
    const labelText =
      mockUnreadCount().unreadCount > 0 ? `메시지 ${mockUnreadCount().unreadCount}개` : '메시지';
    render(<MobileBottomNav />);

    const chatLink = screen.getByLabelText(labelText);
    expect(chatLink).toHaveAttribute('aria-current', 'page');
  });

  it('각 링크가 올바른 href를 가진다', () => {
    render(<MobileBottomNav />);

    expect(screen.getByLabelText('홈')).toHaveAttribute('href', '/');
    expect(screen.getByLabelText('검색')).toHaveAttribute('href', '/search');
    expect(screen.getByLabelText('찜 목록')).toHaveAttribute('href', '/mypage/buyer/favorites');
    expect(screen.getByLabelText('메시지')).toHaveAttribute('href', '/chat');
    expect(screen.getByLabelText('마이페이지').getAttribute('href')).toMatch(/^\/mypage/);
  });
});
