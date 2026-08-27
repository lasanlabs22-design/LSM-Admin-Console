export function SkeletonCard() {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-5 w-16 ml-auto" />
      </div>
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1.5" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card p-4">
      <div className="skeleton h-3 w-20 mb-3" />
      <div className="skeleton h-8 w-12" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
