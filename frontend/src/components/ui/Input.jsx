import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function Input({
  id,
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  helperText,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  clearable = false,
  onClear,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const inputId = id || (name ? `input-${name}` : undefined);

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-medium text-neutral-300">
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-neutral-500">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full text-xs text-neutral-100 placeholder:text-neutral-500 bg-neutral-950 rounded-xl border transition px-3 py-2 outline-none focus:ring-2 ${
            LeftIcon ? 'pl-9' : ''
          } ${RightIcon || clearable || error ? 'pr-9' : ''} ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-neutral-800 focus:border-indigo-500 focus:ring-indigo-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-900' : ''}`}
          {...props}
        />

        <div className="absolute right-3 flex items-center gap-1.5 text-neutral-500">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="text-neutral-500 hover:text-neutral-300 transition p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {error ? (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          ) : RightIcon ? (
            <RightIcon className="w-4 h-4" />
          ) : null}
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
