'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useChatUnreadCount } from '@/components/providers/ChatUnreadProvider';
import toast from 'react-hot-toast';
import ChatRoomList from './components/ChatRoomList';
import ChatMessageArea from './components/ChatMessageArea';
import { logger } from '@/lib/logger';

interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  service_id: string | null;
  last_message_at: string;
  created_at: string;
  seller_id: string | null; // 현재 사용자가 판매자인 경우
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

interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  sender?: {
    id: string;
    name: string;
    profile_image: string | null;
  };
}

interface Props {
  readonly userId: string;
  readonly sellerId: string | null;
}

// Helper: Filter rooms based on active tab
function shouldShowRoom(
  room: ChatRoom,
  activeTab: 'all' | 'unread' | 'deal' | 'favorite'
): boolean {
  if (activeTab === 'all') return true;
  if (activeTab === 'unread') return (room.unreadCount || 0) > 0;
  if (activeTab === 'deal') return room.has_active_order === true;
  if (activeTab === 'favorite') return room.is_favorite === true;
  return true;
}

// Helper: Mark messages as read in background
async function markMessagesReadInBackground(roomId: string): Promise<void> {
  try {
    await fetch('/api/chat/messages/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId }),
    });
  } catch (error) {
    logger.error('[ChatListClient] Mark as read error:', error);
  }
}

