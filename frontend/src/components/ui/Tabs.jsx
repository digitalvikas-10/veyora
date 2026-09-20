import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'pills', // 'pills' | 'underline' | 'segment'
  className = '',
}) {
  return (
    <div
      className={`flex items-center gap-1 ${
        variant === 'segment'
          ? 'p-1 rounded-xl bg-neutral-950 border border-neutral-800'
          : variant === 'underline'
          ? 'border-b border-neutral-800 gap-4'
          : 'gap-2'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-2.5 px-1 text-xs font-medium transition-all relative flex items-center gap-2 ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-400 font-mono">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        }

        if (variant === 'segment') {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-900 text-neutral-400 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        }

        // Default 'pills'
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
              isActive
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
