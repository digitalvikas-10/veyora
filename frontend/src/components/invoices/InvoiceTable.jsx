import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Send,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    badge: 'bg-neutral-800 text-neutral-300 border-neutral-700',
  },
  sent: {
    label: 'Sent',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  viewed: {
    label: 'Viewed',
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
  partially_paid: {
    label: 'Partially Paid',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  paid: {
    label: 'Paid',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  overdue: {
    label: 'Overdue',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  },
};

export default function InvoiceTable({
  invoices = [],
  onPreview,
  onEdit,
  onSend,
  onRecordPayment,
  onDelete,
}) {
  return (
    <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-950/40 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Dates</th>
              <th className="py-3.5 px-4 text-right">Total</th>
              <th className="py-3.5 px-4 text-right">Paid</th>
              <th className="py-3.5 px-4 text-right">Balance Due</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-xs">
            {invoices.map((inv) => {
              const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
              const totalAmount = inv.totalAmount || 0;
              const amountPaid = inv.amountPaid || 0;
              const balanceDue = inv.balanceDue ?? Math.max(0, totalAmount - amountPaid);

              const dueDateObj = inv.dueDate ? new Date(inv.dueDate) : null;
              const isPastDue = dueDateObj && dueDateObj < new Date() && balanceDue > 0 && inv.status !== 'draft';

              const issueDateFormatted = inv.issueDate
                ? new Date(inv.issueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—';

              const dueDateFormatted = dueDateObj
                ? dueDateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—';

              const canEdit = inv.status !== 'paid';
              const canDelete = amountPaid === 0;

              return (
                <tr
                  key={inv._id}
                  className="hover:bg-neutral-800/40 transition-colors group"
                >
                  {/* Invoice Number */}
                  <td className="py-3.5 px-4 font-semibold text-neutral-200 whitespace-nowrap">
                    <button
                      onClick={() => onPreview(inv)}
                      className="hover:text-indigo-400 text-left transition-colors cursor-pointer"
                    >
                      {inv.invoiceNumber}
                    </button>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-neutral-200 truncate max-w-[150px]">
                      {inv.clientId?.name || 'Unassigned'}
                    </div>
                    {inv.clientId?.company && (
                      <div className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                        {inv.clientId.company}
                      </div>
                    )}
                  </td>

                  {/* Project */}
                  <td className="py-3.5 px-4 text-neutral-400">
                    <span className="truncate max-w-[120px] block">
                      {inv.projectId?.name || '—'}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-neutral-300">
                      Issued: {issueDateFormatted}
                    </div>
                    <div className={`text-[11px] flex items-center gap-1 ${isPastDue ? 'text-rose-400 font-semibold' : 'text-neutral-400'}`}>
                      {isPastDue && <AlertCircle className="w-3 h-3" />}
                      Due: {dueDateFormatted}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 text-right font-semibold text-neutral-100 whitespace-nowrap">
                    ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Paid */}
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-400 whitespace-nowrap">
                    ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Balance Due */}
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    <span className={balanceDue > 0 ? (isPastDue ? 'text-rose-400' : 'text-amber-400') : 'text-neutral-400'}>
                      ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusCfg.badge}`}>
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onPreview(inv)}
                        className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        title="View & Print"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {balanceDue > 0 && inv.status !== 'cancelled' && (
                        <button
                          onClick={() => onRecordPayment(inv)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onSend(inv)}
                        className="p-1.5 text-neutral-400 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Send to Client"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onEdit(inv)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => onDelete(inv._id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
