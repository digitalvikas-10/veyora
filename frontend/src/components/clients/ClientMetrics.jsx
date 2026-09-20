import React from 'react';
import { Card } from '../ui';
import { Users, UserCheck, UserPlus, DollarSign, Clock, CheckCircle } from 'lucide-react';

export const ClientMetrics = ({ clients = [] }) => {
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'active').length;
  const leadClients = clients.filter((c) => c.status === 'lead').length;
  const inactiveClients = clients.filter((c) => c.status === 'inactive' || c.status === 'archived').length;

  const totalBilled = clients.reduce((acc, c) => acc + (c.totalBilled || 0), 0);
  const totalPaid = clients.reduce((acc, c) => acc + (c.totalPaid || 0), 0);
  const outstanding = Math.max(0, totalBilled - totalPaid);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const METRICS = [
    {
      id: 'metric-total-clients',
      label: 'Total Accounts',
      value: totalClients,
      change: `${activeClients} active accounts`,
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: 'metric-active-clients',
      label: 'Active Retainers',
      value: activeClients,
      change: `${leadClients} in lead pipeline`,
      icon: UserCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'metric-total-billed',
      label: 'Lifetime Billed',
      value: formatCurrency(totalBilled),
      change: `${formatCurrency(totalPaid)} collected`,
      icon: DollarSign,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      id: 'metric-outstanding',
      label: 'Receivables Due',
      value: formatCurrency(outstanding),
      change: `${((totalPaid / (totalBilled || 1)) * 100).toFixed(0)}% recovery rate`,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.id} id={metric.id} className="p-4 flex flex-col justify-between hover:border-neutral-700 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{metric.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${metric.bg} ${metric.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-neutral-100 tracking-tight">{metric.value}</div>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                <span>{metric.change}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
