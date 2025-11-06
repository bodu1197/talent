interface Props {
  formData: any
  setFormData: (data: any) => void
  categories: any[]
}

export default function Step1BasicInfo({ formData, setFormData, categories }: Props) {
  // 레벨 1, 2, 3 카테고리 필터링
  const level1 = categories.filter(c => c.level === 1)
  const level2 = categories.filter(c => c.level === 2)
  const level3 = categories.filter(c => c.level === 3)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>

      {/* 서비스 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          서비스 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
          placeholder="서비스 제목을 입력하세요"
          required
        />
      </div>

      {/* 카테고리 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3460] focus:border-transparent"
          onChange={(e) => {
            if (e.target.value && !formData.category_ids.includes(e.target.value)) {
              setFormData({
                ...formData,
                category_ids: [...formData.category_ids, e.target.value]
              })
            }
          }}
        >
          <option value="">카테고리를 선택하세요</option>
          {level1.map(cat => (
            <optgroup key={cat.id} label={cat.name}>
              {level2.filter(c => c.parent_id === cat.id).map(child => (
                <>
                  <option key={child.id} value={child.id}>
                    └ {child.name}
                  </option>
                  {level3.filter(c => c.parent_id === child.id).map(grandchild => (
                    <option key={grandchild.id} value={grandchild.id}>
                      &nbsp;&nbsp;&nbsp;└ {grandchild.name}
                    </option>
                  ))}
                </>
              ))}
            </optgroup>
          ))}
        </select>

        {/* 선택된 카테고리 표시 */}
        {formData.category_ids.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.category_ids.map((catId: string) => {
              const cat = categories.find(c => c.id === catId)
              return (
                <span
                  key={catId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {cat?.name}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      category_ids: formData.category_ids.filter((id: string) => id !== catId)
                    })}
                    className="hover:text-blue-900"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
