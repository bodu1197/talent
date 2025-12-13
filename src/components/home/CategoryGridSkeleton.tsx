export default function CategoryGridSkeleton() {
    return (
        <section className="pt-2 pb-4 lg:py-8 bg-white">
            <div className="container-1200">
                {/* Mobile Skeleton */}
                <div className="lg:hidden flex flex-col gap-4">
                    <div className="flex gap-4 overflow-x-hidden pb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`cat-skel-mob-1-${i}`} className="flex flex-col items-center gap-2">
                                <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
                                <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 overflow-x-hidden pb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`cat-skel-mob-2-${i}`} className="flex flex-col items-center gap-2">
                                <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
                                <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Skeleton */}
                <div className="hidden lg:grid grid-cols-12 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`cat-skel-desk-${i}`} className="flex flex-col items-center gap-2 p-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
                            <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
