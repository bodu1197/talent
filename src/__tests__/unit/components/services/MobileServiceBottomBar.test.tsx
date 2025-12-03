import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileServiceBottomBar from '@/components/services/MobileServiceBottomBar';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Supabase client
const mockFrom = vi.fn();
const mockDelete = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}));

describe('MobileServiceBottomBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockFrom.mockReturnValue({
      delete: mockDelete,
      insert: mockInsert,
    });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    mockInsert.mockResolvedValue({ error: null });
  });

  it('바텀바를 렌더링한다', () => {
    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    expect(screen.getByText('문의하기')).toBeInTheDocument();
    expect(screen.getByText('구매하기')).toBeInTheDocument();
  });

  it('찜 버튼을 렌더링한다', () => {
    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    expect(screen.getByRole('button', { name: '찜하기' })).toBeInTheDocument();
  });

  it('이미 찜한 경우 찜 해제 버튼으로 표시된다', () => {
    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
        initialIsFavorite={true}
      />
    );

    expect(screen.getByRole('button', { name: '찜 해제' })).toBeInTheDocument();
  });

  it('비로그인 사용자가 찜 버튼 클릭 시 로그인 페이지로 이동', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '찜하기' }));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('비로그인 사용자가 문의하기 버튼 클릭 시 로그인 페이지로 이동', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    fireEvent.click(screen.getByText('문의하기'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('비로그인 사용자가 구매하기 버튼 클릭 시 로그인 페이지로 이동', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    fireEvent.click(screen.getByText('구매하기'));

    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });

  it('본인 서비스에서 문의하기 클릭 시 알림을 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'seller-user-1' } });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    fireEvent.click(screen.getByText('문의하기'));

    expect(alertMock).toHaveBeenCalledWith('본인의 서비스입니다.');
    alertMock.mockRestore();
  });

  it('본인 서비스에서 구매하기 클릭 시 알림을 표시한다', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'seller-user-1' } });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    fireEvent.click(screen.getByText('구매하기'));

    expect(alertMock).toHaveBeenCalledWith('본인의 서비스는 구매할 수 없습니다.');
    alertMock.mockRestore();
  });

  it('문의하기 클릭 시 채팅 페이지로 이동한다', () => {
    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-2"
      />
    );

    fireEvent.click(screen.getByText('문의하기'));

    expect(mockPush).toHaveBeenCalledWith('/chat?seller=seller-1&service=service-1');
  });

  it('구매하기 클릭 시 결제 페이지로 이동한다', () => {
    render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-2"
      />
    );

    fireEvent.click(screen.getByText('구매하기'));

    expect(mockPush).toHaveBeenCalledWith('/payment?service=service-1');
  });

  it('모바일에서만 보이도록 lg:hidden 클래스가 적용된다', () => {
    const { container } = render(
      <MobileServiceBottomBar
        serviceId="service-1"
        sellerId="seller-1"
        sellerUserId="seller-user-1"
      />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('lg:hidden');
  });
});
