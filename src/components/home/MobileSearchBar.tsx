'use client';

import { useRouter } from 'next/navigation';
import SearchForm from '@/components/common/SearchForm';

export default function MobileSearchBar() {
  const router = useRouter();

  return (
    <div className="lg:hidden bg-white pt-1 pb-2 px-3">
      <SearchForm
        onSubmit={(query) => {
          if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }
        }}
        inputClassName="px-4 py-3 pr-12 border-gray-200 bg-gray-50 focus:bg-white text-sm"
        buttonClassName="w-12 h-12 right-1 top-1/2 -translate-y-1/2 static-none" // Adjusting position manually in prop might be tricky if base component has absolute.
        // SearchForm has absolute positioning for button. Let's check SearchForm implementation.
        // SearchForm button: absolute right-2 top-1/2 ...
        // MobileSearchBar wanted: right-1 top-1/2 -translate-y-1/2 (which SearchForm has: transform: 'translate3d(0, -50%, 0)')
        // So just override specific classes.
      />
    </div>
  );
}
