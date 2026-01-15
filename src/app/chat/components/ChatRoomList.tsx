'use client';

import { MessageCircle, Loader2, Search } from 'lucide-react';
import ChatRoomItem from './ChatRoomItem';
import type { ChatRoom } from '@/types/chat';

type TabType = 'all' | 'unread' | 'deal' | 'favorite';

/**
 * 채팅방 목록 컨텐츠 컴포넌트 - 중첩 삼항 연산자 제거
 */
function ChatRoomContent({
  isCreatingRoom,
  rooms,
  filteredRooms,
  selectedRoomId,
  isMobile,
  onSelectRoom,
  onToggleFavorite,
}: {
  readonly isCreatingRoom: boolean;
  readonly rooms: ChatRoom[];
  readonly filteredRooms: ChatRoom[];
  readonly selectedRoomId: string | null;
  readonly isMobile: boolean;
  readonly onSelectRoom: (roomId: string) => void;
  readonly onToggleFavorite: (roomId: string, e: React.MouseEvent) => void;
}) {
  if (isCreatingRoom) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Loader2 className="w-10 h-10 mb-3 inline-block animate-spin" />
        <p>채팅방을 생성하는 중...</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div
        className={`text-center text-gray-500 ${isMobile ? 'flex flex-col items-center justify-center py-12' : 'p-8'}`}
      >
        <MessageCircle className={`w-10 h-10 ${isMobile ? 'mb-4' : 'mb-3 inline-block'}`} />
        <p>{isMobile ? '채팅 내역이 없습니다' : '채팅방이 없습니다'}</p>
      </div>
    );
  }

  return (
    <>
      {filteredRooms.map((room) => (
        <ChatRoomItem
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id}
          isMobile={isMobile}
          onSelect={onSelectRoom}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </>
  );
}

interface ChatRoomListProps {
  readonly rooms: ChatRoom[];
  readonly selectedRoomId: string | null;
  readonly activeTab: TabType;
  readonly searchQuery: string;
  readonly searchMatchingRoomIds?: string[];
  readonly isSearching?: boolean;
  readonly isCreatingRoom?: boolean;
  readonly isMobile?: boolean;
  readonly onSelectRoom: (roomId: string) => void;
  readonly onToggleFavorite: (roomId: string, e: React.MouseEvent) => void;
  readonly onTabChange: (tab: TabType) => void;
  readonly onSearchChange: (query: string) => void;
  readonly filterRoom: (room: ChatRoom, tab: TabType) => boolean;
}

export default function ChatRoomList({
  rooms,
  selectedRoomId,
  activeTab,
  searchQuery,
  searchMatchingRoomIds = [],
  isSearching = false,
  isCreatingRoom = false,
  isMobile = false,
  onSelectRoom,
  onToggleFavorite,
  onTabChange,
  onSearchChange,
  filterRoom,
}: ChatRoomListProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'unread', label: '안 읽음' },
    { id: 'deal', label: '거래 중' },
    { id: 'favorite', label: '즐겨찾기' },
  ];

  // 탭 필터링 + 검색 필터링 적용
  const filteredRooms = rooms.filter((room) => {
    // 먼저 탭 필터 적용
    if (!filterRoom(room, activeTab)) return false;

    // 검색어가 없으면 통과
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // 상대방 이름 검색
    if (room.otherUser?.name?.toLowerCase().includes(query)) return true;

    // 마지막 메시지 내용 검색
    if (room.lastMessage?.message?.toLowerCase().includes(query)) return true;

    // 서비스 제목 검색
    if (room.service?.title?.toLowerCase().includes(query)) return true;

    // API 검색 결과에 포함된 경우 (전체 대화 내용 검색)
    if (searchMatchingRoomIds.includes(room.id)) return true;

    return false;
  });

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
      {/* 헤더 - 탭 버튼 */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto' : ''}`}>
          {tabs.map((tab) => (
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

      {/* 검색 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            id={isMobile ? 'chat-search-mobile' : 'chat-search-desktop'}
            name={isMobile ? 'chat-search-mobile' : 'chat-search-desktop'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="이름, 대화 내용, 서비스명 검색"
            className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          )}
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className={isMobile ? 'overflow-y-auto pb-20' : 'flex-1 overflow-y-auto'}>
        <ChatRoomContent
          isCreatingRoom={isCreatingRoom}
          rooms={rooms}
          filteredRooms={filteredRooms}
          selectedRoomId={selectedRoomId}
          isMobile={isMobile}
          onSelectRoom={onSelectRoom}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </>
  );
}
