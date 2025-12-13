import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PurchaseButton from '@/components/services/PurchaseButton';
import { POST } from '@/app/api/payments/direct-purchase/route';
import { NextRequest } from 'next/server';

// --- Mocks Setup ---

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  loggerError: vi.fn(),
  loggerInfo: vi.fn(),
  loggerWarn: vi.fn(),
  loggerDebug: vi.fn(),
  createOrder: vi.fn(),
}));

// 1. Mock Next.js Navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

// 2. Mock Toast
vi.mock('react-hot-toast', () => ({
  default: { error: mocks.toastError, success: mocks.toastSuccess },
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

// 6. Mock Transaction (moved up for consistency with hoisted mocks)
vi.mock('@/lib/transaction', () => ({
  createOrderWithIdempotency: mocks.createOrder,
}));

// 4. Mock Supabase Server
// We need to mock the Supabase client used by the API route
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// 5. Mock Rate Limit
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
  directPurchaseRateLimit: {},
}));

// --- Test Implementation ---

describe('Integration: Purchase Flow', () => {
  const defaultProps = {
    sellerId: 'seller-123',
    serviceId: 'service-456',
    currentUserId: 'user-789',
    sellerUserId: 'seller-user-123',
    serviceTitle: 'Integration Test Service',
    servicePrice: 50000,
    deliveryDays: 7,
    revisionCount: 3,
    serviceDescription: 'Integration Test Description',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Service Mock (DB)
    // The API will query 'sellers' and 'services' tables
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'sellers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'seller-123', user_id: 'seller-user-123' },
            error: null,
          }),
        };
      }
      if (table === 'services') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'service-456',
              title: 'Integration Test Service',
              price: 50000,
              delivery_days: 7,
              revision_count: 3,
            },
            error: null,
          }),
        };
      }
      if (table === 'service_packages') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'chat_rooms') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    // Mock Authenticated User for API
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-789' } },
      error: null,
    });

    // Mock Transaction Success
    mocks.createOrder.mockResolvedValue({
      data: { id: 'order-integrated-123', status: 'pending_payment' },
      error: null,
    });
  });

  it('Component triggers API and processes successful response', async () => {
    // 1. Intercept Fetch
    // Instead of network call, pass the request to the API handler
    const mockFetch = vi.fn().mockImplementation(async (url, options) => {
      if (url === '/api/payments/direct-purchase' && options.method === 'POST') {
        const body = JSON.parse(options.body);

        // Construct NextRequest for the API Handler
        const req = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
          method: 'POST',
          body: JSON.stringify(body),
        });

        // Call the Actual API Handler
        const response = await POST(req);

        // Convert NextResponse back to what fetch expects
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

    // 2. Render Component
    render(<PurchaseButton {...defaultProps} />);

    // 3. User Interaction
    const button = screen.getByRole('button', { name: /구매하기/i });
    fireEvent.click(button);

    // 4. Verify Success Flow
    await waitFor(() => {
      // Check if redirect happened (means success)
      expect(mocks.push).toHaveBeenCalledWith('/payment/direct/order-integrated-123');
    });

    // 5. Verify API Interaction Details
    // Ensure the API mocked function (createOrder) was actually called with correct data
    expect(mocks.createOrder).toHaveBeenCalledWith(
      expect.anything(), // supabase client
      expect.objectContaining({
        buyer_id: 'user-789',
        seller_id: 'seller-user-123',
        service_id: 'service-456',
        amount: 50000,
      }),
      expect.stringMatching(/^order_/) // merchant_uid
    );
  });

  it('Component handles API validation error correctly', async () => {
    // Force API failure by mocking service price mismatch in DB logic
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'services') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'service-456',
              title: 'Integration Test Service',
              price: 999999, // Mismatching price!
              delivery_days: 7,
              revision_count: 3,
            },
            error: null,
          }),
        };
      }
      // ... (rest same as before needs copy if not global, simpler to just override specific case)
      if (table === 'sellers') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { id: 'seller-123', user_id: 'seller-user-123' },
            error: null,
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      };
    });

    // Intercept Fetch
    const mockFetch = vi.fn().mockImplementation(async (url, options) => {
      const body = JSON.parse(options.body);
      const req = new NextRequest('http://localhost:3000/api/payments/direct-purchase', {
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
    });
    global.fetch = mockFetch;

    render(<PurchaseButton {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /구매하기/i }));

    await waitFor(() => {
      // Expect Toast Error from Component
      expect(mocks.toastError).toHaveBeenCalledWith('가격이 일치하지 않습니다');
    });
  });
});