export default function ChatListClient({ userId, sellerId: _sellerId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get('room');
  const orderId = searchParams.get('order');

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'deal' | 'favorite'>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const supabase = createClient();
  const { decrementCount } = useChatUnreadCount(); // unread count 훅 사용

  // 채팅방 목록 로드
  const loadRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      } else {
        const error = await response.json();
        logger.error('[ChatListClient] Failed to load rooms:', error);
      }
    } catch (error) {
      logger.error('[ChatListClient] Load rooms error:', error);
    }
  };

  // 주문으로부터 채팅방 생성 또는 찾기
  const createRoomFromOrder = async (orderId: string) => {
    try {
      setIsCreatingRoom(true);
      const response = await fetch('/api/chat/rooms/create-from-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRoomId(data.room.id); // 먼저 방 선택
        await loadRooms(); // 채팅방 목록 새로고침
        router.push(`/chat?room=${data.room.id}`); // URL 업데이트
      } else {
        const error = await response.json();
        toast.error(error.error || '채팅방 생성에 실패했습니다');
      }
    } catch (error) {
      logger.error('Create room from order error:', error);
      toast.error('채팅방 생성 중 오류가 발생했습니다');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 채팅방 선택 이벤트 방지

    try {
      const response = await fetch('/api/chat/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      });

      if (response.ok) {
        const data = await response.json();
        // 로컬 상태 업데이트
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId ? { ...room, is_favorite: data.is_favorite } : room
          )
        );
      }
    } catch (error) {
      logger.error('[ChatListClient] Toggle favorite error:', error);
    }
  };

  // Helper: Update room UI to mark as read
  function updateRoomUIAsRead(roomId: string): number {
    const currentRoom = rooms.find((r) => r.id === roomId);
    const unreadCount = currentRoom?.unreadCount || 0;

    setRooms((prevRooms) =>
      prevRooms.map((room) => (room.id === roomId ? { ...room, unreadCount: 0 } : room))
    );

    return unreadCount;
  }

  // Helper: Navigate to chat room based on device
  function navigateToRoom(roomId: string): void {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      router.push(`/chat/${roomId}`);
    } else {
      setSelectedRoomId(roomId);
    }
  }

  // 채팅방 선택 시 메시지 읽음 처리
  const handleSelectRoom = async (roomId: string) => {
    // 즉시 UI 업데이트 및 unread count 가져오기
    const unreadCount = updateRoomUIAsRead(roomId);

    // 전역 카운트 감소
    if (unreadCount > 0) {
      decrementCount(unreadCount);
    }

    // 디바이스에 따라 네비게이션 처리
    navigateToRoom(roomId);

    // 백그라운드에서 읽음 처리
    await markMessagesReadInBackground(roomId);
  };

  // 읽지 않은 메시지를 읽음 처리
  const markMessagesAsRead = async (roomId: string) => {
    try {
      await fetch('/api/chat/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      logger.error('[ChatListClient] Mark messages as read error:', error);
    }
  };

  // 메시지 목록 로드
  const loadMessages = useCallback(async (roomId: string) => {
    const response = await fetch(`/api/chat/messages?room_id=${roomId}`);
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages || []);
      // 메시지 로드 후 읽음 처리
      await markMessagesAsRead(roomId);
      // loadRooms 호출 제거 - DB 재조회 방지
    }
  }, []);

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB 이하만 가능합니다.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // 파일 업로드
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error } = await supabase.storage.from('uploads').upload(filePath, file);

      if (error) {
        logger.error('File upload error:', error);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      logger.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedRoomId || isLoading) return;

    const messageText = newMessage.trim();
    const fileToUpload = selectedFile;
    setIsLoading(true);
    setNewMessage(''); // 입력창 즉시 비우기
    setSelectedFile(null); // 파일 선택 초기화

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      // 파일이 있으면 업로드
      if (fileToUpload) {
        fileUrl = await uploadFile(fileToUpload);
        if (fileUrl) {
          fileName = fileToUpload.name;
          fileSize = fileToUpload.size;
          fileType = fileToUpload.type;
        }
      }

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: selectedRoomId,
          message: messageText || '',
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_size: fileSize || null,
          file_type: fileType || null,
        }),
      });

      if (response.ok) {
        // 실시간 구독이 메시지를 자동으로 추가하므로 여기서는 추가하지 않음
        // loadRooms() 제거 - DB 재조회 방지, 실시간 구독으로 자동 업데이트
      } else {
        const errorData = await response.json();
        toast.error(`메시지 전송 실패: ${errorData.error || '알 수 없는 오류'}`);
        setNewMessage(messageText); // 실패 시 메시지 복원
        setSelectedFile(fileToUpload); // 실패 시 파일 복원
      }
    } catch (error) {
      logger.error('Send message error:', error);
      toast.error('메시지 전송 중 오류가 발생했습니다.');
      setNewMessage(messageText); // 실패 시 메시지 복원
      setSelectedFile(fileToUpload); // 실패 시 파일 복원
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadRooms();
  }, []);

  // 주문 ID로 채팅방 생성
  useEffect(() => {
    if (orderId && !isCreatingRoom) {
      createRoomFromOrder(orderId);
    }
  }, [orderId]);

  // 선택된 채팅방의 메시지 로드
  useEffect(() => {
    if (selectedRoomId) {
      loadMessages(selectedRoomId);
    }
  }, [selectedRoomId, loadMessages]);

  // Helper: Update room list with new message
  const updateRoomWithNewMessage = useCallback(
    (newMsg: Message) => {
      const updatedRooms = rooms.map((room) => {
        if (room.id === newMsg.room_id) {
          return {
            ...room,
            unreadCount: (room.unreadCount || 0) + 1,
            last_message_at: newMsg.created_at,
          };
        }
        return room;
      });

      // last_message_at 기준으로 재정렬
      return updatedRooms.sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    },
    [rooms]
  );

  // Handler for new chat messages
  const handleNewChatMessage = useCallback(
    async (payload: unknown) => {
      const newMsg = (payload as { new: Message }).new;

      // 내가 보낸 메시지가 아닌 경우에만 unreadCount 증가
      if (newMsg.sender_id !== userId) {
        // 해당 채팅방의 unreadCount 증가
        setRooms(() => updateRoomWithNewMessage(newMsg));
      }
    },
    [userId, updateRoomWithNewMessage]
  );

  // 채팅방 목록의 unreadCount 실시간 업데이트
  useEffect(() => {
    const channel = supabase
      .channel(`chat_list_updates_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        handleNewChatMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, handleNewChatMessage]);

  // 실시간 메시지 구독 (선택된 채팅방)
  useEffect(() => {
    if (!selectedRoomId) return;

    const channel = supabase
      .channel(`room:${selectedRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${selectedRoomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // 모든 새 메시지를 실시간으로 표시 (파일 필드 포함)
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              room_id: newMsg.room_id,
              sender_id: newMsg.sender_id,
              message: newMsg.message,
              is_read: newMsg.is_read,
              created_at: newMsg.created_at,
              file_url: newMsg.file_url,
              file_name: newMsg.file_name,
              file_size: newMsg.file_size,
              file_type: newMsg.file_type,
            },
          ]);
          // loadRooms() 제거 - DB 재조회 방지
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoomId, userId, supabase]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* 모바일: 전체 화면 채팅방 목록 */}
      <div className="lg:hidden min-h-screen bg-white">
        <ChatRoomList
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          activeTab={activeTab}
          isCreatingRoom={isCreatingRoom}
          isMobile={true}
          showSearch={false}
          onSelectRoom={handleSelectRoom}
          onToggleFavorite={toggleFavorite}
          onTabChange={setActiveTab}
          filterRoom={shouldShowRoom}
        />
      </div>

      {/* PC: 기존 레이아웃 */}
      <div className="hidden lg:block container-1200 py-6">
        <div className="flex h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 왼쪽: 채팅방 목록 */}
          <div className="w-[350px] border-r border-gray-200 flex flex-col flex-shrink-0">
            <ChatRoomList
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              activeTab={activeTab}
              isCreatingRoom={isCreatingRoom}
              isMobile={false}
              showSearch={true}
              onSelectRoom={handleSelectRoom}
              onToggleFavorite={toggleFavorite}
              onTabChange={setActiveTab}
              filterRoom={shouldShowRoom}
            />
          </div>

          {/* 오른쪽: 채팅 메시지 */}
          <div className="flex-1 flex flex-col">
            <ChatMessageArea
              selectedRoom={selectedRoom || null}
              messages={messages}
              userId={userId}
              newMessage={newMessage}
              selectedFile={selectedFile}
              isLoading={isLoading}
              isUploading={isUploading}
              onSendMessage={sendMessage}
              onMessageChange={setNewMessage}
              onFileSelect={handleFileSelect}
              onFileClear={() => setSelectedFile(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
