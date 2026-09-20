import React, { useState } from 'react';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

const STATUS_INDICATORS = {
  online: 'bg-emerald-400',
  offline: 'bg-neutral-500',
  busy: 'bg-rose-400',
  away: 'bg-amber-400',
};

// Deterministic subtle palette based on initials
const PALETTES = [
  'bg-indigo-600/20 text-indigo-300 border-indigo-500/30',
  'bg-purple-600/20 text-purple-300 border-purple-500/30',
  'bg-blue-600/20 text-blue-300 border-blue-500/30',
  'bg-emerald-600/20 text-emerald-300 border-emerald-500/30',
  'bg-amber-600/20 text-amber-300 border-amber-500/30',
  'bg-rose-600/20 text-rose-300 border-rose-500/30',
  'bg-cyan-600/20 text-cyan-300 border-cyan-500/30',
];

function getInitials(name = '') {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
}

export function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className = '',
}) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;
  const initials = getInitials(name || alt);
  const palette = getPalette(name || alt);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`rounded-full border flex items-center justify-center font-bold select-none overflow-hidden ${sizeClass} ${
          src && !imageError ? 'border-neutral-700 bg-neutral-900' : palette
        }`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && STATUS_INDICATORS[status] && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-neutral-950 ${STATUS_INDICATORS[status]}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ children, max = 3, size = 'sm', className = '' }) {
  const arrayChildren = React.Children.toArray(children);
  const visibleAvatars = arrayChildren.slice(0, max);
  const excess = arrayChildren.length - max;

  return (
    <div className={`flex items-center -space-x-2 overflow-hidden ${className}`}>
      {visibleAvatars.map((child, index) => (
        <div key={index} className="ring-2 ring-neutral-950 rounded-full">
          {React.cloneElement(child, { size })}
        </div>
      ))}

      {excess > 0 && (
        <div
          className={`flex items-center justify-center rounded-full bg-neutral-800 text-neutral-300 font-mono font-semibold ring-2 ring-neutral-950 border border-neutral-700 ${
            SIZES[size] || SIZES.sm
          }`}
        >
          +{excess}
        </div>
      )}
    </div>
  );
}

export default Avatar;
