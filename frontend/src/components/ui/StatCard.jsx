import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  timeframe = 'vs last month',
  icon: Icon,
  badge,
  iconColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  className = '',
  onClick,
}) {
  const isPositive = changeType === 'increase';
  const isNegative = changeType === 'decrease';

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-3 transition ${
        onClick ? 'hover:border-neutral-700 cursor-pointer hover:bg-neutral-850/60' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-neutral-400 tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        {badge && !Icon && <div>{badge}</div>}
      </div>

      <div>
        <div className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
          {value}
        </div>

        {(change !== undefined || timeframe) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {change !== undefined && (
              <span
                className={`inline-flex items-center gap-1 font-semibold font-mono ${
                  isPositive
                    ? 'text-emerald-400'
                    : isNegative
                    ? 'text-rose-400'
                    : 'text-neutral-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isNegative ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                <span>{change}</span>
              </span>
            )}
            {timeframe && (
              <span className="text-neutral-500 text-[11px] truncate">{timeframe}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
