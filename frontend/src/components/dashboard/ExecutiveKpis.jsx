import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { Card, Badge } from '../ui';

export const ExecutiveKpis = ({ kpis, loading }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const cards = [
    {
      id: 'kpi-gross-invoiced',
      title: 'Total Invoiced',
      value: formatCurrency(kpis?.totalInvoiced),
      change: kpis?.invoicedChange || '+14.2%',
      isPositive: true,
      subtext: 'vs previous period',
      icon: DollarSign,
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      badge: 'Billed Gross',
    },
    {
      id: 'kpi-collected-revenue',
      title: 'Revenue Collected',
      value: formatCurrency(kpis?.totalCollected),
      change: kpis?.collectedChange || '+18.6%',
      isPositive: true,
      subtext: 'cash settled in bank',
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: 'Settled',
    },
    {
      id: 'kpi-outstanding-ar',
      title: 'Outstanding Receivables',
      value: formatCurrency(kpis?.totalOutstanding),
      change: kpis?.outstandingChange || '-4.1%',
      isPositive: true, // Lower outstanding is good
      subtext: `${formatCurrency(kpis?.overdueAmount || 0)} overdue (${kpis?.overdueCount || 0})`,
      icon: AlertTriangle,
      iconBg: (kpis?.overdueAmount || 0) > 0 
        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
        : 'bg-neutral-800 text-neutral-400 border border-neutral-700',
      badge: (kpis?.overdueAmount || 0) > 0 ? 'Overdue Action' : 'In Balance',
      badgeVariant: (kpis?.overdueAmount || 0) > 0 ? 'warning' : 'outline',
    },
    {
      id: 'kpi-active-projects',
      title: 'Active Projects',
      value: `${kpis?.activeProjects || 0} / ${kpis?.totalProjects || 0}`,
      change: `${Math.round(((kpis?.activeProjects || 1) / (kpis?.totalProjects || 1)) * 100)}% active`,
      isPositive: true,
      subtext: 'operational capacity',
      icon: FolderKanban,
      iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      badge: 'On Track',
      badgeVariant: 'info',
    },
    {
      id: 'kpi-sprint-velocity',
      title: 'Sprint Completion',
      value: `${kpis?.completionRate || 0}%`,
      change: `${kpis?.openTasks || 0} tasks open`,
      isPositive: (kpis?.completionRate || 0) >= 60,
      subtext: 'across active milestones',
      icon: CheckCircle2,
      iconBg: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
      badge: 'Velocity',
      badgeVariant: 'default',
    },
    {
      id: 'kpi-billable-hours',
      title: 'Billable Hours',
      value: `${kpis?.billableHours || 0}h`,
      change: '142.5h target',
      isPositive: true,
      subtext: 'recorded this cycle',
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: 'Timesheets',
      badgeVariant: 'outline',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-neutral-900/60 border border-neutral-800 rounded-xl animate-pulse p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-neutral-800 rounded" />
              <div className="h-7 w-7 bg-neutral-800 rounded-lg" />
            </div>
            <div className="h-6 w-24 bg-neutral-800 rounded mt-2" />
            <div className="h-2.5 w-16 bg-neutral-800/80 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card 
            key={card.id} 
            id={card.id}
            variant="glass" 
            className="p-3.5 transition-all duration-200 hover:border-neutral-700/80 hover:bg-neutral-900/70"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-neutral-400 truncate tracking-wide">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg shrink-0 ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-lg font-bold text-neutral-100 tracking-tight font-mono">
                {card.value}
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-0.5 font-medium text-emerald-400">
                <ArrowUpRight className="w-3 h-3 shrink-0" />
                {card.change}
              </span>
              <span className="text-neutral-500 truncate text-[10px]">
                {card.subtext}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
