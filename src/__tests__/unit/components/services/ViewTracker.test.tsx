import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ViewTracker from '@/components/services/ViewTracker';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ViewTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('로그인 사용자인 경우 조회를 추적한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    render(<ViewTracker serviceId="service-123" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/service-views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId: 'service-123' }),
      });
    });
  });

  it('비로그인 사용자인 경우 조회를 추적하지 않는다', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(<ViewTracker serviceId="service-123" />);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('null을 반환한다', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    const { container } = render(<ViewTracker serviceId="service-123" />);

    expect(container.firstChild).toBeNull();
  });

  it('fetch 에러를 조용히 처리한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Should not throw
    expect(() => render(<ViewTracker serviceId="service-123" />)).not.toThrow();
  });

  it('올바른 serviceId를 전송한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    render(<ViewTracker serviceId="service-456" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/user/service-views',
        expect.objectContaining({
          body: JSON.stringify({ serviceId: 'service-456' }),
        })
      );
    });
  });

  it('사용자 ID가 변경되면 다시 추적한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    const { rerender } = render(<ViewTracker serviceId="service-123" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    mockFetch.mockClear();
    mockUseAuth.mockReturnValue({ user: { id: 'user-2' } });

    rerender(<ViewTracker serviceId="service-123" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
