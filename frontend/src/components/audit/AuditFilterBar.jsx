import React from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileCode,
  Plus,
  Shield,
  Layers,
  Clock,
  X,
} from 'lucide-react';
import Button from '../ui/Button';
import PermissionGate from '../common/PermissionGate';

const ENTITY_TYPES = [
  'All Entities',
  'Client',
  'Project',
  'Task',
  'Invoice',
  'Proposal',
  'Document',
  'Workspace',
  'Security',
];

const ACTION_TYPES = [
  'All Actions',
  'CREATE',
  'UPDATE',
  'DELETE',
  'SIGN',
  'PAY',
  'UPLOAD',
  'TIME_LOG',
  'CHECKPOINT',
];

const TIMEFRAMES = [
  { id: 'all', label: 'All History' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Past 7 Days' },
  { id: 'month', label: 'Past 30 Days' },
];

export default function AuditFilterBar({
  searchTerm = '',
  onSearchChange,
  entityFilter = 'All Entities',
  onEntityFilterChange,
  actionFilter = 'All Actions',
  onActionFilterChange,
  timeframe = 'all',
  onTimeframeChange,
  onExportCSV,
  onExportJSON,
  onOpenCheckpointModal,
  totalCount = 0,
}) {
  return (
    <div className="space-y-3.5">
      {/* Top Row: Search + Quick Export Buttons + Record Checkpoint */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search action, actor, email, entity ID, or IP..."
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

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            className="border-neutral-800 text-neutral-300 hover:text-emerald-300 hover:border-emerald-500/40 text-xs flex items-center gap-1.5"
            title="Export SOC 2 / GDPR compliance CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          {/* Export JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={onExportJSON}
            className="border-neutral-800 text-neutral-300 hover:text-indigo-300 hover:border-indigo-500/40 text-xs flex items-center gap-1.5"
            title="Download structured JSON audit report"
          >
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </Button>

          {/* Record Checkpoint */}
          <PermissionGate
            permission="audit:read"
            fallback={
              <Button
                variant="primary"
                size="sm"
                disabled
                className="opacity-50 text-xs flex items-center gap-1.5"
                title="Requires Owner or Admin role"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Checkpoint</span>
              </Button>
            }
          >
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenCheckpointModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 font-medium shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Checkpoint</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Bottom Row: Entity Select, Action Select, Timeframe Pills */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-neutral-800/60">
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Entity Type Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={entityFilter}
              onChange={(e) => onEntityFilterChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Action Dropdown */}
          <div className="relative min-w-[140px]">
            <select
              value={actionFilter}
              onChange={(e) => onActionFilterChange(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
            >
              {ACTION_TYPES.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shrink-0">
          {TIMEFRAMES.map((tf) => {
            const isSelected = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
