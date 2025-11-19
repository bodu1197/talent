"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { FaTimes, FaPlus, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import toast from "react-hot-toast";

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
  showOnlyRequirements?: boolean;
}

export default function Step5Requirements({
  formData,
  setFormData,
  showOnlyRequirements = false,
}: Props) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [fetchingThumbnail, setFetchingThumbnail] = useState(false);

  // 요청사항 추가
  const addRequirement = () => {
    if (!newQuestion.trim()) {
      toast.error("질문을 입력해주세요");
      return;
    }

    setFormData({
      ...formData,
      requirements: [
        ...(formData.requirements || []),
        { question: newQuestion, required: newQuestionRequired },
      ],
    });
    setNewQuestion("");
    setNewQuestionRequired(false);
  };

  // 요청사항 삭제
  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i: number) => i !== index),
    });
  };

  // 태그 추가
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (formData.portfolio_data.tags.includes(tagInput.trim())) {
      toast.error("이미 추가된 태그입니다");
      return;
    }

    setFormData({
      ...formData,
      portfolio_data: {
        ...formData.portfolio_data,
        tags: [...formData.portfolio_data.tags, tagInput.trim()],
      },
    });
    setTagInput("");
  };

  // 태그 삭제
  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      portfolio_data: {
        ...formData.portfolio_data,
        tags: formData.portfolio_data.tags.filter((t: string) => t !== tag),
      },
    });
  };

  // YouTube URL에서 비디오 ID 추출
  const extractYoutubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // YouTube URL 입력 핸들러
  const handleYoutubeUrlChange = async (url: string) => {
    setFormData({
      ...formData,
      portfolio_data: {
        ...formData.portfolio_data,
        youtube_url: url,
      },
    });

    if (!url) {
      setYoutubeVideoId("");
      return;
    }

    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      setYoutubeVideoId(videoId);

      // YouTube 썸네일 자동 다운로드
      try {
        setFetchingThumbnail(true);

        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const response = await fetch(thumbnailUrl);

        const blob = response.ok
          ? await response.blob()
          : await (
              await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
            ).blob();

        const file = new File([blob], `youtube-${videoId}.jpg`, {
          type: "image/jpeg",
        });

        setFormData({
          ...formData,
          portfolio_data: {
            ...formData.portfolio_data,
            youtube_url: url,
            images: [file, ...formData.portfolio_data.images],
          },
        });
      } catch (error) {
        logger.error("Failed to fetch YouTube thumbnail:", error);
      } finally {
        setFetchingThumbnail(false);
      }
    } else {
      setYoutubeVideoId("");
    }
  };

  // 포트폴리오 이미지 추가
  const handlePortfolioImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setFormData({
      ...formData,
      portfolio_data: {
        ...formData.portfolio_data,
        images: [...formData.portfolio_data.images, ...files],
      },
    });
  };

  // 포트폴리오 이미지 삭제
  const removePortfolioImage = (index: number) => {
    setFormData({
      ...formData,
      portfolio_data: {
        ...formData.portfolio_data,
        images: formData.portfolio_data.images.filter(
          (_, i: number) => i !== index,
        ),
      },
    });
  };

  return (
    <div className="space-y-8">
      {!showOnlyRequirements && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          포트폴리오 등록
        </h2>
      )}
      {showOnlyRequirements && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">고객 요청사항</h2>
      )}

      {/* 요청사항 섹션 - showOnlyRequirements가 true일 때만 표시 */}
      {showOnlyRequirements && (
        <div className="pb-8 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            고객 요청사항{" "}
            <span className="text-gray-500 text-xs font-normal">
              (선택사항)
            </span>
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            주문 시 고객에게 받을 정보나 질문을 추가하세요. 작업에 필요한 정보를
            미리 받으면 원활한 진행이 가능합니다.
          </p>

          {/* 요청사항 목록 */}
          {formData.requirements && formData.requirements.length > 0 && (
            <div className="mb-4 space-y-2">
              {formData.requirements.map(
                (
                  req: { question: string; required: boolean },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700">{req.question}</span>
                      {req.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          필수
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ),
              )}
            </div>
          )}

          {/* 요청사항 추가 폼 */}
          <div className="space-y-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRequirement();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="예: 선호하는 색상을 알려주세요"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newQuestionRequired}
                  onChange={(e) => setNewQuestionRequired(e.target.checked)}
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">
                  필수 항목으로 설정
                </span>
              </label>
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaPlus className="mr-2 inline" />
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포트폴리오 섹션 - showOnlyRequirements가 false일 때만 표시 */}
      {!showOnlyRequirements && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              포트폴리오 등록{" "}
              <span className="text-gray-500 text-xs font-normal">
                (선택사항 - 권장)
              </span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.create_portfolio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    create_portfolio: e.target.checked,
                  })
                }
                className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
              />
              <span className="text-sm font-medium text-gray-700">
                포트폴리오 함께 등록하기
              </span>
            </label>
          </div>

          {!formData.create_portfolio ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 mb-2">
                <FaInfoCircle className="mr-2 inline" />
                <strong>
                  포트폴리오를 등록하면 서비스 신뢰도가 높아집니다!
                </strong>
              </p>
              <p className="text-sm text-blue-800">
                작업 샘플이나 이전 프로젝트를 보여주면 고객이 서비스를 선택하는
                데 큰 도움이 됩니다. 위의 체크박스를 선택하여 포트폴리오를 함께
                등록하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-white">
              {/* 포트폴리오 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목{" "}
                  <span className="text-gray-500 text-xs">
                    (비어있으면 서비스 제목 사용)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.portfolio_data.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portfolio_data: {
                        ...formData.portfolio_data,
                        title: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="포트폴리오 제목을 입력하세요"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.portfolio_data.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portfolio_data: {
                        ...formData.portfolio_data,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="프로젝트에 대한 자세한 설명을 입력하세요"
                  required={formData.create_portfolio}
                />
              </div>

              {/* 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 업로드{" "}
                  <span className="text-gray-500 text-xs">
                    (첫 이미지가 썸네일이 됩니다)
                  </span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                {formData.portfolio_data.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.portfolio_data.images.map(
                      (file: File, index: number) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 bg-brand-primary text-white text-xs px-2 py-1 rounded">
                              썸네일
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removePortfolioImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* 프로젝트 URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 URL
                </label>
                <input
                  type="url"
                  value={formData.portfolio_data.project_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portfolio_data: {
                        ...formData.portfolio_data,
                        project_url: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube 영상 URL{" "}
                  <span className="text-gray-500 text-xs">
                    (영상이 포트폴리오에 삽입됩니다)
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.portfolio_data.youtube_url}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={fetchingThumbnail}
                />
                {fetchingThumbnail && (
                  <p className="mt-2 text-sm text-gray-600">
                    <FaSpinner className="fa-spin mr-2 inline" />
                    YouTube 썸네일을 가져오는 중...
                  </p>
                )}
                {youtubeVideoId && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <FaYoutube className="text-red-600 mr-2 inline" />
                      YouTube 영상 미리보기
                    </p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="YouTube video preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    placeholder="태그 입력 후 Enter"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    추가
                  </button>
                </div>
                {formData.portfolio_data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.portfolio_data.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
