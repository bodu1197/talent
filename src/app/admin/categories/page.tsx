'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'

export default function AdminCategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          icon,
          is_active,
          created_at
        `)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  function openEditModal(category: any | null = null) {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon || '',
        is_active: category.is_active,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
        is_active: true,
      })
    }
    setShowEditModal(true)
  }

  async function handleSave() {
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id)

        if (error) throw error
        alert('카테고리가 수정되었습니다.')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([formData])

        if (error) throw error
        alert('카테고리가 생성되었습니다.')
      }

      setShowEditModal(false)
      fetchCategories()
    } catch (error: any) {
      console.error('Save error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  async function handleDelete() {
    if (!editingCategory) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', editingCategory.id)

      if (error) throw error

      alert('카테고리가 삭제되었습니다.')
      setShowDeleteModal(false)
      fetchCategories()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const columns = [
    {
      key: 'icon',
      label: '아이콘',
      render: (category: any) => (
        category.icon ? (
          <i className={`${category.icon} text-2xl text-[#0f3460]`}></i>
        ) : (
          <i className="fas fa-folder text-2xl text-gray-400"></i>
        )
      ),
      width: 'w-20',
    },
    {
      key: 'name',
      label: '카테고리명',
      render: (category: any) => (
        <div>
          <div className="font-medium text-gray-900">{category.name}</div>
          <div className="text-xs text-gray-500">{category.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: '설명',
      render: (category: any) => (
        <span className="text-gray-600 text-sm">{category.description || '-'}</span>
      ),
    },
    {
      key: 'is_active',
      label: '상태',
      render: (category: any) => (
        <Badge variant={category.is_active ? 'success' : 'gray'} size="sm">
          {category.is_active ? '활성' : '비활성'}
        </Badge>
      ),
      width: 'w-24',
    },
    {
      key: 'created_at',
      label: '생성일',
      render: (category: any) => (
        <span className="text-gray-600 text-sm">
          {new Date(category.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (category: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEditModal(category)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="수정"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditingCategory(category)
              setShowDeleteModal(true)
            }}
            className="text-red-600 hover:text-red-800"
            title="삭제"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      ),
      width: 'w-24',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
          <p className="text-gray-600 mt-1">전체 {categories.length}개의 카테고리</p>
        </div>
        <button
          onClick={() => openEditModal(null)}
          className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#0f3460]/90 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          카테고리 추가
        </button>
      </div>

      {/* Categories Table */}
      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        emptyMessage="카테고리가 없습니다"
      />

      {/* Edit/Create Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={editingCategory ? '카테고리 수정' : '카테고리 추가'}
          footer={
            <>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#0f3460] text-white rounded-lg hover:bg-[#0f3460]/90 transition-colors"
              >
                저장
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (!editingCategory) {
                    setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                슬러그 (URL 경로) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                placeholder="예: web-development"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                영문, 숫자, 하이픈만 사용 가능
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                rows={3}
                placeholder="카테고리에 대한 간단한 설명..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘 (Font Awesome 클래스)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                  placeholder="예: fas fa-code"
                />
                {formData.icon && (
                  <div className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded-lg">
                    <i className={`${formData.icon} text-xl text-[#0f3460]`}></i>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Font Awesome 아이콘 클래스 (예: fas fa-code, fas fa-paint-brush)
              </p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">활성 상태</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                비활성 카테고리는 사용자에게 표시되지 않습니다
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && editingCategory && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="카테고리 삭제"
          footer={
            <>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-600 mt-1 mr-3"></i>
                <div>
                  <p className="font-medium text-red-800">경고</p>
                  <p className="text-sm text-red-700 mt-1">
                    이 카테고리를 삭제하면 복구할 수 없습니다.
                    <br />
                    이 카테고리에 속한 서비스들은 카테고리 없음 상태가 됩니다.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-700">
              <strong>{editingCategory.name}</strong> 카테고리를 삭제하시겠습니까?
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
