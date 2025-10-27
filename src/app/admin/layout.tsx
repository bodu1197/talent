'use client'

import { useAdmin } from '@/hooks/useAdmin'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminHeader from '@/components/admin/layout/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3460]"></div>
          <p className="mt-4 text-gray-600">관리자 권한 확인 중...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // useAdmin hook will redirect
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
