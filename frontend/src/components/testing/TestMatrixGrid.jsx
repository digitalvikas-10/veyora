import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  KeyRound,
  Users,
  Briefcase,
  Layers,
  FileCheck,
  CreditCard,
  FolderOpen,
  Bell,
  History,
  Activity,
} from 'lucide-react';

export const TestMatrixGrid = ({ testCases = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['ALL', ...Array.from(new Set(testCases.map((tc) => tc.category)))];

  const filteredTests = testCases.filter((tc) => {
    const matchesCategory = selectedCategory === 'ALL' || tc.category === selectedCategory;
    const matchesSearch =
      tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tc.details && tc.details.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'System Diagnostics':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'Auth & Token Engine':
        return <KeyRound className="w-4 h-4 text-amber-400" />;
      case 'Multi-Tenant Isolation':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'RBAC & Permissions':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'Client Operations':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'Project Management':
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      case 'Task Tracking':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'Proposal Engine':
        return <FileCheck className="w-4 h-4 text-amber-400" />;
      case 'Invoicing & Ledger':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case 'Document Vault':
        return <FolderOpen className="w-4 h-4 text-indigo-400" />;
      case 'Notification Engine':
        return <Bell className="w-4 h-4 text-amber-400" />;
      case 'Audit & Compliance':
        return <History className="w-4 h-4 text-blue-400" />;
      case 'Security Hardening':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test assertions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Test Matrix List */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        {filteredTests.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No test assertions match your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTests.map((test) => {
              const isExpanded = expandedId === test.id;
              const isPassed = test.status === 'passed';

              return (
                <div
                  key={test.id}
                  className="p-4 hover:bg-slate-900/80 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 mt-0.5 sm:mt-0">
                        {getCategoryIcon(test.category)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-500">
                            {test.id}
                          </span>
                          <h4 className="text-sm font-semibold text-white tracking-tight">
                            {test.name}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                              isPassed
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> PASSED
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> FAILED
                              </>
                            )}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {test.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-1">
                          {test.details || test.error}
                        </p>
                      </div>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : test.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                      >
                        {isExpanded ? (
                          <>
                            Collapse <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Telemetry <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Assertion Trace */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
                          Assertion Output Details
                        </span>
                        <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                          {test.details || test.error}
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block font-sans">
                          Execution Metadata
                        </span>
                        <div className="text-slate-300 space-y-0.5">
                          <div>Category: <span className="text-indigo-300">{test.category}</span></div>
                          <div>Timestamp: <span className="text-slate-400">{test.timestamp}</span></div>
                          <div>Status: <span className="text-emerald-400">{test.status.toUpperCase()}</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
