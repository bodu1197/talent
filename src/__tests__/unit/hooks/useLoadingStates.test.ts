import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoadingStates } from '@/hooks/useLoadingStates';

describe('useLoadingStates', () => {
  const initialStates = {
    loading: false,
    uploading: false,
    deleting: false,
  };

  describe('initialization', () => {
    it('should initialize with provided states', () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      expect(result.current.states).toEqual(initialStates);
    });

    it('should initialize with all true states', () => {
      const allTrue = { a: true, b: true };
      const { result } = renderHook(() => useLoadingStates(allTrue));

      expect(result.current.states).toEqual(allTrue);
    });
  });

  describe('setLoading', () => {
    it('should set a specific state to true', () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      act(() => {
        result.current.setLoading('loading', true);
      });

      expect(result.current.states.loading).toBe(true);
      expect(result.current.states.uploading).toBe(false);
      expect(result.current.states.deleting).toBe(false);
    });

    it('should set a specific state to false', () => {
      const { result } = renderHook(() => useLoadingStates({
        loading: true,
        uploading: false,
        deleting: false,
      }));

      act(() => {
        result.current.setLoading('loading', false);
      });

      expect(result.current.states.loading).toBe(false);
    });

    it('should allow multiple state changes', () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      act(() => {
        result.current.setLoading('loading', true);
        result.current.setLoading('uploading', true);
      });

      expect(result.current.states.loading).toBe(true);
      expect(result.current.states.uploading).toBe(true);
    });
  });

  describe('withLoading', () => {
    it('should set loading false after function execution', async () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      await act(async () => {
        await result.current.withLoading('loading', async () => {
          return 'result';
        });
      });

      // After execution, loading should be false
      expect(result.current.states.loading).toBe(false);
    });

    it('should return the function result', async () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      let returnValue: string = '';

      await act(async () => {
        returnValue = await result.current.withLoading('loading', async () => {
          return 'test-result';
        });
      });

      expect(returnValue).toBe('test-result');
    });

    it('should set loading false even if function throws', async () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      await act(async () => {
        try {
          await result.current.withLoading('loading', async () => {
            throw new Error('Test error');
          });
        } catch (e) {
          // Expected
        }
      });

      expect(result.current.states.loading).toBe(false);
    });

    it('should work with async functions', async () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      const asyncFn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });

      let returnValue: string = '';

      await act(async () => {
        returnValue = await result.current.withLoading('uploading', asyncFn);
      });

      expect(asyncFn).toHaveBeenCalled();
      expect(returnValue).toBe('async-result');
      expect(result.current.states.uploading).toBe(false);
    });
  });

  describe('resetAll', () => {
    it('should reset all states to initial values', () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      act(() => {
        result.current.setLoading('loading', true);
        result.current.setLoading('uploading', true);
        result.current.setLoading('deleting', true);
      });

      expect(result.current.states.loading).toBe(true);
      expect(result.current.states.uploading).toBe(true);
      expect(result.current.states.deleting).toBe(true);

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.states).toEqual(initialStates);
    });
  });

  describe('reset', () => {
    it('should reset only the specified state', () => {
      const { result } = renderHook(() => useLoadingStates(initialStates));

      act(() => {
        result.current.setLoading('loading', true);
        result.current.setLoading('uploading', true);
      });

      act(() => {
        result.current.reset('loading');
      });

      expect(result.current.states.loading).toBe(false);
      expect(result.current.states.uploading).toBe(true);
    });
  });
});
