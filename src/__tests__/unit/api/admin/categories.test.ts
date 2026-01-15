import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PATCH, DELETE } from '@/app/api/admin/categories/route';
import type { User } from '@supabase/supabase-js';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('@/lib/admin/auth', () => ({
  checkAdminAuth: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { checkAdminAuth } from '@/lib/admin/auth';
const mockCheckAdminAuth = vi.mocked(checkAdminAuth);

describe('Admin Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/categories', () => {
    it('should return 401 if not admin', async () => {
      mockCheckAdminAuth.mockResolvedValue({ isAdmin: false, user: null, error: 'Unauthorized' });

      const request = new NextRequest('http://localhost:3000/api/admin/categories');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if not admin (forbidden)', async () => {
      mockCheckAdminAuth.mockResolvedValue({ isAdmin: false, user: null, error: 'Forbidden' });

      const request = new NextRequest('http://localhost:3000/api/admin/categories');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should return categories list', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', slug: 'category-1', is_active: true },
        { id: 'cat-2', name: 'Category 2', slug: 'category-2', is_active: true },
      ];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest('http://localhost:3000/api/admin/categories');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.categories).toHaveLength(2);
    });

    it('should include inactive categories when requested', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const mockCategories = [{ id: 'cat-1', name: 'Category 1', is_active: false }];

      const queryChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      mockSupabase.from.mockReturnValue(queryChain);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/categories?includeInactive=true'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.categories).toHaveLength(1);
    });
  });

  describe('POST /api/admin/categories', () => {
    it('should return 400 if name is missing', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ slug: 'test-slug' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and slug are required');
    });

    it('should return 409 if slug already exists', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'existing-id' } }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', slug: 'existing-slug' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Slug already exists');
    });

    it('should create category successfully', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const mockCategory = { id: 'new-cat', name: 'New Category', slug: 'new-category' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Slug check
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null }),
          };
        } else {
          // Insert
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Category', slug: 'new-category' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.category.name).toBe('New Category');
    });
  });

  describe('PATCH /api/admin/categories', () => {
    it('should return 400 if id is missing', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Category ID is required');
    });

    it('should return 409 if new slug already exists', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: 'other-id' } }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'cat-1', slug: 'existing-slug' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Slug already exists');
    });

    it('should update category successfully', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const mockCategory = { id: 'cat-1', name: 'Updated Name', slug: 'cat-1' };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Slug check (no conflict)
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null }),
          };
        } else {
          // Update
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockCategory, error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories', {
        method: 'PATCH',
        body: JSON.stringify({ id: 'cat-1', name: 'Updated Name', slug: 'new-slug' }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.category.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/admin/categories', () => {
    it('should return 400 if id is missing', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories');

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Category ID is required');
    });

    it('should return 400 if category has subcategories', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'child-cat' }] }),
      };

      mockSupabase.from.mockReturnValue(selectChain);

      const request = new NextRequest('http://localhost:3000/api/admin/categories?id=cat-1');

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete category with subcategories');
    });

    it('should return 400 if category has associated services', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Check subcategories
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
          };
        } else {
          // Check services
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [{ id: 'service-1' }] }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories?id=cat-1');

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete category with associated services');
    });

    it('should delete category successfully', async () => {
      mockCheckAdminAuth.mockResolvedValue({
        isAdmin: true,
        user: { id: 'admin-1' } as unknown as User,
        admin: {},
        error: null,
      });

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1 || callCount === 2) {
          // Check subcategories and services - both return empty arrays
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
          };
        } else {
          // Delete
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/categories?id=cat-1');

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
