import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileServiceHeader from '@/components/services/MobileServiceHeader';

// Mock next/navigation
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe('MobileServiceHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location.href
    delete (window as { location?: unknown }).location;
    window.location = { href: '', origin: 'https://example.com' } as Location;
  });

  it('헤더를 렌더링한다', () => {
    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    expect(screen.getByRole('button', { name: '뒤로가기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전화하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '공유하기' })).toBeInTheDocument();
  });

  it('뒤로가기 버튼 클릭 시 router.back()이 호출된다', () => {
    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '뒤로가기' }));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('전화번호가 있으면 전화 링크가 동작한다', () => {
    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
        sellerPhone="010-1234-5678"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '전화하기' }));

    expect(window.location.href).toBe('tel:010-1234-5678');
  });

  it('전화번호가 없으면 알림을 표시한다', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '전화하기' }));

    expect(alertMock).toHaveBeenCalledWith('판매자 연락처가 등록되지 않았습니다.');
    alertMock.mockRestore();
  });

  it('공유 버튼 클릭 시 Web Share API 또는 클립보드 복사가 동작한다', async () => {
    // Mock navigator.share
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      writable: true,
    });

    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    expect(shareMock).toHaveBeenCalledWith({
      title: '테스트 서비스',
      url: 'https://example.com/services/service-1',
    });
  });

  it('Web Share API가 없으면 클립보드에 복사한다', async () => {
    // Remove navigator.share
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
    });

    // Mock navigator.clipboard
    const clipboardMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardMock },
      writable: true,
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '공유하기' }));

    // Wait for async operations
    await vi.waitFor(() => {
      expect(clipboardMock).toHaveBeenCalled();
    });

    alertMock.mockRestore();
  });

  it('버튼들에 올바른 스타일이 적용된다', () => {
    render(
      <MobileServiceHeader
        serviceId="service-1"
        serviceTitle="테스트 서비스"
      />
    );

    const backButton = screen.getByRole('button', { name: '뒤로가기' });
    expect(backButton).toHaveClass('bg-black/40', 'rounded-full');
  });
});
