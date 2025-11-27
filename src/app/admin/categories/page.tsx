'use client';

import { useState, useEffect } from 'react';
import type { Category } from '@/types/common';
import { Plus, Folder, Edit, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface CategoryFormData {
  name: string;
  slug: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    parent_id: null,
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      logger.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parent_id: null,
      display_order: 0,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        const response = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCategory.id, ...formData }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to update category');
          return;
        }
      } else {
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to create category');
          return;
        }
      }

      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      logger.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
        return;
      }

      fetchCategories();
    } catch (error) {
      logger.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const getParentCategories = () => {
    return categories.filter((cat) => cat.parent_id === null);
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parent_id === parentId);
  };

  const parentCategories = getParentCategories();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">카테고리 관리</h1>
          <p className="text-slate-600">서비스 카테고리를 추가, 수정, 삭제할 수 있습니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />새 카테고리
        </button>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {parentCategories.map((parent) => {
            const children = getChildCategories(parent.id);
            return (
              <div
                key={parent.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white p-2 border border-slate-200">
                        <Folder className="text-[#0f3460] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{parent.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">/{parent.slug}</p>
                      </div>
                      {!parent.is_active && (
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                          비활성
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(parent)}
                        className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        <Edit className="text-slate-700 w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(parent)}
                        className="px-3 py-2 border border-slate-200 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {children.length > 0 && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-slate-50 p-2">
                              <FolderOpen className="text-slate-600 w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{child.name}</p>
                              <p className="text-sm text-slate-600">/{child.slug}</p>
                            </div>
                            {!child.is_active && (
                              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                                비활성
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(child)}
                              className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <Edit className="text-slate-700 w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="px-3 py-2 border border-slate-200 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {parentCategories.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Folder className="text-slate-400 w-12 h-12 mb-4 mx-auto" />
              <p className="text-slate-600">등록된 카테고리가 없습니다.</p>
              <p className="text-sm text-slate-500 mt-2">
                새 카테고리 버튼을 눌러 카테고리를 추가하세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {editingCategory
                    ? '카테고리 정보를 수정합니다.'
                    : '새로운 카테고리를 추가합니다.'}
                </p>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    카테고리 이름 *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: IT·프로그래밍"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
                    URL 슬러그 *
                  </label>
                  <input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="예: it-programming"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                  <p className="text-xs text-slate-500 mt-1">영문, 숫자, 하이픈(-)만 사용 가능</p>
                </div>

                <div>
                  <label htmlFor="parent" className="block text-sm font-medium text-slate-700 mb-1">
                    상위 카테고리
                  </label>
                  <select
                    id="parent"
                    value={formData.parent_id || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parent_id: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  >
                    <option value="">없음 (최상위 카테고리)</option>
                    {parentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="display_order"
                    className="block text-sm font-medium text-slate-700 mb-1"
                  >
                    표시 순서
                  </label>
                  <input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  />
                  <p className="text-xs text-slate-500 mt-1">숫자가 작을수록 먼저 표시됩니다</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <label
                      htmlFor="is_active"
                      className="block text-sm font-medium text-slate-700 cursor-pointer"
                    >
                      카테고리 활성화
                    </label>
                    <p className="text-xs text-slate-500">비활성 시 사용자에게 표시되지 않습니다</p>
                  </div>
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-[#0f3460] focus:ring-[#0f3460] border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f3460] hover:bg-[#0f3460]/90 text-white rounded-md transition-colors"
                >
                  {editingCategory ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
