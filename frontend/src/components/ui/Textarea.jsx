import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Textarea({
  id,
  label,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  maxLength,
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const textareaId = id || (name ? `textarea-${name}` : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-medium text-neutral-300">
            {label}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-neutral-500 font-mono">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full text-xs text-neutral-100 placeholder:text-neutral-500 bg-neutral-950 rounded-xl border transition p-3 outline-none focus:ring-2 resize-y ${
          error
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-neutral-800 focus:border-indigo-500 focus:ring-indigo-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-900' : ''}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-neutral-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}
