import { Category } from '@/types/common';
import { Folder, FolderOpen, Edit, Trash2 } from 'lucide-react';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isParent?: boolean;
}

export default function CategoryRow({
  category,
  onEdit,
  onDelete,
  isParent = false,
}: CategoryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg p-2 ${
            isParent ? 'bg-white border border-slate-200' : 'bg-slate-50'
          }`}
        >
          {isParent ? (
            <Folder className="text-[#0f3460] w-5 h-5" />
          ) : (
            <FolderOpen className="text-slate-600 w-4 h-4" />
          )}
        </div>
        <div>
          {isParent ? (
            <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
          ) : (
            <p className="font-medium text-slate-900">{category.name}</p>
          )}
          <p className="text-sm text-slate-600 mt-1">/{category.slug}</p>
        </div>
        {!category.is_active && (
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
            비활성
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          aria-label={`${category.name} 수정`}
        >
          <Edit className="text-slate-700 w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="px-3 py-2 border border-slate-200 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
          aria-label={`${category.name} 삭제`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
