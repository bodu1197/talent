import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserCoupons } from '@/lib/supabase/queries/coupons'
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

describe('getUserCoupons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자의 쿠폰 목록을 반환한다', async () => {
    const mockData = [
      {
        id: '1',
        coupon: { name: '테스트 쿠폰', discount_value: 5000 },
        expires_at: '2025-12-31',
      },
    ]

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    } as any)

    const result = await getUserCoupons('user-123')
    expect(result).toEqual(mockData)
  })

  it('에러 발생 시 throw 한다', async () => {
    const mockError = { message: 'Database error' }

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      })),
    } as any)

    await expect(getUserCoupons('user-123')).rejects.toThrow('Database error')
  })

  it('빈 배열을 반환할 수 있다', async () => {
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    } as any)

    const result = await getUserCoupons('user-123')
    expect(result).toEqual([])
    expect(Array.isArray(result)).toBe(true)
  })
})
