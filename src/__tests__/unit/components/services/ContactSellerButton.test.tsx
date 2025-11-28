import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactSellerButton from '@/components/services/ContactSellerButton';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock react-hot-toast
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: {
    error: (msg: string) => mockToastError(msg),
    success: vi.fn(),
  },
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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactSellerButton', () => {
  const defaultProps = {
    sellerId: 'seller-123',
    serviceId: 'service-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('전문가에게 문의하기 버튼을 렌더링한다', () => {
    render(<ContactSellerButton {...defaultProps} />);

    expect(screen.getByText('전문가에게 문의하기')).toBeInTheDocument();
  });

  it('버튼이 올바른 스타일을 가진다', () => {
    render(<ContactSellerButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'py-3', 'border-2', 'border-brand-primary');
  });

  it('메시지 아이콘을 표시한다', () => {
    const { container } = render(<ContactSellerButton {...defaultProps} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('채팅방 생성이 성공하면 채팅 페이지로 이동한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ room_id: 'room-789' }),
    });

    render(<ContactSellerButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-456',
        }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/chat?room=room-789');
    });
  });

  it('401 에러 시 로그인 페이지로 이동한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    render(<ContactSellerButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/services/service-456');
    });
  });

  it('API 오류 시 에러 토스트를 표시한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: '서버 오류' }),
    });

    render(<ContactSellerButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('문의 시작에 실패했습니다. 다시 시도해주세요.');
    });
  });

  it('로딩 중에는 버튼이 비활성화된다', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ContactSellerButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('로딩 중에는 처리 중 텍스트를 표시한다', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<ContactSellerButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('처리 중...')).toBeInTheDocument();
    });
  });
});
