import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = false,
  bordered = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-neutral-900 ${
        bordered ? 'border border-neutral-800' : ''
      } ${
        hoverable
          ? 'hover:border-neutral-700 hover:bg-neutral-850/80 transition-all cursor-pointer'
          : ''
      } shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', action }) {
  return (
    <div
      className={`px-5 py-4 border-b border-neutral-800/80 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="space-y-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-semibold text-neutral-100 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-xs text-neutral-400 leading-normal ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-5 py-3.5 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between gap-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
