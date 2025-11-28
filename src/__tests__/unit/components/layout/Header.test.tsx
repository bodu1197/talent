import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '@/components/layout/Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

// Mock useAuth
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock child components
vi.mock('@/components/common/ProfileImage', () => ({
  default: ({ alt }: { alt: string }) => <div data-testid="profile-image">{alt}</div>,
}));

vi.mock('@/components/chat/ChatNotificationBadge', () => ({
  default: () => <div data-testid="chat-notification">Chat</div>,
}));

vi.mock('@/components/notifications/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Notifications</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/categories');
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signOut: mockSignOut,
    });
    mockSignOut.mockResolvedValue(undefined);
  });

  it('헤더를 렌더링한다', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('로고를 렌더링한다', () => {
    render(<Header />);

    expect(screen.getByText('돌파구')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '돌파구 홈으로 이동' })).toHaveAttribute('href', '/');
  });

  it('비로그인 상태에서 로그인/회원가입 버튼을 표시한다', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: '로그인 페이지로 이동' })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByRole('link', { name: '회원가입 페이지로 이동' })).toHaveAttribute('href', '/auth/register');
  });

  it('비로그인 상태에서 전문가등록 링크를 표시한다', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: '전문가로 등록하기' })).toHaveAttribute('href', '/expert/register');
  });

  it('로그인 상태에서 사용자 메뉴를 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', profile_image: '/profile.jpg', is_seller: false },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Header />);

    expect(screen.getByRole('button', { name: '사용자 메뉴' })).toBeInTheDocument();
    expect(screen.getByTestId('profile-image')).toBeInTheDocument();
  });

  it('로그인 상태에서 찜한 서비스 링크를 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', is_seller: false },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Header />);

    expect(screen.getByRole('link', { name: '찜한 서비스' })).toHaveAttribute('href', '/mypage/buyer/favorites');
  });

  it('로그인 상태에서 채팅 알림을 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', is_seller: false },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Header />);

    expect(screen.getByTestId('chat-notification')).toBeInTheDocument();
  });

  it('로그인 상태에서 알림을 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', is_seller: false },
      loading: false,
      signOut: mockSignOut,
    });

    render(<Header />);

    // PC와 모바일 버전 모두 있음
    const notifications = screen.getAllByTestId('notification-bell');
    expect(notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('메인 페이지가 아닐 때 검색창을 표시한다', () => {
    mockPathname.mockReturnValue('/categories');

    render(<Header />);

    expect(screen.getByRole('searchbox', { name: '서비스 검색' })).toBeInTheDocument();
  });

  it('메인 페이지에서는 검색창을 숨긴다', () => {
    mockPathname.mockReturnValue('/');

    const { container } = render(<Header />);

    // 검색 폼이 hidden 클래스를 가지는지 확인
    const searchForm = container.querySelector('form');
    expect(searchForm?.parentElement).toHaveClass('hidden');
  });

  it('검색어 입력 후 제출하면 검색 페이지로 이동한다', () => {
    render(<Header />);

    const searchInput = screen.getByRole('searchbox', { name: '서비스 검색' });
    fireEvent.change(searchInput, { target: { value: '테스트 검색어' } });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockPush).toHaveBeenCalledWith('/search?q=%ED%85%8C%EC%8A%A4%ED%8A%B8%20%EA%B2%80%EC%83%89%EC%96%B4');
  });

  it('빈 검색어는 제출하지 않는다', () => {
    render(<Header />);

    const searchInput = screen.getByRole('searchbox', { name: '서비스 검색' });
    fireEvent.submit(searchInput.closest('form')!);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('로딩 중일 때 스켈레톤을 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
      signOut: mockSignOut,
    });

    const { container } = render(<Header />);

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('판매자는 판매자 대시보드로 마이페이지 링크가 연결된다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', is_seller: true },
      loading: false,
      signOut: mockSignOut,
    });

    const { container } = render(<Header />);

    // 드롭다운 메뉴 내의 마이페이지 링크 확인 (invisible 상태이지만 DOM에 존재)
    const mypageLink = container.querySelector('a[href="/mypage/seller/dashboard"]');
    expect(mypageLink).toBeInTheDocument();
  });

  it('구매자는 구매자 대시보드로 마이페이지 링크가 연결된다', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1' },
      profile: { name: '홍길동', is_seller: false },
      loading: false,
      signOut: mockSignOut,
    });

    const { container } = render(<Header />);

    // 드롭다운 메뉴 내의 마이페이지 링크 확인 (invisible 상태이지만 DOM에 존재)
    const mypageLink = container.querySelector('a[href="/mypage/buyer/dashboard"]');
    expect(mypageLink).toBeInTheDocument();
  });
});
