import React from 'react';

const VARIANTS = {
  neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700/80',
  brand: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
};

const DOT_COLORS = {
  neutral: 'bg-neutral-400',
  brand: 'bg-indigo-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  purple: 'bg-purple-400',
  cyan: 'bg-cyan-400',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-xs',
};

// Domain status preset mapping
const STATUS_MAP = {
  active: { variant: 'success', label: 'Active', dot: true },
  inactive: { variant: 'neutral', label: 'Inactive', dot: false },
  lead: { variant: 'cyan', label: 'Lead', dot: true },
  churned: { variant: 'danger', label: 'Churned', dot: false },
  planning: { variant: 'purple', label: 'Planning', dot: true },
  in_progress: { variant: 'brand', label: 'In Progress', dot: true },
  on_hold: { variant: 'warning', label: 'On Hold', dot: true },
  completed: { variant: 'success', label: 'Completed', dot: false },
  cancelled: { variant: 'danger', label: 'Cancelled', dot: false },
  draft: { variant: 'neutral', label: 'Draft', dot: false },
  sent: { variant: 'brand', label: 'Sent', dot: true },
  viewed: { variant: 'purple', label: 'Viewed', dot: true },
  paid: { variant: 'success', label: 'Paid', dot: false },
  overdue: { variant: 'danger', label: 'Overdue', dot: true },
  todo: { variant: 'neutral', label: 'To Do', dot: false },
  review: { variant: 'warning', label: 'In Review', dot: true },
  high: { variant: 'danger', label: 'High Priority', dot: true },
  medium: { variant: 'warning', label: 'Medium Priority', dot: false },
  low: { variant: 'neutral', label: 'Low Priority', dot: false },
  urgent: { variant: 'danger', label: 'Urgent', dot: true },
};

export default function Badge({
  children,
  variant = 'neutral',
  status,
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
}) {
  let resolvedVariant = variant;
  let resolvedText = children;
  let hasDot = dot;

  if (status && STATUS_MAP[status.toLowerCase()]) {
    const config = STATUS_MAP[status.toLowerCase()];
    resolvedVariant = config.variant;
    resolvedText = children || config.label;
    hasDot = dot || config.dot;
  }

  const variantClass = VARIANTS[resolvedVariant] || VARIANTS.neutral;
  const sizeClass = SIZES[size] || SIZES.md;
  const dotColorClass = DOT_COLORS[resolvedVariant] || DOT_COLORS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border select-none tracking-wide ${variantClass} ${sizeClass} ${className}`}
    >
      {hasDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorClass}`} />
      )}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="whitespace-nowrap">{resolvedText}</span>
    </span>
  );
}
