import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShareButton from '@/components/services/ShareButton';

// Mock react-hot-toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('react-hot-toast', () => ({
  default: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

describe('ShareButton', () => {
  const mockServiceId = 'service-123';
  const mockServiceTitle = '테스트 서비스';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock location
    Object.defineProperty(globalThis, 'location', {
      value: { origin: 'https://example.com' },
      writable: true,
    });

    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });

    // Default: Web Share API 미지원
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'canShare', {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it('공유 버튼을 렌더링한다', () => {
    render(<ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />);

    expect(screen.getByText('공유')).toBeInTheDocument();
  });

  it('Share2 아이콘을 표시한다', () => {
    const { container } = render(
      <ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('클릭 시 클립보드에 URL을 복사한다', async () => {
    render(<ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/services/service-123'
      );
    });
  });

  it('복사 성공 시 성공 토스트를 표시한다', async () => {
    render(<ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('링크가 복사되었습니다');
    });
  });

  it('복사 성공 후 "복사됨" 텍스트를 표시한다', async () => {
    render(<ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('복사됨')).toBeInTheDocument();
    });
  });

  it('버튼에 올바른 스타일이 적용된다', () => {
    render(<ShareButton serviceId={mockServiceId} serviceTitle={mockServiceTitle} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'py-3', 'border', 'rounded-lg');
  });
});
