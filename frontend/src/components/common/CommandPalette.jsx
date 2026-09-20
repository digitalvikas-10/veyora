import React, { useState, useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useData } from '../../context/DataContext';
import {
  Search,
  Command,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  Shield,
  Layers,
  Code2,
  RefreshCw,
  Bell,
  Building2,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

export default function CommandPalette() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, addToast } = useUI();
  const { switchPersona, user } = useAuth();
  const { workspaces, changeWorkspace, currentWorkspace } = useWorkspace();
  const { refreshAllData } = useData();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const ACTIONS = [
    // Navigation
    {
      id: 'nav-api',
      category: 'Navigation',
      label: 'Go to REST API Explorer',
      hint: 'Phase 7 Architecture',
      icon: Code2,
      action: () => {
        const el = document.getElementById('phase-7-api-architecture');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'nav-schemas',
      category: 'Navigation',
      label: 'Inspect Mongoose Schemas',
      hint: 'Phase 6 Schemas',
      icon: Layers,
      action: () => {
        const el = document.getElementById('phase-6-schemas-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'nav-rbac',
      category: 'Navigation',
      label: 'Inspect RBAC & Matrix',
      hint: 'Phase 4 Authorization',
      icon: Shield,
      action: () => {
        const el = document.getElementById('phase-4-rbac-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'nav-tenancy',
      category: 'Navigation',
      label: 'Workspace Isolation Center',
      hint: 'Phase 5 Multi-Tenancy',
      icon: Building2,
      action: () => {
        const el = document.getElementById('phase-5-tenancy-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },

    // Actions
    {
      id: 'act-refresh',
      category: 'Quick Actions',
      label: 'Synchronize All Tenant Stores',
      hint: 'Invalidate & refresh active workspace data',
      icon: RefreshCw,
      action: async () => {
        await refreshAllData();
        addToast({ type: 'success', title: 'Stores Synchronized', message: 'All domain stores re-fetched.' });
      },
    },
    {
      id: 'act-toast-test',
      category: 'Quick Actions',
      label: 'Dispatch Test Toast Notification',
      hint: 'Validates UIContext toast dispatcher',
      icon: Sparkles,
      action: () => {
        addToast({
          type: 'success',
          title: 'Command Executed',
          message: 'UI notification pipeline verified via Command Palette shortcut.',
        });
      },
    },
  ];

  // Dynamic Workspace items
  const workspaceActions = (workspaces || []).map((wsItem, idx) => {
    const ws = wsItem?.workspace || wsItem;
    const wsId = ws?._id || ws?.id || wsItem?._id || wsItem?.id || `ws-${idx}`;
    const wsName = ws?.name || wsItem?.name || 'Workspace';
    const wsSlug = ws?.slug || wsItem?.slug || '';
    const wsPlan = (ws?.plan || wsItem?.plan || 'ENTERPRISE').toUpperCase();
    return {
      id: `ws-${wsId}-${idx}`,
      category: 'Switch Workspace',
      label: `Switch to ${wsName}`,
      hint: `${wsPlan} Plan • ${wsSlug}`,
      icon: Building2,
      action: async () => {
        await changeWorkspace(wsId);
        addToast({ type: 'success', title: 'Workspace Changed', message: `Active workspace set to ${wsName}.` });
      },
    };
  });

  const allItems = [...ACTIONS, ...workspaceActions];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          (item.hint && item.hint.toLowerCase().includes(query.toLowerCase()))
      )
    : allItems;

  const handleSelect = (item) => {
    if (!item) return;
    setIsCommandPaletteOpen(false);
    item.action();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, navigate phases, switch personas..."
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-neutral-700">
              ESC
            </kbd>
            <button
              onClick={() => setIsCommandPaletteOpen(false)}
              className="text-neutral-400 hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No matching commands or actions found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-indigo-600/15 border border-indigo-500/30 text-neutral-100'
                      : 'text-neutral-300 hover:bg-neutral-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-medium block truncate">{item.label}</span>
                      {item.hint && (
                        <span className="text-[10px] text-neutral-500 block truncate">{item.hint}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-neutral-800/80 bg-neutral-950/60 text-[11px] text-neutral-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Dismiss</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-400">
            <Command className="w-3 h-3" />
            <span>VEYORA Global Actions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
