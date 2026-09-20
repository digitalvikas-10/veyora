import React from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Statuses' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'partially_paid', label: 'Partially Paid' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function InvoiceFilterBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  clientFilter,
  setClientFilter,
  clients = [],
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onOpenCreate,
}) {
  const hasActiveFilters = search || statusFilter !== 'all' || clientFilter !== 'all' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setClientFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # (e.g. INV-2026-1001), line items, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-9 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Client Selector */}
          <div className="relative min-w-[150px]">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="all">All Clients ({clients.length})</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[140px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="due-soon">Sort: Due Date (Earliest)</option>
              <option value="amount-high">Sort: Amount (High-Low)</option>
              <option value="amount-low">Sort: Amount (Low-High)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-indigo-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-neutral-800 text-indigo-400 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Ledger Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Filter Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-neutral-400 hover:text-rose-400 bg-neutral-900 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Quick Create Invoice Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* Status Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((s) => {
          const isActive = statusFilter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800/80 hover:bg-neutral-800/50 hover:text-neutral-300'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
