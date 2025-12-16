interface OrderStatusSidebarProps {
  readonly status: string;
  readonly getStatusLabel: (status: string) => string;
  readonly getStatusColor: (status: string) => string;
}

export default function OrderStatusSidebar({
  status,
  getStatusLabel,
  getStatusColor,
}: OrderStatusSidebarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
      <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-xs lg:text-base">현재 상태</h3>
      <div className="flex items-center justify-center py-3 lg:py-4">
        <span
          className={`px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-semibold text-sm lg:text-lg ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </span>
      </div>
    </div>
  );
}
