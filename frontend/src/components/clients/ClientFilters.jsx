import React from 'react';
import { Search, Plus, Filter, Download, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { Button, Input, Select, Badge } from '../ui';

export const ClientFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  tagFilter,
  onTagChange,
  availableTags = [],
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onNewClient,
  onExportCSV,
  totalCount,
  filteredCount,
}) => {
  const STATUS_TABS = [
    { id: 'all', label: 'All Clients' },
    { id: 'active', label: 'Active' },
    { id: 'lead', label: 'Leads' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'archived', label: 'Archived' },
  ];

  const SORT_OPTIONS = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'name_asc', label: 'Name (A - Z)' },
    { value: 'name_desc', label: 'Name (Z - A)' },
    { value: 'billed_desc', label: 'Highest Billed' },
    { value: 'paid_desc', label: 'Highest Paid' },
  ];

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || tagFilter !== 'all';

  return (
    <div className="space-y-3">
      {/* Top row: Status Tabs & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Action buttons: Export CSV & New Client */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="text-xs flex items-center gap-1.5 border-neutral-800 text-neutral-300 hover:text-neutral-100"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onNewClient}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </Button>
        </div>
      </div>

      {/* Second row: Search, Tag Selector, Sort & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by client name, company, email..."
            className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <select
              value={tagFilter}
              onChange={(e) => onTagChange(e.target.value)}
              aria-label="Filter by client tag"
              className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  Tag: {tag}
                </option>
              ))}
            </select>
          )}

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort client list order"
            className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* View Mode Toggle: Table / Grid */}
          <div className="flex items-center border border-neutral-800 rounded-lg p-0.5 bg-neutral-950">
            <button
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'table'
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid Cards View"
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Match counter & Reset status */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <div>
          Showing <span className="font-semibold text-neutral-300">{filteredCount}</span> of{' '}
          <span className="font-semibold text-neutral-300">{totalCount}</span> clients
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange('');
              onStatusChange('all');
              onTagChange('all');
            }}
            className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear active filters
          </button>
        )}
      </div>
    </div>
  );
};
