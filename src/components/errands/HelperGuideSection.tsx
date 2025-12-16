interface HelperGuideSectionProps {
  readonly title?: string;
  readonly titleColor?: string;
  readonly textColor?: string;
}

export default function HelperGuideSection({
  title = '라이더 활동 가이드',
  titleColor = 'text-blue-900',
  textColor = 'text-blue-700',
}: HelperGuideSectionProps) {
  return (
    <>
      <h3 className={`font-semibold ${titleColor} mb-2`}>{title}</h3>
      <ul className={`space-y-2 text-sm ${textColor}`}>
        <li className="flex items-start gap-2">
          <span className="font-bold">1.</span>
          <span>주변 심부름을 찾아 지원하세요</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">2.</span>
          <span>요청자가 수락하면 심부름을 시작하세요</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">3.</span>
          <span>심부름 완료 후 대금을 정산받으세요</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="font-bold">4.</span>
          <span>좋은 리뷰를 받으면 등급이 올라갑니다</span>
        </li>
      </ul>
    </>
  );
}
