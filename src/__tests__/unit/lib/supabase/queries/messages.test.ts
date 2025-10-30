import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getConversations } from '@/lib/supabase/queries/messages'
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

describe('getConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자의 대화 목록을 반환한다', async () => {
    const mockData = [
      {
        id: 'conv-1',
        last_message: '안녕하세요',
        unread_count: 2,
        updated_at: '2025-10-30T10:00:00Z',
      },
    ]

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      })),
    } as any)

    const result = await getConversations('user-123')
    expect(result).toEqual(mockData)
    expect(result[0].unread_count).toBe(2)
  })

  it('빈 대화 목록을 반환할 수 있다', async () => {
    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    } as any)

    const result = await getConversations('user-123')
    expect(result).toEqual([])
    expect(Array.isArray(result)).toBe(true)
  })

  it('에러 발생 시 throw 한다', async () => {
    const mockError = { message: 'Database error' }

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: mockError })),
          })),
        })),
      })),
    } as any)

    await expect(getConversations('user-123')).rejects.toThrow('Database error')
  })
})
