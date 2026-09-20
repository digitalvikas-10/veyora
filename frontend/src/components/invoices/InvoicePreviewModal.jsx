import React from 'react';
import {
  X,
  Printer,
  Send,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  onSend,
  onRecordPayment,
}) {
  if (!isOpen || !invoice) return null;

  const clientName = invoice.clientId?.name || 'Unassigned Client';
  const clientCompany = invoice.clientId?.company || '';
  const clientEmail = invoice.clientId?.email || '';
  const clientPhone = invoice.clientId?.phone || '';
  const clientAddress = invoice.clientId?.address || '';

  const issueDateFormatted = invoice.issueDate
    ? new Date(invoice.issueDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const dueDateObj = invoice.dueDate ? new Date(invoice.dueDate) : null;
  const isPastDue = dueDateObj && dueDateObj < new Date() && (invoice.balanceDue || 0) > 0 && invoice.status !== 'draft';
  const dueDateFormatted = dueDateObj
    ? dueDateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const totalAmount = invoice.totalAmount || 0;
  const amountPaid = invoice.amountPaid || 0;
  const balanceDue = invoice.balanceDue ?? Math.max(0, totalAmount - amountPaid);
  const paymentRecords = invoice.paymentRecords || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Top Action Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Invoice Statement
            </span>
            <span className="text-xs font-bold text-neutral-200">
              {invoice.invoiceNumber}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              {invoice.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {balanceDue > 0 && invoice.status !== 'cancelled' && (
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onSend(invoice);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-8 space-y-8 overflow-y-auto bg-neutral-900 text-neutral-200">
          {/* Document Header & Company Branding */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-neutral-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base">
                  V
                </div>
                <span className="text-xl font-bold tracking-tight text-neutral-100">
                  VEYORA BILLING
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Enterprise Cloud Operations & Multi-Tenant SaaS
              </p>
              <p className="text-xs text-neutral-500">
                billing@veyora.internal • +1 (800) 555-VEYO
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <h2 className="text-2xl font-black text-neutral-100">INVOICE</h2>
              <p className="text-sm font-bold text-indigo-400">{invoice.invoiceNumber}</p>
              <div className="text-xs text-neutral-400 pt-1">
                <div><span className="text-neutral-500">Issued:</span> {issueDateFormatted}</div>
                <div className={isPastDue ? 'text-rose-400 font-semibold' : ''}>
                  <span className="text-neutral-500">Due:</span> {dueDateFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Billed To / Account Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/80">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Billed To:
              </span>
              <div className="text-sm font-bold text-neutral-100">{clientName}</div>
              {clientCompany && (
                <div className="text-xs text-neutral-300 font-medium">{clientCompany}</div>
              )}
              {clientEmail && <div className="text-xs text-neutral-400">{clientEmail}</div>}
              {clientPhone && <div className="text-xs text-neutral-400">{clientPhone}</div>}
              {clientAddress && <div className="text-xs text-neutral-500 pt-1">{clientAddress}</div>}
            </div>

            <div className="space-y-2 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                Payment Status:
              </span>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : invoice.status === 'partially_paid'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : isPastDue
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                Payment Channel: <span className="text-neutral-200 capitalize font-medium">{invoice.paymentMethod || 'Stripe'}</span>
              </div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Itemized Deliverables & Service Rates
            </h4>
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {invoice.lineItems?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/20">
                      <td className="py-3 px-4 font-medium text-neutral-200">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-300">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-neutral-300">
                        ${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-neutral-100">
                        ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Totals */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4">
            <div className="flex-1 space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Payment Terms & Remittance
              </span>
              <p className="text-xs text-neutral-400 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/60 leading-relaxed">
                {invoice.notes || 'Please settle balance prior to the due date. For wire transfers, remit using your invoice number as the payment reference.'}
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-neutral-200">
                  ${(invoice.subtotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span>-${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>+${(invoice.taxAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-neutral-100 pt-2 border-t border-neutral-800">
                <span>Total Invoiced:</span>
                <span className="text-indigo-400">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {invoice.currency || 'USD'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-400 pt-1">
                <span>Total Paid:</span>
                <span className="font-semibold text-emerald-400">
                  ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-bold text-xs text-amber-400 pt-2 border-t border-neutral-800/80">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? (isPastDue ? 'text-rose-400 font-extrabold' : 'text-amber-400 font-extrabold') : 'text-neutral-400'}>
                  ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Log */}
          {paymentRecords.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                  Payment Settlement History ({paymentRecords.length})
                </h4>
              </div>
              <div className="rounded-xl border border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-semibold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {paymentRecords.map((p, idx) => (
                      <tr key={idx} className="hover:bg-neutral-800/20">
                        <td className="py-2.5 px-3 text-neutral-300">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                          {p.transactionId || 'manual_tx'}
                        </td>
                        <td className="py-2.5 px-3 capitalize text-neutral-300">
                          {p.method}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          +${(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
