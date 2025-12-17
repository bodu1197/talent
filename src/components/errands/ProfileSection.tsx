import ProfileImage from '@/components/common/ProfileImage';
import { User, Phone, Camera } from 'lucide-react';

interface ProfileSectionProps {
  readonly profile: {
    readonly profile_image?: string | null;
  } | null;
  readonly userEmail?: string | null;
  readonly name: string;
  readonly phone: string;
  readonly onNameChange: (value: string) => void;
  readonly onPhoneChange: (value: string) => void;
  readonly idPrefix: string;
}

export default function ProfileSection({
  profile,
  userEmail,
  name,
  phone,
  onNameChange,
  onPhoneChange,
  idPrefix,
}: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">프로필 정보</h2>
      </div>
      <div className="p-4 space-y-4">
        {/* 프로필 이미지 */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProfileImage src={profile?.profile_image} alt={name} size={64} />
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-900">{name || '이름 없음'}</p>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
        </div>

        {/* 이름 */}
        <div>
          <label
            htmlFor={`${idPrefix}-name`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            이름
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id={`${idPrefix}-name`}
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
            />
          </div>
        </div>

        {/* 연락처 */}
        <div>
          <label
            htmlFor={`${idPrefix}-phone`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            연락처
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="010-0000-0000"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
