import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SecurityScanner = ({
  scanResults,
  onRunScan,
  onRemediate,
  isScanning,
}) => {
  const [remediatingAction, setRemediatingAction] = useState(null);

  const findings = scanResults?.findings || [];
  const summary = scanResults?.summary || {
    totalFindings: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    warning: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
  };

  const handleRemediate = async (action) => {
    if (!action) return;
    try {
      setRemediatingAction(action);
      await onRemediate(action);
    } finally {
      setRemediatingAction(null);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Info className="w-3.5 h-3.5" /> INFO / OPTIMIZED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Trigger & Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Live Vulnerability & Policy Scanner
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Deep automated inspection across cryptographic keys, tenant partitioning, rate-limiters,
            and document vaults.
          </p>
        </div>

        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning Infrastructure...' : 'Initiate Security Audit'}
        </button>
      </div>

      {/* Severity Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/40 border border-rose-500/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Critical Findings
            </span>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {summary.critical}
          </div>
          <p className="text-xs text-slate-400 mt-1">Immediate action required</p>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-amber-500/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Warning Findings
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {summary.warning}
          </div>
          <p className="text-xs text-slate-400 mt-1">Recommended governance hardening</p>
        </div>

        <div className="rounded-xl bg-slate-900/40 border border-blue-500/20 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Compliant & Verified
            </span>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {summary.info}
          </div>
          <p className="text-xs text-slate-400 mt-1">Passed all automated controls</p>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Scan Audit Results ({findings.length})
        </h4>

        {findings.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-slate-900/20 border border-slate-800">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-slate-300 font-medium">No vulnerabilities detected.</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Initiate Security Audit&quot; to run a fresh scan.
            </p>
          </div>
        ) : (
          findings.map((finding) => (
            <div
              key={finding.id}
              className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(finding.severity)}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {finding.category}
                  </span>
                  <h5 className="text-base font-semibold text-white tracking-tight">
                    {finding.title}
                  </h5>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {finding.description}
                </p>
              </div>

              {finding.remediationAction && (
                <div className="self-start md:self-center shrink-0">
                  <button
                    onClick={() => handleRemediate(finding.remediationAction)}
                    disabled={remediatingAction === finding.remediationAction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-500/50 transition-all disabled:opacity-50"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    {remediatingAction === finding.remediationAction
                      ? 'Applying Fix...'
                      : 'Auto-Remediate'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
