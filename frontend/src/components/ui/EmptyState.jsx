import React from 'react';
import { FolderOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria in this workspace.',
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) {
  return (
    <div
      className={`p-10 rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center shadow-inner">
        <Icon className="w-6 h-6 text-neutral-400" />
      </div>

      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-semibold text-neutral-200">{title}</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-2 pt-2">
          {actionLabel && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
