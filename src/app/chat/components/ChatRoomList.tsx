'use client';

import { FaComments, FaSpinner, FaSearch } from 'react-icons/fa';
import ChatRoomItem from './ChatRoomItem';

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

type TabType = 'all' | 'unread' | 'deal' | 'favorite';

interface ChatRoomListProps {
  readonly rooms: ChatRoom[];
  readonly selectedRoomId: string | null;
  readonly activeTab: TabType;
  readonly isCreatingRoom?: boolean;
  readonly isMobile?: boolean;
  readonly showSearch?: boolean;
  readonly onSelectRoom: (roomId: string) => void;
  readonly onToggleFavorite: (roomId: string, e: React.MouseEvent) => void;
  readonly onTabChange: (tab: TabType) => void;
  readonly filterRoom: (room: ChatRoom, tab: TabType) => boolean;
}

export default function ChatRoomList({
  rooms,
  selectedRoomId,
  activeTab,
  isCreatingRoom = false,
  isMobile = false,
  showSearch = false,
  onSelectRoom,
  onToggleFavorite,
  onTabChange,
  filterRoom,
}: ChatRoomListProps) {
  const tabs: { id: TabType; label: string; showInMobile: boolean }[] = [
    { id: 'all', label: '전체', showInMobile: true },
    { id: 'unread', label: '안 읽음', showInMobile: true },
    { id: 'deal', label: '거래 중', showInMobile: false },
    { id: 'favorite', label: '즐겨찾기', showInMobile: false },
  ];

  const visibleTabs = tabs.filter((tab) => !isMobile || tab.showInMobile);
  const filteredRooms = rooms.filter((room) => filterRoom(room, activeTab));

  const getTabClassName = (tabId: TabType) => {
    const baseClass =
      'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap';
    const activeClass = isMobile ? 'bg-brand-primary text-white' : 'bg-black text-white';
    const inactiveClass = isMobile
      ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
      : 'bg-white text-gray-700 hover:bg-gray-100';

    return `${baseClass} ${activeTab === tabId ? activeClass : inactiveClass}`;
  };

  return (
    <>
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold mb-4">채팅</h1>

        {/* 탭 */}
        <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto' : ''}`}>
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={getTabClassName(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 (PC 전용) */}
      {showSearch && !isMobile && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              id="chat-search"
              name="chat-search"
              placeholder="검색해 보세요."
              className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* 채팅방 목록 */}
      <div className={isMobile ? 'overflow-y-auto pb-20' : 'flex-1 overflow-y-auto'}>
        {isCreatingRoom ? (
          <div className="p-8 text-center text-gray-500">
            <FaSpinner className="fa-spin text-4xl mb-3 inline-block" />
            <p>채팅방을 생성하는 중...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div
            className={`text-center text-gray-500 ${isMobile ? 'flex flex-col items-center justify-center py-12' : 'p-8'}`}
          >
            <FaComments className={`text-4xl ${isMobile ? 'mb-4' : 'mb-3 inline-block'}`} />
            <p>{isMobile ? '채팅 내역이 없습니다' : '채팅방이 없습니다'}</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.id}
              room={room}
              isSelected={selectedRoomId === room.id}
              isMobile={isMobile}
              onSelect={onSelectRoom}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        )}
      </div>
    </>
  );
}
