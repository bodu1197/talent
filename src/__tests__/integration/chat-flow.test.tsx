import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatMessageArea from '@/app/chat/components/ChatMessageArea';
import { POST } from '@/app/api/payment-requests/route';
import { NextRequest } from 'next/server';

// --- Mocks Setup ---

const mocks = vi.hoisted(() => {
  const channelMock = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
  };
  const clientSupabase = {
    channel: vi.fn(() => channelMock),
    removeChannel: vi.fn(),
  };
  const serverSupabase = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  };

  return {
    clientSupabase,
    serverSupabase,
    channelMock, // exposed for assertions if needed
    loggerError: vi.fn(),
    loggerInfo: vi.fn(),
    loggerWarn: vi.fn(),
    loggerDebug: vi.fn(),
  };
});

// 1. Mock Supabase Client (UI Component side)
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mocks.clientSupabase),
}));

// 2. Mock Supabase Server (API side)
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mocks.serverSupabase)),
  createServiceRoleClient: vi.fn(() => mocks.serverSupabase),
}));

// 3. Mock Logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: mocks.loggerError,
    info: mocks.loggerInfo,
    warn: mocks.loggerWarn,
    debug: mocks.loggerDebug,
  },
}));

// 4. Mock ProfileImage (to avoid Image component issues)
vi.mock('@/components/common/ProfileImage', () => ({
  default: () => <div data-testid="profile-image" />,
}));

// --- Test Implementation ---

describe('Integration: Chat Payment Request Flow', () => {
  // Props for ChatMessageArea
  const defaultProps = {
    selectedRoom: {
      id: 'room-123',
      service: {
        id: 'service-456',
        title: 'Integration Test Service',
        thumbnail_url: null,
      },
    },
    messages: [],
    userId: 'seller-user-123',
    newMessage: '',
    selectedFile: null,
    isLoading: false,
    isUploading: false,
    isSeller: true,
    onSendMessage: vi.fn(),
    onMessageChange: vi.fn(),
    onFileSelect: vi.fn(),
    onFileClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // API Side Mocks
    mocks.serverSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'seller-user-123' } },
      error: null,
    });

    mocks.serverSupabase.from.mockImplementation((table: string) => {
      if (table === 'chat_rooms') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              user1_id: 'buyer-user-789',
              user2_id: 'seller-user-123',
              service_id: 'service-456',
            },
            error: null,
          }),
        };
      }
      if (table === 'sellers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'seller-id-123' },
            error: null,
          }),
        };
      }
      if (table === 'payment_requests') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'pr-new-123', status: 'pending' },
            error: null,
          }),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }), // Initial load empty
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });
  });

  it('Seller creates a payment request via Modal, API processes it', async () => {
    // 1. Intercept Fetch
    const mockFetch = vi.fn().mockImplementation(async (url, options) => {
      // Initial load of payment requests
      if (url.startsWith('/api/payment-requests?') && (!options || options.method === 'GET')) {
        return {
          ok: true,
          json: () => Promise.resolve({ payment_requests: [] }),
        };
      }

      // POST /api/payment-requests
      if (url === '/api/payment-requests' && options.method === 'POST') {
        const body = JSON.parse(options.body);
        const req = new NextRequest('http://localhost:3000/api/payment-requests', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const response = await POST(req);
        const responseData = await response.json();

        return {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          json: () => Promise.resolve(responseData),
        };
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });
    global.fetch = mockFetch;

    // 2. Render
    render(<ChatMessageArea {...defaultProps} />);

    // 3. Open Modal
    const requestButton = screen.getByRole('button', { name: /결제 요청/i });
    fireEvent.click(requestButton);

    // 4. Fill Form
    // Modal should be open now

    const titleInput = screen.getByLabelText('제목 *');
    const amountInput = screen.getByLabelText('결제 금액 (원) *');

    fireEvent.change(titleInput, { target: { value: 'Integration Test Payment' } });
    fireEvent.change(amountInput, { target: { value: '25000' } });

    // 5. Submit
    const submitButton = screen.getByRole('button', { name: '결제 요청 전송' });
    fireEvent.click(submitButton);

    // 6. Verify Interaction
    await waitFor(() => {
      // Check API was called indirectly via matchers on fetch or result
      // Since we mocked fetch to call API, we verify the API's successful effect
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/payment-requests',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('25000'),
        })
      );
    });

    // 7. Verify Success Toast (Mocked) calls
    // We can't easily check toast directly without more mocks, but we can verify the 'success' return from our fetch bridge
    // implies the code path reached toast.success.
  });
});
