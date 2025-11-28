import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminHeader from '@/components/admin/Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
const mockSignOut = vi.fn();
const mockUseAuth = vi.fn();
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AdminHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { email: 'admin@example.com' },
      signOut: mockSignOut,
    });
    mockSignOut.mockResolvedValue(undefined);
  });

  it('헤더를 렌더링한다', () => {
    render(<AdminHeader />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('검색 입력란을 렌더링한다', () => {
    render(<AdminHeader />);

    expect(screen.getByPlaceholderText('사용자, 서비스, 주문 검색...')).toBeInTheDocument();
  });

  it('사용자 이메일 첫 글자를 표시한다', () => {
    render(<AdminHeader />);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('사용자 이메일을 표시한다', () => {
    render(<AdminHeader />);

    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('사용자 메뉴 버튼 클릭 시 드롭다운이 열린다', () => {
    render(<AdminHeader />);

    const userButton = screen.getByText('admin@example.com').closest('button');
    fireEvent.click(userButton!);

    expect(screen.getByText('프로필')).toBeInTheDocument();
    expect(screen.getByText('설정')).toBeInTheDocument();
    expect(screen.getByText('로그아웃')).toBeInTheDocument();
  });

  it('로그아웃 버튼 클릭 시 signOut이 호출된다', async () => {
    render(<AdminHeader />);

    const userButton = screen.getByText('admin@example.com').closest('button');
    fireEvent.click(userButton!);

    const logoutButton = screen.getByText('로그아웃');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('ESC 키로 메뉴를 닫는다', () => {
    render(<AdminHeader />);

    const userButton = screen.getByText('admin@example.com').closest('button');
    fireEvent.click(userButton!);

    expect(screen.getByText('프로필')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('프로필')).not.toBeInTheDocument();
  });

  it('프로필 링크가 올바른 href를 가진다', () => {
    render(<AdminHeader />);

    const userButton = screen.getByText('admin@example.com').closest('button');
    fireEvent.click(userButton!);

    expect(screen.getByRole('link', { name: /프로필/ })).toHaveAttribute('href', '/mypage/settings');
  });

  it('설정 링크가 올바른 href를 가진다', () => {
    render(<AdminHeader />);

    const userButton = screen.getByText('admin@example.com').closest('button');
    fireEvent.click(userButton!);

    expect(screen.getByRole('link', { name: /설정/ })).toHaveAttribute('href', '/admin/settings');
  });

  it('user가 없을 때 기본값을 표시한다', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      signOut: mockSignOut,
    });

    render(<AdminHeader />);

    // '관리자'가 여러 곳에 나타날 수 있음
    const adminTexts = screen.getAllByText('관리자');
    expect(adminTexts.length).toBeGreaterThanOrEqual(1);
  });
});
