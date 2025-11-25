'use client';

import { FaStar, FaRegStar } from 'react-icons/fa';
import ProfileImage from '@/components/common/ProfileImage';

interface ChatRoom {
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

interface ChatRoomItemProps {
  readonly room: ChatRoom;
  readonly isSelected?: boolean;
  readonly isMobile?: boolean;
  readonly onSelect: (roomId: string) => void;
  readonly onToggleFavorite: (roomId: string, e: React.MouseEvent) => void;
}

export default function ChatRoomItem({
  room,
  isSelected = false,
  isMobile = false,
  onSelect,
  onToggleFavorite,
}: ChatRoomItemProps) {
  const displayName = room.otherUser?.name || '사용자';
  const hasUnread = (room.unreadCount || 0) > 0;

  const baseClassName =
    'w-full border-b border-gray-100 hover:bg-gray-50 text-left transition-colors';
  const mobileClassName = 'px-4 py-3';
  const desktopClassName = `p-4 ${isSelected ? 'bg-gray-50 border-l-4 border-l-green-500' : ''}`;
  const buttonClassName = isMobile
    ? `${baseClassName} ${mobileClassName}`
    : `${baseClassName} ${desktopClassName}`;

  return (
    <button onClick={() => onSelect(room.id)} className={buttonClassName}>
      <div className="flex items-center gap-3">
        {/* 프로필 이미지 */}
        <ProfileImage
          src={room.otherUser?.profile_image}
          alt={displayName}
          size={48}
          className="flex-shrink-0"
        />

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`font-${isMobile ? 'semibold' : 'medium'} text-sm truncate`}>
                {displayName}
              </h3>
              <button
                onClick={(e) => onToggleFavorite(room.id, e)}
                className="flex-shrink-0 text-lg transition-colors"
                aria-label={room.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                {room.is_favorite ? (
                  <FaStar className="text-yellow-400" aria-hidden="true" />
                ) : (
                  <FaRegStar className="text-gray-400" aria-hidden="true" />
                )}
              </button>
            </div>
            {room.lastMessage && (
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {isMobile
                  ? new Date(room.lastMessage.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : room.last_message_at
                    ? new Date(room.last_message_at).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                      })
                    : ''}
              </span>
            )}
          </div>
          {room.lastMessage && (
            <p className="text-sm text-gray-600 truncate">{room.lastMessage.message}</p>
          )}
        </div>

        {/* 안읽음 배지 */}
        {hasUnread && (
          <div
            className={
              isMobile
                ? 'flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'
                : 'bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0'
            }
          >
            {room.unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
