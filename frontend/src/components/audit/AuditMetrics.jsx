import React from 'react';
import {
  History,
  ShieldCheck,
  AlertTriangle,
  Users,
  Activity,
  Clock,
  FileCheck2,
  Lock,
} from 'lucide-react';
import Card from '../ui/Card';

export default function AuditMetrics({
  logs = [],
  stats = null,
}) {
  const total = stats?.totalLogs ?? logs.length;
  const past24h = stats?.logs24h ?? logs.filter((l) => {
    if (!l.createdAt) return false;
    const d = new Date(l.createdAt);
    return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
  }).length;

  const destructive = stats?.destructiveCount ?? logs.filter((l) =>
    /(delete|remove|revoke|cancel|purge|reject)/i.test(l.action || '')
  ).length;

  const uniqueActors =
    stats?.uniqueActorsCount !== undefined
      ? stats.uniqueActorsCount
      : (new Set(logs.map((l) => l.actorEmail).filter(Boolean)).size || 1);

  const cards = [
    {
      title: 'Immutable Log Records',
      value: total,
      subtext: 'Append-only audit ledger',
      icon: History,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: '24-Hour Velocity',
      value: past24h,
      subtext: 'Recent workspace mutations',
      icon: Activity,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Destructive Mutations',
      value: destructive,
      subtext: 'Deletions & access revocations',
      icon: AlertTriangle,
      color: destructive > 0 ? 'text-amber-400' : 'text-emerald-400',
      bg: destructive > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Distinct Actors',
      value: uniqueActors,
      subtext: 'Verified workspace principals',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-neutral-100 font-mono tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">{card.subtext}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
