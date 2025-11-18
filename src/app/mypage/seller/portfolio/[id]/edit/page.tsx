import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortfolioEditClient from './PortfolioEditClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PortfolioEditPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: seller } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    redirect('/mypage/seller/register')
  }

  const { id } = await params

  // 포트폴리오 조회
  const { data: portfolio } = await supabase
    .from('seller_portfolio')
    .select('*')
    .eq('id', id)
    .single()

  if (!portfolio) {
    notFound()
  }

  // 본인 소유 확인
  if (portfolio.seller_id !== seller.id) {
    redirect('/mypage/seller/portfolio')
  }

  // 카테고리 목록 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id')
    .order('display_order', { ascending: true })

  // 판매자의 서비스 목록 가져오기
  const { data: services } = await supabase
    .from('services')
    .select('id, title, status')
    .eq('seller_id', seller.id)
    .in('status', ['active', 'pending'])
    .order('created_at', { ascending: false })

  // 이 포트폴리오에 연결된 서비스 ID 목록 가져오기
  const { data: linkedServices } = await supabase
    .from('portfolio_services')
    .select('service_id')
    .eq('portfolio_id', id)

  const linkedServiceIds = linkedServices?.map(ls => ls.service_id) || []

  return (
    <PortfolioEditClient
      portfolio={portfolio}
      sellerId={seller.id}
      categories={categories || []}
      services={services || []}
      linkedServiceIds={linkedServiceIds}
    />
  )
}
