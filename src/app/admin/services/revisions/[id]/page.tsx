import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServiceRevisionDetail } from '@/lib/supabase/queries/admin'
import RevisionDetailClient from './RevisionDetailClient'

export default async function RevisionDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 관리자 확인
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) {
    redirect('/')
  }

  try {
    const revision = await getServiceRevisionDetail(id, supabase)
    return <RevisionDetailClient revision={revision} />
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '수정 요청을 불러올 수 없습니다'
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">오류가 발생했습니다</h2>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      </div>
    )
  }
}
