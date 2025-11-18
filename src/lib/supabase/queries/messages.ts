import { createClient } from "@/lib/supabase/client";

// 사용자의 대화 목록 조회
export async function getUserConversations(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      order:orders(id, order_number, title, service:services(id, title)),
      participant1:profiles!conversations_participant1_id_fkey(user_id, name, profile_image),
      participant2:profiles!conversations_participant2_id_fkey(user_id, name, profile_image),
      messages(
        id,
        content,
        created_at,
        is_read
      )
    `,
    )
    .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) throw error;

  // 상대방 정보와 읽지 않은 메시지 수 계산
  return data.map((conv) => {
    const isParticipant1 = conv.participant1_id === userId;
    const otherUser = isParticipant1 ? conv.participant2 : conv.participant1;
    const unreadCount = isParticipant1
      ? conv.participant1_unread_count
      : conv.participant2_unread_count;

    // 마지막 메시지 시간 포맷
    const lastMessageTime = conv.last_message_at
      ? formatTimeAgo(new Date(conv.last_message_at))
      : "";

    return {
      id: conv.id,
      userId: otherUser.user_id, // profiles.user_id로 수정
      userName: otherUser.name,
      userImage: otherUser.profile_image,
      lastMessage: conv.last_message_preview || "",
      lastMessageTime,
      unreadCount,
      orderNumber: conv.order?.order_number,
      orderTitle: conv.order?.title,
    };
  });
}

// 특정 대화의 메시지 목록 조회
export async function getConversationMessages(
  conversationId: string,
  userId: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(user_id, name, profile_image)
    `,
    )
    .eq("conversation_id", conversationId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data.map((msg) => ({
    id: msg.id,
    sender: msg.sender_id === userId ? "me" : "other",
    content: msg.content,
    time: formatMessageTime(new Date(msg.created_at)),
    isRead: msg.is_read,
    messageType: msg.message_type,
    attachments: msg.attachments,
  }));
}

// 대화 상세 정보 조회
export async function getConversationDetail(conversationId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      order:orders(id, order_number, title, service:services(id, title)),
      participant1:profiles!conversations_participant1_id_fkey(user_id, name, profile_image),
      participant2:profiles!conversations_participant2_id_fkey(user_id, name, profile_image)
    `,
    )
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}

// 메시지 전송
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: "text",
    })
    .select()
    .single();

  if (error) throw error;

  // 대화 업데이트 (마지막 메시지 정보)
  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.substring(0, 100),
    })
    .eq("id", conversationId);

  return data;
}

// 메시지 읽음 처리
export async function markMessagesAsRead(
  conversationId: string,
  userId: string,
) {
  const supabase = createClient();

  // 메시지를 읽음으로 표시
  await supabase
    .from("messages")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .eq("is_read", false);

  // 대화의 읽지 않은 메시지 수 업데이트
  const { data: conversation } = await supabase
    .from("conversations")
    .select("participant1_id, participant2_id")
    .eq("id", conversationId)
    .single();

  if (conversation) {
    const isParticipant1 = conversation.participant1_id === userId;
    const field = isParticipant1
      ? "participant1_unread_count"
      : "participant2_unread_count";

    await supabase
      .from("conversations")
      .update({ [field]: 0 })
      .eq("id", conversationId);
  }
}

// 시간 포맷 헬퍼 함수
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
