import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import Input from './Input';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Filter records...',
  searchKey,
  emptyTitle = 'No data available',
  emptyDescription = 'No records have been added or matched your filters yet.',
  onRowClick,
  pagination = true,
  initialRowsPerPage = 5,
  actions,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Sorting handler
  const handleSort = (key) => {
    if (sortColumn === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) => {
        if (searchKey) {
          const val = row[searchKey];
          return typeof val === 'string' && val.toLowerCase().includes(q);
        }
        return Object.values(row).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q)
        );
      });
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        return sortDirection === 'asc' ? 1 : -1;
      });
    }

    return result;
  }, [data, searchTerm, searchKey, sortColumn, sortDirection]);

  // Pagination slice
  const totalPages = Math.ceil(processedData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage, pagination]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Controls: Search and Actions */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {searchable && (
            <div className="max-w-xs w-full">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                leftIcon={Search}
                clearable={true}
                onClear={() => setSearchTerm('')}
              />
            </div>
          )}

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider select-none">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-4 py-3 ${
                      col.sortable ? 'cursor-pointer hover:text-neutral-200 transition' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-neutral-500">
                          {sortColumn === col.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 text-neutral-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/60 text-xs text-neutral-300">
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={columns.length} className="p-0">
                      <Skeleton variant="table-row" />
                    </td>
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-6">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row._id || row.id || idx}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors ${
                      onRowClick ? 'hover:bg-neutral-850 cursor-pointer' : 'hover:bg-neutral-850/40'
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {pagination && !loading && processedData.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-800/80 bg-neutral-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-neutral-200">{Math.min(processedData.length, (currentPage - 1) * rowsPerPage + 1)}</strong> to{' '}
                <strong className="text-neutral-200">
                  {Math.min(processedData.length, currentPage * rowsPerPage)}
                </strong>{' '}
                of <strong className="text-neutral-200">{processedData.length}</strong> entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-xs text-neutral-300 px-1">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
