'use client'

import { useState, useEffect } from 'react'
import { getAdminUsers, getAdminUsersCount } from '@/lib/supabase/queries/admin'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorState from '@/components/common/ErrorState'
import EmptyState from '@/components/common/EmptyState'

type RoleFilter = 'all' | 'buyer' | 'seller' | 'admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleCounts, setRoleCounts] = useState({
    all: 0,
    buyer: 0,
    seller: 0,
    admin: 0
  })

  useEffect(() => {
    loadUsers()
    loadRoleCounts()
  }, [roleFilter])

  async function loadUsers() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAdminUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        searchQuery
      })
      setUsers(data)
    } catch (err: any) {
      console.error('사용자 조회 실패:', err)
      setError(err.message || '사용자 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  async function loadRoleCounts() {
    try {
      const [allCount, buyerCount, sellerCount, adminCount] = await Promise.all([
        getAdminUsersCount(),
        getAdminUsersCount('buyer'),
        getAdminUsersCount('seller'),
        getAdminUsersCount('admin')
      ])

      setRoleCounts({
        all: allCount,
        buyer: buyerCount,
        seller: sellerCount,
        admin: adminCount
      })
    } catch (err) {
      console.error('역할별 카운트 조회 실패:', err)
    }
  }

  const filteredUsers = users.filter(user => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
    }
    return true
  })

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer': return '구매자'
      case 'seller': return '판매자'
      case 'admin': return '관리자'
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'buyer': return 'bg-blue-100 text-blue-700'
      case 'seller': return 'bg-green-100 text-green-700'
      case 'admin': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const tabs = [
    { value: 'all' as RoleFilter, label: '전체', count: roleCounts.all },
    { value: 'buyer' as RoleFilter, label: '구매자', count: roleCounts.buyer },
    { value: 'seller' as RoleFilter, label: '판매자', count: roleCounts.seller },
    { value: 'admin' as RoleFilter, label: '관리자', count: roleCounts.admin }
  ]

  if (loading) {
    return <LoadingSpinner message="사용자 목록을 불러오는 중..." />
  }

  if (error) {
    return <ErrorState message={error} retry={loadUsers} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
        <p className="text-gray-600 mt-1">전체 회원을 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                roleFilter === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  roleFilter === tab.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름 또는 이메일로 검색"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <i className="fas fa-redo-alt mr-2"></i>
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-bold text-gray-900">{filteredUsers.length}</span>명의 사용자
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    역할
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profile_image ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.profile_image}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold">
                              {user.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-brand-primary hover:text-brand-light mr-3">
                        상세보기
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon="fa-users"
              title="사용자가 없습니다"
              description="검색 조건에 맞는 사용자가 없습니다"
            />
          </div>
        )}
      </div>
    </div>
  )
}
