import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm border border-indigo-500/50 active:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50',
  secondary: 'bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700/80 active:bg-neutral-850 focus-visible:ring-2 focus-visible:ring-neutral-600',
  outline: 'bg-transparent hover:bg-neutral-800/60 text-neutral-300 border border-neutral-700 active:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-600',
  ghost: 'bg-transparent hover:bg-neutral-800/60 text-neutral-300 hover:text-neutral-100 border border-transparent active:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-600',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/50 active:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500/50',
  subtle: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 active:bg-indigo-500/25 focus-visible:ring-2 focus-visible:ring-indigo-500/40',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-[11px] font-medium rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs font-medium rounded-xl gap-2',
  md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition select-none outline-none ${sizeClass} ${variantClass} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      
      {children && <span>{children}</span>}

      {!loading && RightIcon && <RightIcon className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
