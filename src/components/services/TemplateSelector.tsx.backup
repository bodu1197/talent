"use client";

import { useState, useEffect } from "react";
import {
  BACKGROUND_TEMPLATES,
  createTemplatePreview,
  type GradientTemplate,
} from "@/lib/template-generator";
import { FaPalette, FaCheck, FaInfoCircle } from "react-icons/fa";

interface Props {
  onSelect: (template: GradientTemplate) => void;
  selectedTemplateId?: string;
}

export default function TemplateSelector({
  onSelect,
  selectedTemplateId,
}: Props) {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  // 템플릿 미리보기 생성
  useEffect(() => {
    const newPreviews: Record<string, string> = {};

    BACKGROUND_TEMPLATES.forEach((template) => {
      newPreviews[template.id] = createTemplatePreview(template, 200, 150);
    });

    setPreviews(newPreviews);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FaPalette className="text-brand-primary" />
        <h3 className="font-semibold text-lg">배경 템플릿 선택</h3>
        <span className="text-sm text-gray-500">
          ({BACKGROUND_TEMPLATES.length}개)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {BACKGROUND_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`group relative rounded-lg overflow-hidden transition-all ${
              selectedTemplateId === template.id
                ? "ring-4 ring-brand-primary shadow-lg scale-105"
                : "hover:ring-2 hover:ring-brand-primary/50 hover:shadow-md"
            }`}
          >
            {/* 미리보기 이미지 */}
            <div className="aspect-[4/3] relative">
              {previews[template.id] ? (
                <img
                  src={previews[template.id]}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              )}

              {/* 선택 표시 */}
              {selectedTemplateId === template.id && (
                <div className="absolute inset-0 bg-brand-primary/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center">
                    <FaCheck className="text-2xl" />
                  </div>
                </div>
              )}

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>

            {/* 템플릿 이름 */}
            <div className="p-2 bg-white">
              <p className="text-xs font-medium text-gray-700 truncate">
                {template.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 안내 문구 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-blue-500 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">템플릿 사용 방법</p>
            <ul className="space-y-1 text-xs">
              <li>• 원하는 배경을 선택하세요</li>
              <li>
                • 선택 후 텍스트를 입력하여 맞춤형 썸네일을 만들 수 있습니다
                (최대 25자)
              </li>
              <li>• 최종 이미지는 652×488 픽셀로 자동 생성됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
