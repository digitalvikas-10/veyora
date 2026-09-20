import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export default function InvoiceMetrics({ invoices = [], billingSummary = null }) {
  // Aggregate real-time statistics
  const totalInvoices = invoices.length;

  const totalInvoiced = billingSummary?.totalInvoiced ?? invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalRevenue = billingSummary?.totalRevenue ?? invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = billingSummary?.totalOutstanding ?? invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  const paidInvoicesCount = invoices.filter((i) => i.status === 'paid').length;
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'overdue' || (i.status !== 'draft' && i.dueDate && new Date(i.dueDate) < new Date() && (i.balanceDue || 0) > 0)).length;
  const pendingInvoicesCount = invoices.filter((i) => ['sent', 'viewed', 'partially_paid'].includes(i.status)).length;

  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Billed Card */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-xs font-medium">Total Invoiced</span>
          <div className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-100">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-neutral-500">USD</span>
        </div>
        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
          <span className="text-neutral-300 font-semibold">{totalInvoices}</span>
          <span>total invoices generated</span>
        </div>
      </div>

      {/* Total Collected Revenue */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-xs font-medium text-neutral-400">Collected Revenue</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-emerald-500/80 font-medium">
            ({collectionRate}% collected)
          </span>
        </div>
        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, collectionRate)}%` }}
          />
        </div>
      </div>

      {/* Outstanding Receivables */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-xs font-medium text-neutral-400">Outstanding Balance</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-400">
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-neutral-500">USD</span>
        </div>
        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
          <span className="text-amber-400 font-semibold">{pendingInvoicesCount}</span>
          <span>invoices awaiting settlement</span>
        </div>
      </div>

      {/* Overdue Delinquencies */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-rose-400">
          <span className="text-xs font-medium text-neutral-400">Overdue / Delinquent</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-400">
            {overdueInvoicesCount}
          </span>
          <span className="text-[11px] text-neutral-500">past due</span>
        </div>
        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-semibold">{paidInvoicesCount}</span>
          <span>settled in full</span>
        </div>
      </div>
    </div>
  );
}
