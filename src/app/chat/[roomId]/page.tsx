import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import dynamic from "next/dynamic";

const DirectChatClient = dynamic(() => import("./DirectChatClient"), {
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">Loading chat...</div>
    </div>
  ),
});

interface ChatPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function DirectChatPage({ params }: ChatPageProps) {
  const { roomId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 채팅방 정보 조회
  const { data: room, error } = await supabase
    .from("chat_rooms")
    .select(
      `
      id,
      user1_id,
      user2_id,
      service_id
    `,
    )
    .eq("id", roomId)
    .single();

  if (error || !room) {
    redirect("/chat");
  }

  // 사용자가 이 채팅방의 참여자인지 확인
  if (room.user1_id !== user.id && room.user2_id !== user.id) {
    redirect("/chat");
  }

  // 상대방 ID 확인
  const otherUserId = room.user1_id === user.id ? room.user2_id : room.user1_id;

  // 현재 사용자가 판매자인지 확인
  const { data: currentUserSeller } = await supabase
    .from("sellers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const isSeller = !!currentUserSeller;

  // 상대방이 판매자인지 확인 (seller_profiles 뷰 사용)
  const { data: otherUserSeller } = await supabase
    .from("seller_profiles")
    .select("id, business_name, display_name, profile_image")
    .eq("user_id", otherUserId)
    .maybeSingle();

  // 상대방 정보 조회
  let otherUser: { id: string; name: string; profile_image: string | null };

  if (otherUserSeller) {
    // 상대방이 판매자인 경우
    otherUser = {
      id: otherUserId,
      name:
        otherUserSeller.display_name ||
        otherUserSeller.business_name ||
        "판매자",
      profile_image: otherUserSeller.profile_image || null,
    };
  } else {
    // 상대방이 일반 사용자인 경우 (profiles 테이블 사용)
    const { data: otherUserData } = await supabase
      .from("profiles")
      .select("user_id, name, profile_image")
      .eq("user_id", otherUserId)
      .single();

    otherUser = {
      id: otherUserId,
      name: otherUserData?.name || "사용자",
      profile_image: otherUserData?.profile_image || null,
    };
  }

  // 서비스 정보 조회
  let service = null;
  if (room.service_id) {
    const { data: serviceData } = await supabase
      .from("services")
      .select("id, title, thumbnail_url")
      .eq("id", room.service_id)
      .single();

    service = serviceData;
  }

  return (
    <DirectChatClient
      roomId={roomId}
      userId={user.id}
      isSeller={isSeller}
      otherUser={otherUser}
      service={service}
    />
  );
}
