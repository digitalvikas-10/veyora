import React from 'react';
import { Check } from 'lucide-react';

export default function Checkbox({
  id,
  name,
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  ...props
}) {
  const checkboxId = id || (name ? `checkbox-${name}` : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-start gap-2.5 cursor-pointer select-none group ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
            checked
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-neutral-950 border-neutral-700 group-hover:border-neutral-500'
          }`}
        >
          {checked && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && <span className="block text-xs font-medium text-neutral-200">{label}</span>}
          {description && (
            <span className="block text-[11px] text-neutral-500 mt-0.5">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}
