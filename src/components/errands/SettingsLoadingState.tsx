export default function SettingsLoadingState() {
  return (
    <div className="bg-white rounded-xl p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
      <p className="mt-4 text-gray-500">불러오는 중...</p>
    </div>
  );
}
