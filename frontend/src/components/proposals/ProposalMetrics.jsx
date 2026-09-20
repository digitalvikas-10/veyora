import React from 'react';
import { DollarSign, CheckCircle2, Clock, FileCheck2, TrendingUp, AlertCircle } from 'lucide-react';

export default function ProposalMetrics({ proposals = [] }) {
  // Aggregate financial and lifecycle metrics
  const totalCount = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === 'accepted');
  const pendingProposals = proposals.filter((p) => ['sent', 'viewed'].includes(p.status));
  const draftProposals = proposals.filter((p) => p.status === 'draft');

  const totalPipelineValue = proposals.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const acceptedValue = acceptedProposals.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const pendingValue = pendingProposals.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

  const winRate = totalCount > 0 ? Math.round((acceptedProposals.length / totalCount) * 100) : 0;
  const avgDealSize = totalCount > 0 ? Math.round(totalPipelineValue / totalCount) : 0;

  const metrics = [
    {
      label: 'Total Pipeline',
      value: `$${totalPipelineValue.toLocaleString()}`,
      subtext: `${totalCount} active proposals`,
      icon: DollarSign,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Accepted Contracts',
      value: `$${acceptedValue.toLocaleString()}`,
      subtext: `${acceptedProposals.length} signed (${winRate}% win rate)`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Awaiting Signature',
      value: `$${pendingValue.toLocaleString()}`,
      subtext: `${pendingProposals.length} dispatched to clients`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Avg Contract Size',
      value: `$${avgDealSize.toLocaleString()}`,
      subtext: `${draftProposals.length} drafts in progress`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-start justify-between relative overflow-hidden group hover:border-neutral-700 transition-colors"
          >
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {m.label}
              </span>
              <div className="text-2xl font-bold text-neutral-100">{m.value}</div>
              <div className="text-xs text-neutral-400 flex items-center gap-1">
                {m.subtext}
              </div>
            </div>
            <div className={`p-2.5 rounded-lg border ${m.bg}`}>
              <Icon className={`w-5 h-5 ${m.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
