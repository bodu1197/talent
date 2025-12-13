import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatNotificationBadge from '@/components/chat/ChatNotificationBadge';

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

// Mock useChatUnreadCount hook
const mockUseChatUnreadCount = vi.fn();
vi.mock('@/components/providers/ChatUnreadProvider', () => ({
  useChatUnreadCount: () => mockUseChatUnreadCount(),
}));

describe('ChatNotificationBadge', () => {
  it('userId가 없으면 아무것도 렌더링하지 않는다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 0, userId: null });

    const { container } = render(<ChatNotificationBadge />);

    expect(container.firstChild).toBeNull();
  });

  it('userId가 있으면 채팅 링크를 렌더링한다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 0, userId: 'user-1' });

    render(<ChatNotificationBadge />);

    expect(screen.getByRole('link', { name: '채팅' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '채팅' })).toHaveAttribute('href', '/chat');
  });

  it('읽지 않은 메시지가 없으면 배지가 표시되지 않는다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 0, userId: 'user-1' });

    const { container } = render(<ChatNotificationBadge />);

    expect(container.querySelector('span')).toBeNull();
  });

  it('읽지 않은 메시지가 있으면 배지가 표시된다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 5, userId: 'user-1' });

    render(<ChatNotificationBadge />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('읽지 않은 메시지가 99개 초과면 99+로 표시된다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 150, userId: 'user-1' });

    render(<ChatNotificationBadge />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('정확히 99개의 메시지는 99로 표시된다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 99, userId: 'user-1' });

    render(<ChatNotificationBadge />);

    expect(screen.getByText('99')).toBeInTheDocument();
  });

  it('배지에 올바른 스타일이 적용된다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 10, userId: 'user-1' });

    render(<ChatNotificationBadge />);

    const badge = screen.getByText('10');
    expect(badge).toHaveClass('bg-red-500', 'text-white', 'rounded-full');
  });

  it('MessageCircle 아이콘이 렌더링된다', () => {
    mockUseChatUnreadCount.mockReturnValue({ unreadCount: 0, userId: 'user-1' });

    const { container } = render(<ChatNotificationBadge />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
