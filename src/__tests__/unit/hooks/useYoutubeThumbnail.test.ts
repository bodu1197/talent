import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useYoutubeThumbnail } from '@/hooks/useYoutubeThumbnail';

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();
global.URL.createObjectURL = vi.fn(() => 'blob:test');

describe('useYoutubeThumbnail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty videoId and not loading', () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      expect(result.current.videoId).toBe('');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      expect(result.current.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from short YouTube URL', () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      expect(result.current.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from embed URL', () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      expect(result.current.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid URL', () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      expect(result.current.extractVideoId('https://example.com/video')).toBeNull();
    });
  });

  describe('fetchThumbnail', () => {
    it('should return null for empty URL', async () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      let fetchResult: any;
      await act(async () => {
        fetchResult = await result.current.fetchThumbnail('');
      });

      expect(fetchResult).toBeNull();
    });

    it('should return null for invalid YouTube URL', async () => {
      const { result } = renderHook(() => useYoutubeThumbnail());

      let fetchResult: any;
      await act(async () => {
        fetchResult = await result.current.fetchThumbnail('https://example.com');
      });

      expect(fetchResult).toBeNull();
    });

    it('should fetch thumbnail for valid YouTube URL', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const { result } = renderHook(() => useYoutubeThumbnail());

      let fetchResult: any;
      await act(async () => {
        fetchResult = await result.current.fetchThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      });

      expect(fetchResult).not.toBeNull();
      expect(fetchResult.videoId).toBe('dQw4w9WgXcQ');
    });
  });

  describe('resetVideoId', () => {
    it('should reset videoId to empty string', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const { result } = renderHook(() => useYoutubeThumbnail());

      await act(async () => {
        await result.current.fetchThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      });

      expect(result.current.videoId).toBe('dQw4w9WgXcQ');

      act(() => {
        result.current.resetVideoId();
      });

      expect(result.current.videoId).toBe('');
    });
  });
});
