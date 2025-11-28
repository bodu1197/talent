import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PurchaseButton from '@/components/services/PurchaseButton';

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

describe('PurchaseButton', () => {
  const defaultProps = {
    sellerId: 'seller-123',
    serviceId: 'service-456',
    currentUserId: 'user-789',
    sellerUserId: 'seller-user-123',
    serviceTitle: '로고 디자인',
    servicePrice: 50000,
    deliveryDays: 7,
    revisionCount: 3,
    serviceDescription: '고품질 로고 디자인 서비스',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('구매하기 버튼을 렌더링한다', () => {
    render(<PurchaseButton {...defaultProps} />);

    expect(screen.getByText('구매하기')).toBeInTheDocument();
  });

  it('버튼이 올바른 스타일을 가진다', () => {
    render(<PurchaseButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'py-3', 'bg-brand-primary', 'text-white', 'rounded-lg');
  });

  it('비로그인 상태에서 클릭하면 로그인 페이지로 이동한다', async () => {
    render(<PurchaseButton {...defaultProps} currentUserId={null} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/services/service-456');
  });

  it('자신의 서비스를 구매하려고 하면 에러 토스트를 표시한다', async () => {
    render(<PurchaseButton {...defaultProps} currentUserId="seller-user-123" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockToastError).toHaveBeenCalledWith('자신의 서비스는 구매할 수 없습니다');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('구매 API 호출이 성공하면 결제 페이지로 이동한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ order_id: 'order-123' }),
    });

    render(<PurchaseButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/payments/direct-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: 'seller-123',
          service_id: 'service-456',
          title: '로고 디자인',
          amount: 50000,
          description: '고품질 로고 디자인 서비스',
          delivery_days: 7,
          revision_count: 3,
        }),
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/payment/direct/order-123');
    });
  });

  it('구매 API 호출 실패 시 에러 토스트를 표시한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: '결제 준비 실패' }),
    });

    render(<PurchaseButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('결제 준비 실패');
    });
  });

  it('구매 API 호출 중 로딩 상태를 표시한다', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<PurchaseButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('처리 중...')).toBeInTheDocument();
    });
  });

  it('로딩 중에는 버튼이 비활성화된다', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    render(<PurchaseButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  it('API 오류에 상세 정보가 있으면 포함하여 표시한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        error: '결제 준비 실패',
        details: '잔액 부족',
        code: 'INSUFFICIENT_BALANCE',
      }),
    });

    render(<PurchaseButton {...defaultProps} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        '결제 준비 실패: 잔액 부족 (INSUFFICIENT_BALANCE)'
      );
    });
  });

  it('currentUserId가 undefined인 경우도 로그인 페이지로 이동한다', async () => {
    render(<PurchaseButton {...defaultProps} currentUserId={undefined} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=/services/service-456');
  });
});
