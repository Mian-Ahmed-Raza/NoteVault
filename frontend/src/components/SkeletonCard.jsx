import React from 'react';

const SkeletonCard = () => (
  <div className="glass-card p-5 flex flex-col gap-4">
    {/* Header */}
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-xl shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 shimmer rounded-lg w-3/4" />
        <div className="h-3 shimmer rounded-lg w-1/2" />
        <div className="h-5 shimmer rounded-md w-12" />
      </div>
    </div>

    {/* Description */}
    <div className="space-y-1.5">
      <div className="h-3 shimmer rounded w-full" />
      <div className="h-3 shimmer rounded w-4/5" />
    </div>

    {/* Tags */}
    <div className="flex gap-2">
      <div className="h-5 w-14 shimmer rounded-full" />
      <div className="h-5 w-18 shimmer rounded-full" />
      <div className="h-5 w-12 shimmer rounded-full" />
    </div>

    {/* Footer */}
    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full shimmer" />
        <div className="space-y-1">
          <div className="h-3 w-16 shimmer rounded" />
          <div className="h-2 w-10 shimmer rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-6 h-6 rounded shimmer" />
        <div className="w-6 h-6 rounded shimmer" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="glass-card p-5 space-y-3">
        <div className="w-10 h-10 rounded-xl shimmer" />
        <div className="h-7 w-16 shimmer rounded" />
        <div className="h-3 w-24 shimmer rounded" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;