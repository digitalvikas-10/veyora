import React from 'react';
import {
  Search,
  Filter,
  CheckCheck,
  Trash2,
  Plus,
  Bell,
  Layers,
  CreditCard,
  FileCheck,
  Briefcase,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Button from '../ui/Button';

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'All Alerts', icon: Bell },
  { id: 'task_assigned', label: 'Tasks', icon: Layers },
  { id: 'invoice_paid', label: 'Billing & Invoices', icon: CreditCard },
  { id: 'proposal_signed', label: 'Proposals', icon: FileCheck },
  { id: 'project_update', label: 'Projects', icon: Briefcase },
  { id: 'system', label: 'System Notice', icon: Filter },
];

export default function NotificationFilterBar({
  searchTerm = '',
  onSearchChange,
  statusFilter = 'all', // 'all' | 'unread' | 'read'
  onStatusFilterChange,
  typeFilter = 'all',
  onTypeFilterChange,
  onMarkAllRead,
  onClearRead,
  onOpenCreateModal,
  unreadCount = 0,
  totalCount = 0,
}) {
  return (
    <div className="space-y-3">
      {/* Top Row: Search + Status Tabs + Primary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search alerts, messages, senders..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Bulk Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllRead}
              className="border-neutral-800 text-neutral-300 hover:text-indigo-300 hover:border-indigo-500/40 text-xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mark All Read</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClearRead}
            className="border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 text-xs flex items-center gap-1.5"
            title="Remove all read notifications from feed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Read</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 font-medium shadow-sm shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch Alert</span>
          </Button>
        </div>
      </div>

      {/* Bottom Row: Status Tabs & Category Type Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1 border-t border-neutral-800/60">
        {/* Status Pills */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Feed ({totalCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              statusFilter === 'unread'
                ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-500/30 text-indigo-300">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onStatusFilterChange('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'read'
                ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Read & Archived
          </button>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
          {NOTIFICATION_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = typeFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTypeFilterChange(t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300 font-semibold'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`w-3 h-3 ${isSelected ? 'text-indigo-400' : 'text-neutral-500'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
