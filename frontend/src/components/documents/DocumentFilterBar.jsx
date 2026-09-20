import React from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  LayoutGrid,
  List,
  FileText,
  Palette,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  Link as LinkIcon,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Files' },
  { id: 'deliverable', label: 'Deliverables' },
  { id: 'contract', label: 'Contracts' },
  { id: 'design', label: 'Designs' },
  { id: 'invoice', label: 'Invoices' },
  { id: 'brief', label: 'Briefs' },
  { id: 'asset', label: 'Assets' },
  { id: 'other', label: 'Other' },
];

export default function DocumentFilterBar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  clientFilter,
  setClientFilter,
  projectFilter,
  setProjectFilter,
  clients = [],
  projects = [],
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  onOpenUpload,
}) {
  return (
    <div className="space-y-4">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, file name, client, or tags..."
            className="w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="size-large">Largest File</option>
            <option value="size-small">Smallest File</option>
            <option value="title-az">Title (A-Z)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-neutral-900/80 border border-neutral-800 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Upload CTA */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
