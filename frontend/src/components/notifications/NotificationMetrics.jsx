import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  CreditCard,
  Layers,
  Sparkles,
  Inbox,
} from 'lucide-react';
import Card from '../ui/Card';

export default function NotificationMetrics({
  notifications = [],
  unreadCount = 0,
  stats = null,
}) {
  const total = notifications.length;
  const readCount = Math.max(0, total - unreadCount);

  // Derive counts by type if not already populated in stats
  const typeCounts = {
    task_assigned: 0,
    invoice_paid: 0,
    proposal_signed: 0,
    project_update: 0,
    system: 0,
    info: 0,
  };

  notifications.forEach((n) => {
    if (typeCounts[n.type] !== undefined) {
      typeCounts[n.type] += 1;
    } else {
      typeCounts.info += 1;
    }
  });

  const cards = [
    {
      title: 'Unread Alerts',
      value: unreadCount,
      subtext: unreadCount > 0 ? 'Requires attention' : 'All caught up',
      icon: Bell,
      color: unreadCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bg: unreadCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Total In-App Feeds',
      value: total,
      subtext: `${readCount} read & acknowledged`,
      icon: Inbox,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Billing & Invoices',
      value: typeCounts.invoice_paid,
      subtext: 'Payment settlements & dues',
      icon: CreditCard,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Workflow & Tasks',
      value: typeCounts.task_assigned + typeCounts.project_update + typeCounts.proposal_signed,
      subtext: `${typeCounts.task_assigned} tasks • ${typeCounts.proposal_signed} signatures`,
      icon: Layers,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
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
