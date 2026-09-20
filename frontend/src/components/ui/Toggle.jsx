import React from 'react';

export default function Toggle({
  id,
  name,
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}) {
  const toggleId = id || (name ? `toggle-${name}` : undefined);

  const SIZES = {
    sm: { track: 'w-7 h-4', thumb: 'w-3 h-3', translate: 'translate-x-3' },
    md: { track: 'w-9 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-4' },
    lg: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-5' },
  };

  const currentSize = SIZES[size] || SIZES.md;

  const handleClick = (e) => {
    if (disabled) return;
    if (onChange) {
      onChange(!checked, e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {(label || description) && (
        <div className="flex-1">
          {label && <span className="block text-xs font-medium text-neutral-200">{label}</span>}
          {description && (
            <span className="block text-[11px] text-neutral-500 mt-0.5">{description}</span>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={toggleId}
        disabled={disabled}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          currentSize.track
        } ${checked ? 'bg-indigo-600' : 'bg-neutral-800 border border-neutral-700'}`}
        {...props}
      >
        <span
          className={`pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            currentSize.thumb
          } ${checked ? `${currentSize.translate} bg-white` : 'translate-x-0.5 bg-neutral-400'}`}
        />
      </button>
    </div>
  );
}
