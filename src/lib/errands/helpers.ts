export function getStatusLabel(status: string) {
  switch (status) {
    case 'OPEN':
      return { text: '요청중', color: 'bg-blue-100 text-blue-700' };
    case 'MATCHED':
      return { text: '매칭됨', color: 'bg-purple-100 text-purple-700' };
    case 'IN_PROGRESS':
      return { text: '진행중', color: 'bg-yellow-100 text-yellow-700' };
    case 'COMPLETED':
      return { text: '완료', color: 'bg-green-100 text-green-700' };
    case 'CANCELLED':
      return { text: '취소됨', color: 'bg-gray-100 text-gray-700' };
    default:
      return { text: status, color: 'bg-gray-100 text-gray-700' };
  }
}

export function getCategoryLabel(category: string) {
  const categoryMap: Record<string, string> = {
    DELIVERY: '배달',
    SHOPPING: '구매대행',
    MOVING: '이사/운반',
    QUEUEING: '줄서기',
    PET_CARE: '반려동물',
    CLEANING: '청소',
    BUG_CATCHING: '벌레 잡기',
    DOCUMENT: '서류',
    OTHER: '기타',
  };
  return categoryMap[category] || category;
}
