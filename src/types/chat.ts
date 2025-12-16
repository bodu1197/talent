export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  service_id: string | null;
  last_message_at: string;
  created_at: string;
  seller_id: string | null;
  is_favorite?: boolean;
  has_active_order?: boolean;
  otherUser?: {
    id: string;
    name: string;
    profile_image: string | null;
    seller_id?: string;
  };
  service?: {
    id: string;
    title: string;
    thumbnail_url: string | null;
  };
  lastMessage?: {
    message: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount?: number;
}
