/* eslint-disable sonarjs/no-nested-functions -- Test files use nested describe/it blocks */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSellerEarnings } from '@/lib/supabase/queries/earnings';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server');

describe('getSellerEarnings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('판매자의 수익 정보를 반환한다', async () => {
    const mockData = {
      id: 'earnings-1',
      seller_id: 'seller-123',
      available_balance: 50000,
      pending_balance: 10000,
      total_withdrawn: 100000,
      total_earned: 160000,
    };

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getSellerEarnings('seller-123');
    expect(result).toEqual(mockData);
    expect(result.available_balance).toBe(50000);
  });

  it('판매자가 없으면 null을 반환한다', async () => {
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const result = await getSellerEarnings('seller-123');
    expect(result).toBeNull();
  });

  it('에러 발생 시 throw 한다', async () => {
    const mockError = { message: 'Database error' };

    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    await expect(getSellerEarnings('seller-123')).rejects.toThrow('Database error');
  });
});
