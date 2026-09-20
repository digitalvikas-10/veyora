import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

export default function Select({
  id,
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const selectId = id || (name ? `select-${name}` : undefined);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-neutral-300">
          {label}
          {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-xs text-neutral-100 bg-neutral-950 rounded-xl border transition px-3 py-2 pr-9 outline-none appearance-none focus:ring-2 cursor-pointer ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-neutral-800 focus:border-indigo-500 focus:ring-indigo-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-900' : ''}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-neutral-900 text-neutral-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="bg-neutral-900 text-neutral-200">
                {lbl}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 flex items-center pointer-events-none text-neutral-500">
          {error ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </div>
      </div>

      {error ? (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-neutral-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
