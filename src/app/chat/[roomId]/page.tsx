import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DirectChatClient from './DirectChatClient'

interface ChatPageProps {
  params: Promise<{
    roomId: string
  }>
}

export default async function DirectChatPage({ params }: ChatPageProps) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // 채팅방 정보 조회
  const { data: room, error } = await supabase
    .from('chat_rooms')
    .select(`
      id,
      buyer_id,
      seller_id,
      service_id
    `)
    .eq('id', roomId)
    .single()

  if (error || !room) {
    redirect('/mypage/messages')
  }

  // 사용자가 이 채팅방의 참여자인지 확인
  const { data: sellerData } = await supabase
    .from('sellers')
    .select('user_id')
    .eq('id', room.seller_id)
    .single()

  const isBuyer = room.buyer_id === user.id
  const isSeller = sellerData?.user_id === user.id

  if (!isBuyer && !isSeller) {
    redirect('/mypage/messages')
  }

  // 상대방 정보 조회
  let otherUser: { id: string; name: string; profile_image: string | null }

  if (isBuyer) {
    // 구매자인 경우 판매자 정보 가져오기
    const { data: seller } = await supabase
      .from('sellers')
      .select('id, business_name, display_name, profile_image')
      .eq('id', room.seller_id)
      .single()

    otherUser = {
      id: room.seller_id,
      name: seller?.display_name || seller?.business_name || '판매자',
      profile_image: seller?.profile_image || null
    }
  } else {
    // 판매자인 경우 구매자 정보 가져오기
    const { data: buyer } = await supabase
      .from('users')
      .select('id, name, profile_image')
      .eq('id', room.buyer_id)
      .single()

    otherUser = {
      id: room.buyer_id,
      name: buyer?.name || '구매자',
      profile_image: buyer?.profile_image || null
    }
  }

  // 서비스 정보 조회
  let service = null
  if (room.service_id) {
    const { data: serviceData } = await supabase
      .from('services')
      .select('id, title, thumbnail_url')
      .eq('id', room.service_id)
      .single()

    service = serviceData
  }

  return (
    <DirectChatClient
      roomId={roomId}
      userId={user.id}
      otherUser={otherUser}
      service={service}
    />
  )
}
