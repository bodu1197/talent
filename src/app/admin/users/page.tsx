'use client';

import { useState, useEffect } from 'react';
import {
  getAdminUsers,
  getAdminUsersCount,
  type AdminUserProfile,
} from '@/lib/supabase/queries/admin';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { logger } from '@/lib/logger';
import { RefreshCw } from 'lucide-react';

type RoleFilter = 'all' | 'buyer' | 'seller' | 'admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserProfile | null>(null);
  const [roleCounts, setRoleCounts] = useState({
    all: 0,
    buyer: 0,
    seller: 0,
    admin: 0,
  });

  useEffect(() => {
    loadUsers();
    loadRoleCounts();
  }, [roleFilter]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedUser) {
        setSelectedUser(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedUser]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers({
        role: roleFilter === 'all' ? undefined : roleFilter,
        searchQuery,
      });
      setUsers(data);
    } catch (err: unknown) {
      logger.error('사용자 조회 실패:', err);
      setError(err instanceof Error ? err.message : '사용자 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  async function loadRoleCounts() {
    try {
      const [allCount, buyerCount, sellerCount, adminCount] = await Promise.all([
        getAdminUsersCount(),
        getAdminUsersCount('buyer'),
        getAdminUsersCount('seller'),
        getAdminUsersCount('admin'),
      ]);

      setRoleCounts({
        all: allCount,
        buyer: buyerCount,
        seller: sellerCount,
        admin: adminCount,
      });
    } catch (err) {
      logger.error('역할별 카운트 조회 실패:', err);
    }
  }

  const filteredUsers = users.filter((user) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query);
    }
    return true;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer':
        return '구매자';
      case 'seller':
        return '판매자';
      case 'admin':
        return '관리자';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'bg-blue-100 text-blue-700';
      case 'seller':
        return 'bg-green-100 text-green-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { value: 'all' as RoleFilter, label: '전체', count: roleCounts.all },
    { value: 'buyer' as RoleFilter, label: '구매자', count: roleCounts.buyer },
    {
      value: 'seller' as RoleFilter,
      label: '판매자',
      count: roleCounts.seller,
    },
    { value: 'admin' as RoleFilter, label: '관리자', count: roleCounts.admin },
  ];

  if (loading) {
    return <LoadingSpinner message="사용자 목록을 불러오는 중..." />;
  }

  if (error) {
    return <ErrorState message={error} retry={loadUsers} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">사용자 관리</h1>
        <p className="text-gray-600 mt-1">전체 회원을 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              role="tab"
              aria-selected={roleFilter === tab.value}
              aria-label={`${tab.label} (${tab.count}개)`}
              tabIndex={roleFilter === tab.value ? 0 : -1}
              className={`flex-shrink-0 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                roleFilter === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    roleFilter === tab.value
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
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
            <label htmlFor="user-search" className="sr-only">
              사용자 검색
            </label>
            <input
              id="user-search"
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
            <RefreshCw className="w-4 h-4 inline mr-2" />
            초기화
          </button>
        </div>
      </div>

      {/* 결과 카운트 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-gray-900">{filteredUsers.length}</span> 명의 사용자
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
                            <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
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
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-brand-primary hover:text-brand-light mr-3 transition-colors"
                        aria-label={`${user.name} 상세보기`}
                      >
                        상세보기
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        aria-label={`${user.name} 삭제`}
                      >
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

      {/* 사용자 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
            onClick={() => setSelectedUser(null)}
            aria-label="모달 닫기"
          />
          <dialog
            open
            className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            aria-labelledby="user-detail-title"
          >
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 id="user-detail-title" className="text-xl font-semibold text-gray-900">
                사용자 상세 정보
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="px-6 py-4 space-y-6">
              {/* 프로필 섹션 */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedUser.profile_image ? (
                    <img
                      className="h-20 w-20 rounded-full"
                      src={selectedUser.profile_image}
                      alt={selectedUser.name}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-2xl">
                      {selectedUser.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">{selectedUser.name}</h3>
                  <span
                    className={`inline-block mt-1 px-3 py-1 text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}
                  >
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">사용자 ID</p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {selectedUser.id}
                  </p>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">이메일</p>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">역할</p>
                  <p className="text-sm text-gray-900">{getRoleLabel(selectedUser.role)}</p>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">상태</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedUser.status === 'active' ? '활성' : '비활성'}
                  </span>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">가입일</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                닫기
              </button>
              <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium">
                수정
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
