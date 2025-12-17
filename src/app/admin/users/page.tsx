'use client';

import { useState, useEffect } from 'react';
import {
  getAdminUsers,
  getAdminUsersCount,
  type AdminUserProfile,
} from '@/lib/supabase/queries/admin';
import { logger } from '@/lib/logger';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import AdminDataView from '@/components/admin/AdminDataView';
import { toast } from 'react-hot-toast';

type RoleFilter = 'all' | 'buyer' | 'seller' | 'admin';
type SortField = 'role' | 'created_at' | null;
type SortOrder = 'asc' | 'desc';

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

  // 정렬 상태
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 삭제 상태
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUserProfile | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoleCounts();
  }, [roleFilter]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmUser) {
          setDeleteConfirmUser(null);
        } else if (selectedUser) {
          setSelectedUser(null);
        }
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedUser, deleteConfirmUser]);

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

  // 사용자 삭제
  async function handleDeleteUser(user: AdminUserProfile) {
    setDeletingUserId(user.id);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '삭제에 실패했습니다.');
      }

      toast.success(`${user.name} 회원이 삭제되었습니다.`);
      setDeleteConfirmUser(null);

      // 목록 새로고침
      await loadUsers();
      await loadRoleCounts();
    } catch (err) {
      logger.error('사용자 삭제 실패:', err);
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    } finally {
      setDeletingUserId(null);
    }
  }

  // 정렬 토글
  function toggleSort(field: SortField) {
    if (sortField === field) {
      // 같은 필드 클릭 시 순서 토글
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 필드 클릭 시 해당 필드로 오름차순 정렬
      setSortField(field);
      setSortOrder('asc');
    }
  }

  // 역할 순서 (정렬용)
  const roleOrder: Record<string, number> = {
    admin: 1,
    seller: 2,
    buyer: 3,
  };

  // 필터링 및 정렬
  const filteredAndSortedUsers = users
    .filter((user) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === 'role') {
        const orderA = roleOrder[a.role] || 99;
        const orderB = roleOrder[b.role] || 99;
        return sortOrder === 'asc' ? orderA - orderB : orderB - orderA;
      }

      if (sortField === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'buyer':
        return '구매자';
      case 'seller':
        return '전문가';
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

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-300" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-brand-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-brand-primary" />
    );
  };

  const tabs = [
    { value: 'all' as RoleFilter, label: '전체', count: roleCounts.all },
    { value: 'buyer' as RoleFilter, label: '구매자', count: roleCounts.buyer },
    {
      value: 'seller' as RoleFilter,
      label: '전문가',
      count: roleCounts.seller,
    },
    { value: 'admin' as RoleFilter, label: '관리자', count: roleCounts.admin },
  ];

  return (
    <AdminDataView
      title="사용자 관리"
      description="전체 회원을 관리하세요"
      tabs={tabs}
      activeTab={roleFilter}
      onTabChange={setRoleFilter}
      searchQuery={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        if (value === '') setSortField(null);
      }}
      searchPlaceholder="이름 또는 이메일로 검색"
      isLoading={loading}
      error={error}
      onRetry={loadUsers}
      filteredCount={filteredAndSortedUsers.length}
      isEmpty={filteredAndSortedUsers.length === 0}
      emptyStateProps={{
        icon: 'fa-users',
        title: '사용자가 없습니다',
        description: '검색 조건에 맞는 사용자가 없습니다',
      }}
    >
      <>
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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => toggleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    역할
                    {renderSortIcon('role')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => toggleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    가입일
                    {renderSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedUsers.map((user) => (
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
                    {new Date(user.created_at).toLocaleDateString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                    })}
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
                      onClick={() => setDeleteConfirmUser(user)}
                      disabled={deletingUserId === user.id}
                      className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                      aria-label={`${user.name} 삭제`}
                    >
                      {deletingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline" />
                      ) : (
                        '삭제'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 삭제 확인 모달 */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black bg-opacity-50 cursor-default"
              onClick={() => setDeleteConfirmUser(null)}
              aria-label="모달 닫기"
            />
            <dialog
              open
              className="relative bg-white rounded-lg max-w-md w-full p-6"
              aria-labelledby="delete-confirm-title"
            >
              <h2 id="delete-confirm-title" className="text-xl font-semibold text-gray-900 mb-4">
                회원 삭제 확인
              </h2>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  <strong className="text-gray-900">{deleteConfirmUser.name}</strong> 회원을
                  삭제하시겠습니까?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  <p className="font-semibold mb-2">경고: 이 작업은 되돌릴 수 없습니다!</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>회원 계정 정보</li>
                    <li>주문 내역 (구매/판매)</li>
                    <li>등록한 서비스</li>
                    <li>작성한 리뷰</li>
                    <li>채팅 메시지</li>
                    <li>모든 관련 데이터</li>
                  </ul>
                  <p className="mt-2">위 데이터가 모두 영구 삭제됩니다.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirmUser)}
                  disabled={deletingUserId === deleteConfirmUser.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingUserId === deleteConfirmUser.id && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  삭제하기
                </button>
              </div>
            </dialog>
          </div>
        )}

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
                  aria-label="닫기"
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
                      {new Date(selectedUser.created_at).toLocaleString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setDeleteConfirmUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  회원 삭제
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  닫기
                </button>
              </div>
            </dialog>
          </div>
        )}
      </>
    </AdminDataView>
  );
}
