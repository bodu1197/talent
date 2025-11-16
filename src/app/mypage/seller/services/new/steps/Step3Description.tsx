import { FaLightbulb, FaCheck } from "react-icons/fa";

interface ServiceFormData {
  title: string;
  category_ids: string[];
  price: string;
  delivery_days: string;
  revision_count: string;
  description: string;
  thumbnail_url: string;
  thumbnail_file: File | null;
  requirements: { question: string; required: boolean }[];
  create_portfolio: boolean;
  portfolio_data: {
    title: string;
    description: string;
    youtube_url: string;
    project_url: string;
    tags: string[];
    images: File[];
  };
  features?: {
    commercial_use?: boolean;
    source_files?: boolean;
    express_delivery?: boolean;
  };
}

interface Props {
  formData: ServiceFormData;
  setFormData: (data: ServiceFormData) => void;
}

export default function Step3Description({ formData, setFormData }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">서비스 설명</h2>

      {/* 서비스 상세 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 상세 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
          placeholder="서비스에 대한 자세한 설명을 입력하세요.

예시:
• 제공하는 서비스 내용
• 작업 방식 및 프로세스
• 포함되는 항목과 제외되는 항목
• 필요한 자료나 정보
• 추가 비용이 발생하는 경우

구체적이고 명확한 설명은 고객의 신뢰를 높이고 문의를 줄입니다."
          required
        />
        <div className="mt-2 flex justify-between text-sm">
          <p className="text-gray-500">최소 100자 이상 작성해주세요</p>
          <p
            className={`${formData.description.length >= 100 ? "text-green-600" : "text-gray-500"}`}
          >
            {formData.description.length} / 최소 100자
          </p>
        </div>
      </div>

      {/* 작성 가이드 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          <FaLightbulb className="text-yellow-500 mr-2 inline" />
          좋은 서비스 설명 작성 팁
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <FaCheck className="text-green-600 mt-1" />
            <span>
              <strong>명확한 범위:</strong> 어떤 작업을 해드리는지 구체적으로
              명시
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheck className="text-green-600 mt-1" />
            <span>
              <strong>작업 프로세스:</strong> 어떤 순서로 진행되는지 설명
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheck className="text-green-600 mt-1" />
            <span>
              <strong>준비 사항:</strong> 고객이 제공해야 할 자료나 정보
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheck className="text-green-600 mt-1" />
            <span>
              <strong>결과물 형식:</strong> 최종 파일 형식이나 전달 방법
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FaCheck className="text-green-600 mt-1" />
            <span>
              <strong>추가 비용:</strong> 기본 가격에 포함되지 않는 항목 안내
            </span>
          </li>
        </ul>
      </div>

      {/* 서비스 특징 (선택사항) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 특징 <span className="text-gray-500 text-xs">(선택사항)</span>
        </label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.features?.commercial_use || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: {
                    ...formData.features,
                    commercial_use: e.target.checked,
                  },
                })
              }
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label className="text-sm text-gray-700">상업적 이용 가능</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.features?.source_files || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: {
                    ...formData.features,
                    source_files: e.target.checked,
                  },
                })
              }
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label className="text-sm text-gray-700">원본 파일 제공</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.features?.express_delivery || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  features: {
                    ...formData.features,
                    express_delivery: e.target.checked,
                  },
                })
              }
              className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label className="text-sm text-gray-700">
              급행 작업 가능 (추가 비용)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
