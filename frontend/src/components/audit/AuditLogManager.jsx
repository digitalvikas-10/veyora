import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  ShieldCheck,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Plus,
  SlidersHorizontal,
  Inbox,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import AuditMetrics from './AuditMetrics';
import AuditFilterBar from './AuditFilterBar';
import AuditLogTable from './AuditLogTable';
import AuditDetailModal from './AuditDetailModal';
import AuditCheckpointModal from './AuditCheckpointModal';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function AuditLogManager() {
  const {
    auditLogs,
    auditLogStats,
    fetchAuditLogs,
    fetchAuditLogStats,
    recordAuditCheckpoint,
    exportAuditLogs,
    loadingStates,
  } = useData();

  const { user } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('All Entities');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [timeframe, setTimeframe] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [selectedLog, setSelectedLog] = useState(null);
  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAuditLogs({ limit: 100 });
    fetchAuditLogStats();
  }, [fetchAuditLogs, fetchAuditLogStats]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Entity Filter
      if (entityFilter !== 'All Entities') {
        const typeMatch = log.entityType?.toLowerCase() === entityFilter.toLowerCase();
        if (!typeMatch) return false;
      }

      // Action Filter
      if (actionFilter !== 'All Actions') {
        const actMatch = log.action?.toUpperCase() === actionFilter.toUpperCase();
        if (!actMatch) return false;
      }

      // Timeframe Filter
      if (timeframe !== 'all' && log.createdAt) {
        const logDate = new Date(log.createdAt).getTime();
        const now = Date.now();
        if (timeframe === 'today' && now - logDate > 24 * 60 * 60 * 1000) return false;
        if (timeframe === 'week' && now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
        if (timeframe === 'month' && now - logDate > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const actionMatch = log.action?.toLowerCase().includes(query);
        const entityMatch = log.entityType?.toLowerCase().includes(query);
        const entityIdMatch = log.entityId?.toLowerCase().includes(query);
        const actorNameMatch = log.actorName?.toLowerCase().includes(query);
        const actorEmailMatch = log.actorEmail?.toLowerCase().includes(query);
        const ipMatch = log.ipAddress?.toLowerCase().includes(query);
        const notesMatch = log.details?.notes?.toLowerCase().includes(query);
        return (
          actionMatch ||
          entityMatch ||
          entityIdMatch ||
          actorNameMatch ||
          actorEmailMatch ||
          ipMatch ||
          notesMatch
        );
      }

      return true;
    });
  }, [auditLogs, entityFilter, actionFilter, timeframe, searchTerm]);

  // Paginated slice
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchAuditLogs({ limit: 100 }),
        fetchAuditLogStats(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header Card */}
      <Card className="p-6 relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                  <span>Audit Logs & Activity History</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Immutable multi-tenant compliance trail, actor IP logging, raw diff payload inspection, and SOC 2 / GDPR audit exports
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-neutral-800 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh Ledger</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportAuditLogs('csv')}
              className="border-neutral-800 text-emerald-300 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCheckpointModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 font-medium shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Checkpoint</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Audit KPI Cards */}
      <AuditMetrics logs={auditLogs} stats={auditLogStats} />

      {/* Main Audit Trail Feed & Data Table */}
      <Card className="p-5 space-y-4 border-neutral-800 bg-neutral-950/60">
        {/* Search & Filter Controls */}
        <AuditFilterBar
          searchTerm={searchTerm}
          onSearchChange={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          entityFilter={entityFilter}
          onEntityFilterChange={(val) => {
            setEntityFilter(val);
            setCurrentPage(1);
          }}
          actionFilter={actionFilter}
          onActionFilterChange={(val) => {
            setActionFilter(val);
            setCurrentPage(1);
          }}
          timeframe={timeframe}
          onTimeframeChange={(tf) => {
            setTimeframe(tf);
            setCurrentPage(1);
          }}
          onExportCSV={() => exportAuditLogs('csv')}
          onExportJSON={() => exportAuditLogs('json')}
          onOpenCheckpointModal={() => setCheckpointModalOpen(true)}
          totalCount={filteredLogs.length}
        />

        {/* Audit Log Table or Empty State */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700/60">
              <Inbox className="w-6 h-6 text-neutral-500" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-neutral-200">
                {searchTerm || entityFilter !== 'All Entities' || actionFilter !== 'All Actions'
                  ? 'No matching audit records'
                  : 'No audit records in this workspace yet'}
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {searchTerm || entityFilter !== 'All Entities' || actionFilter !== 'All Actions'
                  ? 'Try modifying your search criteria or resetting filters.'
                  : 'All client mutations, financial transactions, and compliance checkpoints will be recorded here.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCheckpointModalOpen(true)}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Record Compliance Checkpoint
              </Button>
              {(searchTerm || entityFilter !== 'All Entities' || actionFilter !== 'All Actions') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setEntityFilter('All Entities');
                    setActionFilter('All Actions');
                    setTimeframe('all');
                  }}
                  className="text-xs"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AuditLogTable
              logs={paginatedLogs}
              onSelectLog={(log) => setSelectedLog(log)}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60 text-xs">
              <div className="text-neutral-400">
                Showing{' '}
                <span className="font-semibold text-neutral-200">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-neutral-200">
                  {Math.min(currentPage * pageSize, filteredLogs.length)}
                </span>{' '}
                of <span className="font-semibold text-neutral-200">{filteredLogs.length}</span> audit logs
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 h-auto text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>

                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 h-auto text-xs disabled:opacity-40"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <AuditDetailModal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />

      <AuditCheckpointModal
        isOpen={checkpointModalOpen}
        onClose={() => setCheckpointModalOpen(false)}
        onSubmit={recordAuditCheckpoint}
      />
    </div>
  );
}
