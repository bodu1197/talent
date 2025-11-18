import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserConversations } from '@/lib/supabase/queries/messages'
import { createClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client')

describe('getUserConversations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('사용자의 대화 목록을 반환한다', async () => {
    const mockData = [
      {
        id: 'conv-1',
        last_message_preview: '안녕하세요',
        participant1_unread_count: 2,
        participant2_unread_count: 0,
        last_message_at: '2025-10-30T10:00:00Z',
        participant1_id: 'user-123',
        participant2_id: 'user-456',
        participant1: { id: 'user-123', name: 'Me', profile_image: 'me.jpg' },
        participant2: { id: 'user-456', name: 'Other User', profile_image: 'other.jpg' },
        order: { order_number: '12345', title: 'Test Order' },
      },
    ]

    vi.mocked(createClient).mockReturnValue({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    } as unknown as ReturnType<typeof createClient>)

    const result = await getUserConversations('user-123')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('conv-1')
    expect(result[0].userName).toBe('Other User')
    expect(result[0].unreadCount).toBe(2)
    expect(result[0].lastMessage).toBe('안녕하세요')
    expect(result[0].orderTitle).toBe('Test Order')
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
    } as unknown as ReturnType<typeof createClient>)

    const result = await getUserConversations('user-123')
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
    } as unknown as ReturnType<typeof createClient>)

    await expect(getUserConversations('user-123')).rejects.toThrow('Database error')
  })
})
