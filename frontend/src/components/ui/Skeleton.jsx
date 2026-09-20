import React from 'react';

export default function Skeleton({
  variant = 'text', // 'text' | 'circular' | 'rectangular' | 'card' | 'table-row'
  width,
  height,
  className = '',
  count = 1,
}) {
  const baseClass = 'animate-pulse bg-neutral-800/80 rounded-lg';

  const renderSingle = (key) => {
    if (variant === 'circular') {
      return (
        <div
          key={key}
          style={{ width: width || 40, height: height || 40 }}
          className={`${baseClass} rounded-full shrink-0 ${className}`}
        />
      );
    }

    if (variant === 'card') {
      return (
        <div
          key={key}
          className={`p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 ${className}`}
        >
          <div className="flex justify-between items-center">
            <div className="h-3.5 w-24 bg-neutral-800 rounded animate-pulse" />
            <div className="h-7 w-7 bg-neutral-800 rounded-xl animate-pulse" />
          </div>
          <div className="h-7 w-32 bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-40 bg-neutral-800 rounded animate-pulse" />
        </div>
      );
    }

    if (variant === 'table-row') {
      return (
        <div
          key={key}
          className={`px-4 py-3.5 border-b border-neutral-800/60 flex items-center justify-between gap-4 ${className}`}
        >
          <div className="h-4 w-36 bg-neutral-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
          <div className="h-4 w-16 bg-neutral-800 rounded animate-pulse" />
          <div className="h-6 w-16 bg-neutral-800 rounded-full animate-pulse" />
        </div>
      );
    }

    return (
      <div
        key={key}
        style={{
          width: width || '100%',
          height: height || (variant === 'text' ? '1rem' : '2.5rem'),
        }}
        className={`${baseClass} ${className}`}
      />
    );
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => renderSingle(i))}
      </div>
    );
  }

  return renderSingle(0);
}
