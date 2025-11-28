import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryVisitTracker from '@/components/categories/CategoryVisitTracker';

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

describe('CategoryVisitTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it('로그인 사용자이고 1차 카테고리일 때 방문을 추적한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    render(
      <CategoryVisitTracker
        categoryId="cat-1"
        categoryName="AI 서비스"
        categorySlug="ai-services"
        isTopLevel={true}
      />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/user/category-visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: 'cat-1',
          categoryName: 'AI 서비스',
          categorySlug: 'ai-services',
        }),
      });
    });
  });

  it('비로그인 사용자인 경우 추적하지 않는다', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <CategoryVisitTracker
        categoryId="cat-1"
        categoryName="AI 서비스"
        categorySlug="ai-services"
        isTopLevel={true}
      />
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('1차 카테고리가 아닌 경우 추적하지 않는다', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    render(
      <CategoryVisitTracker
        categoryId="cat-1-1"
        categoryName="AI 이미지"
        categorySlug="ai-images"
        isTopLevel={false}
      />
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('null을 반환한다', () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    const { container } = render(
      <CategoryVisitTracker
        categoryId="cat-1"
        categoryName="AI 서비스"
        categorySlug="ai-services"
        isTopLevel={true}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('fetch 에러를 조용히 처리한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockFetch.mockRejectedValue(new Error('Network error'));

    expect(() =>
      render(
        <CategoryVisitTracker
          categoryId="cat-1"
          categoryName="AI 서비스"
          categorySlug="ai-services"
          isTopLevel={true}
        />
      )
    ).not.toThrow();
  });

  it('401 에러를 조용히 처리한다', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    expect(() =>
      render(
        <CategoryVisitTracker
          categoryId="cat-1"
          categoryName="AI 서비스"
          categorySlug="ai-services"
          isTopLevel={true}
        />
      )
    ).not.toThrow();
  });
});
