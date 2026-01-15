import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/components/providers/AuthProvider';
import NotificationBell from '@/components/notifications/NotificationBell';

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

// Mock useAuth
// Mock useAuth
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

// Mock NotificationProvider
const mockUseNotifications = vi.fn(() => ({
  notifications: [],
  unreadCount: 0,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  refreshNotifications: vi.fn(),
}));

vi.mock('@/components/providers/NotificationProvider', () => ({
  useNotifications: () => mockUseNotifications(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Supabase client with proper chain
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'notif-1',
                user_id: 'user-123',
                type: 'order',
                title: '새 주문',
                message: '새로운 주문이 도착했습니다',
                link: '/mypage/seller/orders/order-1',
                is_read: false,
                created_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({}),
  })),
  removeChannel: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock user object with required Supabase User properties
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as const;

// Mock AuthContextType
const createMockAuthContext = (user: typeof mockUser | null) => ({
  user,
  profile: null,
  loading: false,
  signOut: vi.fn(),
  refreshProfile: vi.fn(),
});

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext(mockUser));
  });

  it('비로그인 상태에서는 아무것도 렌더링하지 않는다', () => {
    vi.mocked(useAuth).mockReturnValue(createMockAuthContext(null));

    const { container } = render(<NotificationBell />);

    expect(container.firstChild).toBeNull();
  });

  it('알림 벨 버튼을 렌더링한다', () => {
    render(<NotificationBell />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('알림 아이콘(Bell)을 표시한다', () => {
    const { container } = render(<NotificationBell />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('버튼 클릭 시 드롭다운을 토글한다', async () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button');

    // 드롭다운이 처음에는 없음
    expect(screen.queryByRole('heading', { name: '알림' })).not.toBeInTheDocument();

    // 클릭하면 열림
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '알림' })).toBeInTheDocument();
    });
  });

  it('aria-expanded가 드롭다운 상태를 반영한다', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('aria-haspopup이 true로 설정된다', () => {
    render(<NotificationBell />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
  });

  it('모든 알림 보기 링크가 있다', async () => {
    render(<NotificationBell />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const allNotificationsLink = screen.getByText('모든 알림 보기');
      expect(allNotificationsLink).toHaveAttribute('href', '/mypage/notifications');
    });
  });
});
