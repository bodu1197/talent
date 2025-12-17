import { Save, Check } from 'lucide-react';

interface SaveButtonContentProps {
  readonly isSaving: boolean;
  readonly isSuccess: boolean;
}

/**
 * 저장 버튼의 상태별 내용 렌더링
 * - 저장 중: 로딩 스피너
 * - 성공: 체크 아이콘
 * - 기본: 저장 아이콘
 */
export default function SaveButtonContent({ isSaving, isSuccess }: SaveButtonContentProps) {
  if (isSaving) {
    return (
      <>
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        저장 중...
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <Check className="w-5 h-5" />
        저장 완료
      </>
    );
  }

  return (
    <>
      <Save className="w-5 h-5" />
      변경사항 저장
    </>
  );
}
