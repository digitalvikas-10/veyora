import React from 'react';
import {
  FileSpreadsheet,
  Building2,
  Calendar,
  DollarSign,
  CreditCard,
  Send,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    badge: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    dot: 'bg-neutral-400',
  },
  sent: {
    label: 'Dispatched',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-400',
  },
  viewed: {
    label: 'Viewed',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    dot: 'bg-indigo-400',
  },
  partially_paid: {
    label: 'Partially Paid',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  paid: {
    label: 'Fully Paid',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  overdue: {
    label: 'Overdue',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dot: 'bg-rose-400',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    dot: 'bg-neutral-500',
  },
};

export default function InvoiceCard({
  invoice,
  onPreview,
  onEdit,
  onSend,
  onRecordPayment,
  onDelete,
}) {
  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;

  const issueDateFormatted = invoice.issueDate
    ? new Date(invoice.issueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const dueDateObj = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const isPastDue = dueDateObj && dueDateObj < new Date() && (invoice.balanceDue || 0) > 0 && invoice.status !== 'draft';
  const dueDateFormatted = dueDateObj
    ? dueDateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No due date';

  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = invoice.balanceDue ?? Math.max(0, totalAmount - amountPaid);
  const paidPercentage = totalAmount > 0 ? Math.min(100, Math.round((amountPaid / totalAmount) * 100)) : 0;

  const clientName = invoice.clientId?.name || 'Unassigned Client';
  const clientCompany = invoice.clientId?.company || '';
  const projectName = invoice.projectId?.name || '';

  const canEdit = invoice.status !== 'paid';
  const canDelete = amountPaid === 0;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-neutral-900/70 border border-neutral-800/90 hover:border-neutral-700/80 p-5 transition-all shadow-sm hover:shadow-md group">
      {/* Top Section */}
      <div className="space-y-4">
        {/* Header: Invoice Number & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-100 group-hover:text-indigo-400 transition-colors">
                {invoice.invoiceNumber || 'INV-DRAFT'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusCfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>
            {projectName && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Briefcase className="w-3 h-3 text-neutral-500" />
                <span className="truncate max-w-[200px]">{projectName}</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-base font-bold text-neutral-100">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              {invoice.currency || 'USD'}
            </span>
          </div>
        </div>

        {/* Client details */}
        <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{clientName}</span>
          </div>
          {clientCompany && (
            <p className="text-[11px] text-neutral-400 pl-5.5 truncate">{clientCompany}</p>
          )}
        </div>

        {/* Financial Settlement Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Settlement Progress</span>
            <span className="font-semibold text-neutral-200">{paidPercentage}%</span>
          </div>
          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                paidPercentage === 100
                  ? 'bg-emerald-500'
                  : paidPercentage > 0
                  ? 'bg-amber-500'
                  : 'bg-neutral-700'
              }`}
              style={{ width: `${paidPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-neutral-800/40 border border-neutral-800/50">
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">Paid</span>
              <span className="text-xs font-bold text-emerald-400">
                ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-neutral-800/40 border border-neutral-800/50 text-right">
              <span className="text-[10px] text-neutral-500 block uppercase font-medium">Balance Due</span>
              <span className={`text-xs font-bold ${balanceDue > 0 ? (isPastDue ? 'text-rose-400' : 'text-amber-400') : 'text-neutral-400'}`}>
                ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Dates Info */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/50">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-neutral-500" />
            <span>Issued: {issueDateFormatted}</span>
          </div>
          <div className={`flex items-center gap-1 ${isPastDue ? 'text-rose-400 font-semibold' : ''}`}>
            {isPastDue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-neutral-500" />}
            <span>Due: {dueDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onPreview(invoice)}
          className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>View Invoice</span>
        </button>

        {balanceDue > 0 && invoice.status !== 'cancelled' && (
          <button
            onClick={() => onRecordPayment(invoice)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            title="Record Payment"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pay</span>
          </button>
        )}

        <button
          onClick={() => onSend(invoice)}
          className="p-1.5 text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
          title="Send to Client"
        >
          <Send className="w-3.5 h-3.5" />
        </button>

        {canEdit && (
          <button
            onClick={() => onEdit(invoice)}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Invoice"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}

        {canDelete && (
          <button
            onClick={() => onDelete(invoice._id)}
            className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Delete Invoice"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
