import { PasswordValidation } from '@/hooks/usePasswordValidation';

interface PasswordRequirementsProps {
  validation: PasswordValidation;
  show: boolean;
}

export function PasswordRequirements({ validation, show }: PasswordRequirementsProps) {
  if (!show) return null;

  const requirements = [
    { key: 'minLength', label: '8자 이상', met: validation.minLength },
    { key: 'hasLetter', label: '영문 포함', met: validation.hasLetter },
    { key: 'hasNumber', label: '숫자 포함', met: validation.hasNumber },
    { key: 'hasSpecial', label: '특수문자 포함 (!@#$%^&* 등)', met: validation.hasSpecial },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map(({ key, label, met }) => (
        <div
          key={key}
          className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-gray-500"}`}
        >
          <span>{met ? "✓" : "○"}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
