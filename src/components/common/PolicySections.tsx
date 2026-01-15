/**
 * 약관/정책 페이지용 섹션 렌더링 컴포넌트
 * 중복 코드 제거를 위해 terms, privacy 등의 페이지에서 공통으로 사용
 */

export interface PolicySection {
  title: string;
  content?: string | null;
  list?: string[];
}

interface PolicySectionsProps {
  readonly sections: PolicySection[];
}

export default function PolicySections({ sections }: PolicySectionsProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>
          {section.content && (
            <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
          )}
          {section.list && (
            <ol className="space-y-1.5 mt-2">
              {section.list.map((item, idx) => (
                <li key={item} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          )}
        </div>
      ))}
    </div>
  );
}
