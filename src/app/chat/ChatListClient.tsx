"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChatUnreadCount } from "@/components/providers/ChatUnreadProvider";
import {
  FaSearch,
  FaSpinner,
  FaComments,
  FaPaperclip,
  FaTimes,
  FaFileDownload,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import ProfileImage from "@/components/common/ProfileImage";
import toast from "react-hot-toast";

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
  activeTab: "all" | "unread" | "deal" | "favorite"
): boolean {
  if (activeTab === "all") return true;
  if (activeTab === "unread") return (room.unreadCount || 0) > 0;
  if (activeTab === "deal") return room.has_active_order === true;
  if (activeTab === "favorite") return room.is_favorite === true;
  return true;
}

export default function ChatListClient({ userId, sellerId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoomId = searchParams.get("room");
  const orderId = searchParams.get("order");

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRoomId,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "unread" | "deal" | "favorite"
  >("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const supabase = createClient();
  const { decrementCount } = useChatUnreadCount(); // unread count 훅 사용

  // 채팅방 목록 로드
  const loadRooms = async () => {
    try {
      const response = await fetch("/api/chat/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      } else {
        const error = await response.json();
        console.error(
          "[ChatListClient] Failed to load rooms:",
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        );
      }
    } catch (error) {
      console.error(
        "[ChatListClient] Load rooms error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    }
  };

  // 주문으로부터 채팅방 생성 또는 찾기
  const createRoomFromOrder = async (orderId: string) => {
    try {
      setIsCreatingRoom(true);
      const response = await fetch("/api/chat/rooms/create-from-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRoomId(data.room.id); // 먼저 방 선택
        await loadRooms(); // 채팅방 목록 새로고침
        router.push(`/chat?room=${data.room.id}`); // URL 업데이트
      } else {
        const error = await response.json();
        toast.error(error.error || "채팅방 생성에 실패했습니다");
      }
    } catch (error) {
      console.error(
        "Create room from order error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("채팅방 생성 중 오류가 발생했습니다");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 채팅방 선택 이벤트 방지

    try {
      const response = await fetch("/api/chat/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId }),
      });

      if (response.ok) {
        const data = await response.json();
        // 로컬 상태 업데이트
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId
              ? { ...room, is_favorite: data.is_favorite }
              : room,
          ),
        );
      }
    } catch (error) {
      console.error(
        "[ChatListClient] Toggle favorite error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
    }
  };

  // Helper: Update room UI to mark as read
  function updateRoomUIAsRead(roomId: string): number {
    const currentRoom = rooms.find((r) => r.id === roomId);
    const unreadCount = currentRoom?.unreadCount || 0;

    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room,
      ),
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

  // Helper: Mark messages as read in background
  async function markMessagesReadInBackground(roomId: string): Promise<void> {
    try {
      await fetch("/api/chat/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      console.error(
        "[ChatListClient] Mark as read error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
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
      await fetch("/api/chat/messages/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      console.error(
        "[ChatListClient] Mark messages as read error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
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
        toast.error("파일 크기는 10MB 이하만 가능합니다.");
        return;
      }
      setSelectedFile(file);
    }
  };

  // 파일 업로드
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (error) {
        console.error(
          "File upload error:",
          JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
        );
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error(
        "Upload error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 메시지 전송
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedRoomId || isLoading)
      return;

    const messageText = newMessage.trim();
    const fileToUpload = selectedFile;
    setIsLoading(true);
    setNewMessage(""); // 입력창 즉시 비우기
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

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: selectedRoomId,
          message: messageText || "",
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
        toast.error(
          `메시지 전송 실패: ${errorData.error || "알 수 없는 오류"}`,
        );
        setNewMessage(messageText); // 실패 시 메시지 복원
        setSelectedFile(fileToUpload); // 실패 시 파일 복원
      }
    } catch (error) {
      console.error(
        "Send message error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );
      toast.error("메시지 전송 중 오류가 발생했습니다.");
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
  const updateRoomWithNewMessage = useCallback((newMsg: Message) => {
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
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime(),
    );
  }, [rooms]);

  // Handler for new chat messages
  const handleNewChatMessage = useCallback(async (payload: unknown) => {
    const newMsg = (payload as { new: Message }).new;

    // 내가 보낸 메시지가 아닌 경우에만 unreadCount 증가
    if (newMsg.sender_id !== userId) {
      // 해당 채팅방의 unreadCount 증가
      setRooms(() => updateRoomWithNewMessage(newMsg));
    }
  }, [userId, updateRoomWithNewMessage]);

  // 채팅방 목록의 unreadCount 실시간 업데이트
  useEffect(() => {
    const channel = supabase
      .channel(`chat_list_updates_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        handleNewChatMessage,
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
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
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
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoomId, userId, supabase]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const _isSeller = selectedRoom ? selectedRoom.seller_id === sellerId : false;
  const _otherUser = selectedRoom?.otherUser || null;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* 모바일: 전체 화면 채팅방 목록 */}
      <div className="lg:hidden min-h-screen bg-white">
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">채팅</h1>

          {/* 탭 */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "unread"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              안 읽음
            </button>
          </div>
        </div>

        {/* 채팅방 목록 */}
        <div className="overflow-y-auto pb-20">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FaComments className="text-4xl mb-4" />
              <p>채팅 내역이 없습니다</p>
            </div>
          ) : (
            rooms
              .filter((room) => shouldShowRoom(room, activeTab))
              .map((room) => {
                const otherUser = room.otherUser;
                const otherUserName = room.otherUser?.name || "사용자";

                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className="w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {/* 프로필 이미지 */}
                      <ProfileImage
                        src={otherUser?.profile_image}
                        alt={otherUserName}
                        size={48}
                        className="flex-shrink-0"
                      />

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {otherUserName}
                            </h3>
                            <button
                              onClick={(e) => toggleFavorite(room.id, e)}
                              className="flex-shrink-0 text-lg transition-colors"
                              aria-label={
                                room.is_favorite
                                  ? "즐겨찾기 해제"
                                  : "즐겨찾기 추가"
                              }
                            >
                              {room.is_favorite ? (
                                <FaStar
                                  className="text-yellow-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FaRegStar
                                  className="text-gray-400"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </div>
                          {room.lastMessage && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {new Date(
                                room.lastMessage.created_at,
                              ).toLocaleDateString("ko-KR", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        {room.lastMessage && (
                          <p className="text-sm text-gray-600 truncate">
                            {room.lastMessage.message}
                          </p>
                        )}
                      </div>

                      {/* 안읽음 배지 */}
                      {(room.unreadCount || 0) > 0 && (
                        <div className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {room.unreadCount}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* PC: 기존 레이아웃 */}
      <div className="hidden lg:block container-1200 py-6">
        <div className="flex h-[calc(100vh-120px)] bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 왼쪽: 채팅방 목록 */}
          <div className="w-[350px] border-r border-gray-200 flex flex-col flex-shrink-0">
            {/* 헤더 */}
            <div className="px-4 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold mb-4">채팅</h1>

              {/* 탭 */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === "unread"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  안 읽음
                </button>
                <button
                  onClick={() => setActiveTab("deal")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === "deal"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  거래 중
                </button>
                <button
                  onClick={() => setActiveTab("favorite")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === "favorite"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  즐겨찾기
                </button>
              </div>
            </div>

            {/* 검색 */}
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

            {/* 채팅방 목록 */}
            <div className="flex-1 overflow-y-auto">
              {isCreatingRoom ? (
                <div className="p-8 text-center text-gray-500">
                  <FaSpinner className="fa-spin text-4xl mb-3 inline-block" />
                  <p>채팅방을 생성하는 중...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaComments className="text-4xl mb-3 inline-block" />
                  <p>채팅방이 없습니다</p>
                </div>
              ) : (
                rooms
                  .filter((room) => shouldShowRoom(room, activeTab))
                  .map((room) => {
                    const other = room.otherUser;
                    const displayName = room.otherUser?.name || "사용자";

                    return (
                      <button
                        key={room.id}
                        onClick={() => handleSelectRoom(room.id)}
                        className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                          selectedRoomId === room.id
                            ? "bg-gray-50 border-l-4 border-l-green-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* 프로필 아이콘 */}
                          <ProfileImage
                            src={other?.profile_image}
                            alt={displayName}
                            size={48}
                            className="flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="font-medium text-sm truncate">
                                  {displayName}
                                </h3>
                                <button
                                  onClick={(e) => toggleFavorite(room.id, e)}
                                  className="flex-shrink-0 text-base transition-colors"
                                  aria-label={
                                    room.is_favorite
                                      ? "즐겨찾기 해제"
                                      : "즐겨찾기 추가"
                                  }
                                >
                                  {room.is_favorite ? (
                                    <FaStar
                                      className="text-yellow-400"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <FaRegStar
                                      className="text-gray-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                </button>
                              </div>
                              <span className="text-xs text-gray-400">
                                {room.last_message_at
                                  ? new Date(
                                      room.last_message_at,
                                    ).toLocaleDateString("ko-KR", {
                                      month: "2-digit",
                                      day: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                            {room.lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {room.lastMessage.message}
                              </p>
                            )}
                          </div>

                          {room.unreadCount ? (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                              {room.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })
              )}
            </div>
          </div>

          {/* 오른쪽: 채팅 메시지 */}
          <div className="flex-1 flex flex-col">
            {selectedRoom ? (
              <>
                {/* 채팅방 헤더 */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                  {/* 서비스 정보 */}
                  {selectedRoom.service && (
                    <div className="flex items-center gap-2">
                      {selectedRoom.service.thumbnail_url && (
                        <img
                          src={selectedRoom.service.thumbnail_url}
                          alt={selectedRoom.service.title}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <p className="text-sm text-gray-700 font-medium">
                        {selectedRoom.service.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                  {messages.map((message) => {
                    const isMine = message.sender_id === userId;
                    const sender = message.sender;
                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-2 mb-4 ${isMine ? "flex-row-reverse" : ""}`}
                      >
                        {!isMine && (
                          <ProfileImage
                            src={sender?.profile_image}
                            alt={sender?.name || ""}
                            size={32}
                            className="flex-shrink-0"
                          />
                        )}

                        <div
                          className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`max-w-md px-4 py-2 rounded-2xl ${
                              isMine
                                ? "bg-[#d4f4dd] text-gray-900"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            {message.file_url && (
                              <>
                                {message.file_type?.startsWith("image/") ? (
                                  // 이미지 파일인 경우
                                  <a
                                    href={message.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mb-2"
                                  >
                                    <img
                                      src={message.file_url}
                                      alt={message.file_name || "이미지"}
                                      className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      loading="lazy"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      {message.file_name}
                                      {message.file_size &&
                                        ` • ${(message.file_size / 1024).toFixed(1)} KB`}
                                    </p>
                                  </a>
                                ) : (
                                  // 일반 파일인 경우
                                  <a
                                    href={message.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 mb-2 p-2 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                                  >
                                    <FaPaperclip className="text-blue-500" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {message.file_name || "첨부파일"}
                                      </p>
                                      {message.file_size && (
                                        <p className="text-xs text-gray-500">
                                          {(message.file_size / 1024).toFixed(
                                            1,
                                          )}{" "}
                                          KB
                                        </p>
                                      )}
                                    </div>
                                    <FaFileDownload className="text-gray-400" />
                                  </a>
                                )}
                              </>
                            )}
                            {message.message && (
                              <p className="whitespace-pre-wrap break-words">
                                {message.message}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {new Date(message.created_at).toLocaleTimeString(
                              "ko-KR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 입력 영역 */}
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <form onSubmit={sendMessage} className="space-y-3">
                    {/* 선택된 파일 표시 */}
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <FaPaperclip className="text-blue-500" />
                        <span className="flex-1 text-sm truncate">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="첨부파일 삭제"
                        >
                          <FaTimes aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    <div className="relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="메시지를 입력하세요. (Enter: 줄바꿈 / Ctrl+Enter: 전송)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        disabled={isLoading || isUploading}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          자주 쓰는 문구
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          결제 요청
                        </button>
                        <input
                          type="file"
                          id="file-input"
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={isLoading || isUploading}
                        />
                        <label
                          htmlFor="file-input"
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer inline-flex items-center gap-2"
                        >
                          <FaPaperclip />
                          파일 첨부
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={
                          (!newMessage.trim() && !selectedFile) ||
                          isLoading ||
                          isUploading
                        }
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#0a2540] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploading
                          ? "업로드 중..."
                          : isLoading
                            ? "전송 중..."
                            : "전송"}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FaComments className="text-6xl mb-4 inline-block" />
                  <p className="text-lg">채팅방을 선택해주세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
