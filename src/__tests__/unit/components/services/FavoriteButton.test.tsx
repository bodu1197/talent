import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FavoriteButton from '@/components/services/FavoriteButton';

// Mock useAuth
const mockUser = { id: 'user-123', email: 'test@example.com' };
const mockUseAuth = vi.fn(() => ({ user: mockUser }));
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock useRouter
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
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

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser });
    // 기본: 찜 목록이 비어있음
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  it('찜하기 버튼을 렌더링한다', async () => {
    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜하기')).toBeInTheDocument();
    });
  });

  it('찜 상태를 체크하는 API를 호출한다', async () => {
    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/service-favorites');
    });
  });

  it('이미 찜한 서비스면 찜 취소 버튼을 표시한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'fav-1', service_id: 'service-1', user_id: 'user-123' }],
      }),
    });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜 취소')).toBeInTheDocument();
    });
  });

  it('찜하기 버튼 클릭 시 POST API를 호출한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜하기')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/user/service-favorites',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ serviceId: 'service-1' }),
        })
      );
    });
  });

  it('찜 취소 버튼 클릭 시 DELETE API를 호출한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{ id: 'fav-1', service_id: 'service-1', user_id: 'user-123' }],
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜 취소')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/user/service-favorites?serviceId=service-1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('비로그인 상태에서 클릭 시 로그인 페이지로 이동 확인', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    global.confirm = vi.fn(() => true);

    render(<FavoriteButton serviceId="service-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('비로그인 상태에서 취소하면 이동하지 않는다', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    global.confirm = vi.fn(() => false);

    render(<FavoriteButton serviceId="service-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('aria-label이 상태에 따라 변경된다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText('찜하기')).toBeInTheDocument();
    });
  });

  it('aria-pressed가 찜 상태를 반영한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'fav-1', service_id: 'service-1', user_id: 'user-123' }],
      }),
    });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('className prop이 적용된다', () => {
    render(<FavoriteButton serviceId="service-1" className="custom-class" />);

    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('로딩 중에는 버튼이 비활성화된다', async () => {
    // 느린 응답 시뮬레이션
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜하기')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    // 로딩 중 버튼 비활성화 확인
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('찜 성공 후 페이지를 새로고침한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<FavoriteButton serviceId="service-1" />);

    await waitFor(() => {
      expect(screen.getByText('찜하기')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
