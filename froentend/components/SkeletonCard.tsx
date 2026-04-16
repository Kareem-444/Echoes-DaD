import React from 'react';

interface SkeletonCardProps {
  variant?: 'echo' | 'match';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'echo' }) => {
  if (variant === 'match') {
    return (
      <div className="echo-bubble bg-surface-container-lowest p-6 animate-pulse">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-surface-container-high rounded-full" />
                <div className="h-3 w-40 bg-surface-container-high rounded-full" />
              </div>
              <div className="h-5 w-24 bg-surface-container-high rounded-full" />
            </div>
            <div className="h-4 w-full bg-surface-container-high rounded-full" />
            <div className="h-4 w-3/4 bg-surface-container-high rounded-full" />
            <div className="flex justify-between pt-2">
              <div className="h-3 w-20 bg-surface-container-high rounded-full" />
              <div className="h-9 w-28 bg-surface-container-high rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="echo-bubble bg-surface-container-lowest p-7 animate-pulse">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-full bg-surface-container-high flex-shrink-0" />
        <div className="flex-1 pt-1 space-y-2">
          <div className="h-5 w-28 bg-surface-container-high rounded-full" />
          <div className="h-3 w-20 bg-surface-container-high rounded-full" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-5 w-full bg-surface-container-high rounded-full" />
        <div className="h-5 w-4/5 bg-surface-container-high rounded-full" />
        <div className="h-5 w-2/3 bg-surface-container-high rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-40 bg-surface-container-high rounded-full" />
        <div className="h-6 w-6 bg-surface-container-high rounded-full" />
      </div>
    </div>
  );
};
