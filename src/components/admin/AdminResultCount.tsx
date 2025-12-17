interface AdminResultCountProps {
  readonly count: number;
  readonly label: string;
}

export default function AdminResultCount({ count, label }: AdminResultCountProps) {
  return (
    <div className="text-sm text-gray-600">
      총 <span className="font-semibold text-gray-900">{count}</span> {label}
    </div>
  );
}
