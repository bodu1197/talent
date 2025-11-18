/**
 * Order Status Update API Route Tests
 * Tests for /api/orders/[id]/status
 * Coverage: 90%+ including all error scenarios
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PATCH } from "@/app/api/orders/[id]/status/route";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Mock modules
vi.mock("@/lib/supabase/server");
vi.mock("@/lib/rate-limit");
vi.mock("@sentry/nextjs");

describe("PATCH /api/orders/[id]/status", () => {
  let mockSupabase: any;
  let mockCreateClient: any;
  let mockCheckRateLimit: any;

  beforeEach(async () => {
    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

    // Setup rate limit mock (success by default)
    mockCheckRateLimit = vi.fn().mockResolvedValue({ success: true });

    // Apply mocks
    const supabaseServer = await import("@/lib/supabase/server");
    vi.mocked(supabaseServer.createClient).mockImplementation(mockCreateClient);

    const rateLimit = await import("@/lib/rate-limit");
    vi.mocked(rateLimit.checkRateLimit).mockImplementation(mockCheckRateLimit);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Authentication Tests
   */
  describe("Authentication", () => {
    it("should return 401 when user is not authenticated (auth error)", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("인증이 필요합니다");
    });

    it("should return 401 when user is null", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("인증이 필요합니다");
    });
  });

  /**
   * Rate Limiting Tests
   */
  describe("Rate Limiting", () => {
    it("should return 429 when rate limit is exceeded", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const rateLimitResponse = new Response(
        JSON.stringify({
          error: "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
          limit: 20,
          remaining: 0,
          reset: new Date().toISOString(),
        }),
        { status: 429 },
      );

      mockCheckRateLimit.mockResolvedValue({
        success: false,
        error: rateLimitResponse,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(429);
    });
  });

  /**
   * Input Validation Tests
   */
  describe("Input Validation", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
    });

    it("should return 400 when status is missing", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({}),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("상태 값이 필요합니다");
    });

    it("should return 400 when status is not a string", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: 123 }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("상태 값이 필요합니다");
    });

    it("should return 400 when status is invalid", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "invalid_status" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("유효하지 않은 상태 값입니다");
    });

    it("should accept valid status values", async () => {
      const validStatuses = [
        "pending_payment",
        "in_progress",
        "revision",
        "delivered",
        "completed",
        "cancelled",
        "dispute",
      ];

      for (const status of validStatuses) {
        mockSupabase.from.mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        });

        const request = new NextRequest(
          "http://localhost:3000/api/orders/order-123/status",
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
        );

        const params = Promise.resolve({ id: "order-123" });
        const response = await PATCH(request, { params });
        const data = await response.json();

        // Should pass validation and fail on order not found
        expect(response.status).toBe(404);
        expect(data.error).toBe("주문을 찾을 수 없습니다");
      }
    });
  });

  /**
   * Order Validation Tests
   */
  describe("Order Validation", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });
    });

    it("should return 404 when order is not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Not found" },
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("주문을 찾을 수 없습니다");
    });

    it("should return 403 when user is neither buyer nor seller", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "in_progress",
          },
          error: null,
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("권한이 없습니다");
    });
  });

  /**
   * State Transition Tests
   */
  describe("State Transition Validation", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "buyer-123" } },
        error: null,
      });
    });

    it("should allow buyer to transition from delivered to completed", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "delivered",
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe("completed");
    });

    it("should allow buyer to transition from delivered to dispute", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "delivered",
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "dispute" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe("dispute");
    });

    it("should NOT allow buyer to transition from in_progress to delivered", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "in_progress",
          },
          error: null,
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("변경할 수 없습니다");
      expect(data.current_status).toBe("in_progress");
      expect(data.requested_status).toBe("delivered");
      expect(data.role).toBe("buyer");
    });

    it("should allow seller to transition from in_progress to delivered", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "seller-123" } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "in_progress",
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe("delivered");
    });

    it("should allow seller to transition from revision to in_progress", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "seller-123" } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "revision",
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "in_progress" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe("in_progress");
    });

    it("should NOT allow seller to transition from delivered to completed", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "seller-123" } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "delivered",
          },
          error: null,
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("변경할 수 없습니다");
      expect(data.current_status).toBe("delivered");
      expect(data.requested_status).toBe("completed");
      expect(data.role).toBe("seller");
    });
  });

  /**
   * Timestamp Update Tests
   */
  describe("Timestamp Updates", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "seller-123" } },
        error: null,
      });
    });

    it("should set delivered_at when status is delivered", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "in_progress",
          },
          error: null,
        }),
        update: mockUpdate,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      await PATCH(request, { params });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "delivered",
          delivered_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      );
    });

    it("should set completed_at when status is completed", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "buyer-123" } },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "delivered",
          },
          error: null,
        }),
        update: mockUpdate,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      await PATCH(request, { params });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "completed",
          completed_at: expect.any(String),
          updated_at: expect.any(String),
        }),
      );
    });

    it("should only set updated_at for other status changes", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "revision",
          },
          error: null,
        }),
        update: mockUpdate,
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "in_progress" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      await PATCH(request, { params });

      expect(mockUpdate).toHaveBeenCalledWith({
        status: "in_progress",
        updated_at: expect.any(String),
      });
    });
  });

  /**
   * Update Error Tests
   */
  describe("Update Errors", () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "seller-123" } },
        error: null,
      });
    });

    it("should return 500 when update fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-123",
            buyer_id: "buyer-123",
            seller_id: "seller-123",
            status: "in_progress",
          },
          error: null,
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: "Update failed" },
          }),
        }),
      });

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("주문 상태 업데이트에 실패했습니다");
    });
  });

  /**
   * Error Handling Tests
   */
  describe("Error Handling", () => {
    it("should return 500 when unexpected error occurs", async () => {
      mockSupabase.auth.getUser.mockRejectedValue(
        new Error("Unexpected error"),
      );

      const request = new NextRequest(
        "http://localhost:3000/api/orders/order-123/status",
        {
          method: "PATCH",
          body: JSON.stringify({ status: "delivered" }),
        },
      );

      const params = Promise.resolve({ id: "order-123" });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("서버 오류가 발생했습니다");
    });
  });
});
