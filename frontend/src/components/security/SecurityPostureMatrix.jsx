import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  FileCode,
  GlobeLock,
  History,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';

export const SecurityPostureMatrix = ({ checks = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedCheckId, setExpandedCheckId] = useState(null);

  const categories = ['ALL', ...Array.from(new Set(checks.map((c) => c.category)))];

  const filteredChecks =
    selectedCategory === 'ALL'
      ? checks
      : checks.filter((c) => c.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Architecture & Isolation':
        return <Layers className="w-4 h-4 text-emerald-400" />;
      case 'Identity & Access':
        return <Lock className="w-4 h-4 text-indigo-400" />;
      case 'Application Defense':
        return <FileCode className="w-4 h-4 text-cyan-400" />;
      case 'Network & API Defense':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
      case 'Cryptography & Tokens':
        return <KeyRound className="w-4 h-4 text-amber-400" />;
      case 'Transport & Headers':
        return <GlobeLock className="w-4 h-4 text-purple-400" />;
      case 'Compliance & Governance':
        return <History className="w-4 h-4 text-emerald-400" />;
      case 'Perimeter Security':
        return <GlobeLock className="w-4 h-4 text-rose-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <Filter className="w-4 h-4 text-indigo-400" />
          Filter Security Vectors:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posture Control Matrix */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="divide-y divide-slate-800">
          {filteredChecks.map((check) => {
            const isExpanded = expandedCheckId === check.id;
            return (
              <div
                key={check.id}
                className="p-5 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 mt-0.5 sm:mt-0">
                      {getCategoryIcon(check.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="text-base font-semibold text-white tracking-tight">
                          {check.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {check.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          {check.score}/{check.maxScore} pts
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        {check.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setExpandedCheckId(isExpanded ? null : check.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                    >
                      {isExpanded ? (
                        <>
                          Less <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          Compliance & Spec <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Frameworks & Spec */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/80">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                        Compliance Framework Mapping
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {check.frameworks?.map((fw) => (
                          <span
                            key={fw}
                            className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono font-medium"
                          >
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-950/60 rounded-lg p-3.5 border border-slate-800/80">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block">
                        Defense Verification
                      </span>
                      <p className="text-slate-300">
                        This control is enforced synchronously at the Express middleware gateway and
                        verified via automated regression suites.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
