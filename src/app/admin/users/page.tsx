'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import DataTable from '@/components/admin/common/DataTable'
import Badge from '@/components/admin/common/Badge'
import Modal from '@/components/admin/common/Modal'
import type { UserDetail, AdminUserFilter } from '@/types/admin'

export default function AdminUsersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'warn' | 'suspend' | 'unsuspend' | 'delete' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [actionDuration, setActionDuration] = useState(7)

  const [filter, setFilter] = useState<AdminUserFilter>({
    userType: 'all',
    status: 'all',
    isVerified: 'all',
    searchKeyword: '',
    dateRange: { from: null, to: null },
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchUsers()
  }, [filter])

  async function fetchUsers() {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          name,
          phone,
          user_type,
          is_active,
          email_verified,
          created_at,
          last_login_at
        `)

      // Apply filters
      if (filter.userType !== 'all') {
        query = query.eq('user_type', filter.userType)
      }

      if (filter.status === 'active') {
        query = query.eq('is_active', true)
      } else if (filter.status === 'suspended') {
        query = query.eq('is_active', false)
      }

      if (filter.searchKeyword) {
        query = query.or(`name.ilike.%${filter.searchKeyword}%,email.ilike.%${filter.searchKeyword}%`)
      }

      // Apply sorting
      if (filter.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (filter.sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true })
      }

      const { data, error } = await query.limit(50)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAction() {
    if (!selectedUser || !actionType) return

    try {
      if (actionType === 'suspend') {
        const { error } = await supabase
          .from('users')
          .update({ is_active: false })
          .eq('id', selectedUser.id)

        if (error) throw error

        // TODO: Create activity log
        alert(`${selectedUser.name} 사용자가 ${actionDuration}일간 정지되었습니다.`)
      } else if (actionType === 'unsuspend') {
        const { error } = await supabase
          .from('users')
          .update({ is_active: true })
          .eq('id', selectedUser.id)

        if (error) throw error

        alert(`${selectedUser.name} 사용자의 정지가 해제되었습니다.`)
      } else if (actionType === 'warn') {
        // TODO: Send warning notification
        alert(`${selectedUser.name} 사용자에게 경고를 발송했습니다.`)
      } else if (actionType === 'delete') {
        const { error } = await supabase
          .from('users')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', selectedUser.id)

        if (error) throw error

        alert(`${selectedUser.name} 사용자가 삭제되었습니다.`)
      }

      setShowActionModal(false)
      setActionType(null)
      setActionReason('')
      fetchUsers()
    } catch (error: any) {
      console.error('Action error:', error)
      alert('오류가 발생했습니다: ' + error.message)
    }
  }

  function openActionModal(user: any, type: typeof actionType) {
    setSelectedUser(user)
    setActionType(type)
    setShowActionModal(true)
  }

  const columns = [
    {
      key: 'email',
      label: '이메일',
      render: (user: any) => (
        <div>
          <div className="font-medium text-gray-900">{user.email}</div>
          <div className="text-xs text-gray-500">{user.name}</div>
        </div>
      ),
    },
    {
      key: 'user_type',
      label: '유형',
      render: (user: any) => {
        const types = {
          buyer: { text: '구매자', variant: 'info' as const },
          seller: { text: '판매자', variant: 'success' as const },
          both: { text: '둘다', variant: 'warning' as const },
        }
        const type = types[user.user_type as keyof typeof types] || { text: user.user_type, variant: 'gray' as const }
        return <Badge variant={type.variant}>{type.text}</Badge>
      },
    },
    {
      key: 'is_active',
      label: '상태',
      render: (user: any) => (
        <Badge variant={user.is_active ? 'success' : 'error'}>
          {user.is_active ? '활성' : '정지'}
        </Badge>
      ),
    },
    {
      key: 'email_verified',
      label: '인증',
      render: (user: any) => (
        user.email_verified ? (
          <i className="fas fa-check-circle text-green-500"></i>
        ) : (
          <i className="fas fa-times-circle text-gray-400"></i>
        )
      ),
      width: 'w-20',
    },
    {
      key: 'created_at',
      label: '가입일',
      render: (user: any) => (
        <span className="text-gray-600">
          {new Date(user.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedUser(user)
              setShowDetailModal(true)
            }}
            className="text-blue-600 hover:text-blue-800"
            title="상세보기"
          >
            <i className="fas fa-eye"></i>
          </button>
          {user.is_active ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(user, 'suspend')
              }}
              className="text-red-600 hover:text-red-800"
              title="정지"
            >
              <i className="fas fa-ban"></i>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                openActionModal(user, 'unsuspend')
              }}
              className="text-green-600 hover:text-green-800"
              title="정지해제"
            >
              <i className="fas fa-check-circle"></i>
            </button>
          )}
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
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-gray-600 mt-1">전체 {users.length}명의 사용자</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* User Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용자 유형
            </label>
            <select
              value={filter.userType}
              onChange={(e) => setFilter({ ...filter, userType: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="buyer">구매자</option>
              <option value="seller">판매자</option>
              <option value="both">둘다</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as any })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            >
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <input
              type="text"
              value={filter.searchKeyword}
              onChange={(e) => setFilter({ ...filter, searchKeyword: e.target.value })}
              placeholder="이름, 이메일 검색"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="사용자가 없습니다"
      />

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="사용자 상세 정보"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">이름</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">이메일</label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">전화번호</label>
                <p className="text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">사용자 유형</label>
                <p className="text-gray-900">{selectedUser.user_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">가입일</label>
                <p className="text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">마지막 로그인</label>
                <p className="text-gray-900">
                  {selectedUser.last_login_at
                    ? new Date(selectedUser.last_login_at).toLocaleString('ko-KR')
                    : '-'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold mb-3">관리 액션</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => openActionModal(selectedUser, 'warn')}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  경고
                </button>
                {selectedUser.is_active ? (
                  <button
                    onClick={() => openActionModal(selectedUser, 'suspend')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <i className="fas fa-ban mr-2"></i>
                    정지
                  </button>
                ) : (
                  <button
                    onClick={() => openActionModal(selectedUser, 'unsuspend')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <i className="fas fa-check-circle mr-2"></i>
                    정지 해제
                  </button>
                )}
                <button
                  onClick={() => openActionModal(selectedUser, 'delete')}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  삭제
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && actionType && (
        <Modal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false)
            setActionType(null)
            setActionReason('')
          }}
          title={`사용자 ${actionType === 'suspend' ? '정지' : actionType === 'unsuspend' ? '정지 해제' : actionType === 'warn' ? '경고' : '삭제'}`}
          footer={
            <>
              <button
                onClick={() => {
                  setShowActionModal(false)
                  setActionType(null)
                  setActionReason('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                확인
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>{selectedUser?.name}</strong> 님을{' '}
              {actionType === 'suspend' ? '정지' : actionType === 'unsuspend' ? '정지 해제' : actionType === 'warn' ? '경고' : '삭제'}
              하시겠습니까?
            </p>

            {actionType === 'suspend' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정지 기간
                </label>
                <select
                  value={actionDuration}
                  onChange={(e) => setActionDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                >
                  <option value={1}>1일</option>
                  <option value={3}>3일</option>
                  <option value={7}>7일</option>
                  <option value={30}>30일</option>
                  <option value={-1}>영구</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="조치 사유를 입력하세요..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f3460]"
                rows={4}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
