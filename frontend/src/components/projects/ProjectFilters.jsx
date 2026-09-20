import React from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Table,
  Kanban,
  LayoutGrid,
  FileSpreadsheet,
  X,
  Filter,
} from 'lucide-react';
import { Button, Input } from '../ui';

export const ProjectFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  clientFilter,
  onClientChange,
  clients = [],
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onNewProject,
  onExportCSV,
  totalCount = 0,
  filteredCount = 0,
}) => {
  const STATUSES = [
    { id: 'all', label: 'All Projects' },
    { id: 'planning', label: 'Planning' },
    { id: 'active', label: 'Active' },
    { id: 'on-hold', label: 'On Hold' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const PRIORITIES = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const SORT_OPTIONS = [
    { value: 'createdAt_desc', label: 'Newest First' },
    { value: 'name_asc', label: 'Project Name (A-Z)' },
    { value: 'budget_desc', label: 'Budget (High to Low)' },
    { value: 'progress_desc', label: 'Progress % (Highest)' },
    { value: 'targetDate_asc', label: 'Target Date (Earliest)' },
  ];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    clientFilter !== 'all' ||
    priorityFilter !== 'all';

  const handleResetFilters = () => {
    onSearchChange('');
    onStatusChange('all');
    onClientChange('all');
    onPriorityChange('all');
  };

  return (
    <div className="space-y-3 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
      {/* Top Row: Search, Client Select, Priority, Sort, View, New Project */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects by name, code, description..."
            className="w-full pl-9 pr-8 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
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

        {/* Filter Selectors & View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => onClientChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('board')}
              title="Kanban Board View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              title="Table Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CSV Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="text-xs border-neutral-800 text-neutral-300 hover:text-white flex items-center gap-1.5"
            title="Export filtered projects to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Create Project Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onNewProject}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Bottom Row: Status Filter Tabs & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUSES.map((status) => {
            const isSelected = statusFilter === status.id;
            return (
              <button
                key={status.id}
                onClick={() => onStatusChange(status.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>
            Showing <strong className="text-neutral-200">{filteredCount}</strong> of{' '}
            <strong className="text-neutral-200">{totalCount}</strong> projects
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-indigo-400 hover:text-indigo-300 underline text-[11px] ml-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
