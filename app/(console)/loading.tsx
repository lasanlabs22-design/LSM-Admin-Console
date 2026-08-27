import { SkeletonStat, SkeletonList } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="skeleton h-7 w-40 mb-2" />
        <div className="skeleton h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      <SkeletonList count={4} />
    </div>
  );
}