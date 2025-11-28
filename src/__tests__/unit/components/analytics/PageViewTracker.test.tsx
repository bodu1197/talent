import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';

// Mock next/navigation
const mockPathname = '/services/123';
const mockSearchParams = {
  toString: vi.fn().mockReturnValue(''),
};

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PageViewTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('페이지 조회를 추적한다', async () => {
    render(<PageViewTracker />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String),
      });
    });
  });

  it('올바른 경로를 전송한다', async () => {
    render(<PageViewTracker />);

    await waitFor(() => {
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.path).toBe('/services/123');
    });
  });

  it('검색 파라미터가 있으면 URL에 포함된다', async () => {
    mockSearchParams.toString.mockReturnValue('sort=latest&page=2');

    render(<PageViewTracker />);

    await waitFor(() => {
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.path).toBe('/services/123?sort=latest&page=2');
    });
  });

  it('null을 반환한다', () => {
    const { container } = render(<PageViewTracker />);

    expect(container.firstChild).toBeNull();
  });

  it('fetch 에러를 조용히 처리한다', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Should not throw
    expect(() => render(<PageViewTracker />)).not.toThrow();
  });

  it('referrer를 전송한다', async () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com',
      writable: true,
    });

    render(<PageViewTracker />);

    await waitFor(() => {
      const call = mockFetch.mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.referrer).toBe('https://google.com');
    });
  });
});
