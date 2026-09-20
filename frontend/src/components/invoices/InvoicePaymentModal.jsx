import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function InvoicePaymentModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('stripe');
  const [transactionId, setTransactionId] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = invoice?.totalAmount || 0;
  const amountPaid = invoice?.amountPaid || 0;
  const balanceDue = invoice ? (invoice.balanceDue ?? Math.max(0, totalAmount - amountPaid)) : 0;

  useEffect(() => {
    if (invoice && isOpen) {
      setAmount(balanceDue > 0 ? String(balanceDue) : '');
      setMethod(invoice.paymentMethod || 'stripe');
      setTransactionId(`TX-${Date.now().toString().slice(-6)}`);
      setPaidAt(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
    }
  }, [invoice, isOpen, balanceDue]);

  if (!isOpen || !invoice) return null;

  const handleSetAmountPercent = (fraction) => {
    const calculated = Number((balanceDue * fraction).toFixed(2));
    setAmount(String(calculated));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please specify a valid payment amount greater than $0');
      return;
    }

    if (numAmount > balanceDue + 0.01) {
      setError(`Payment amount ($${numAmount}) exceeds balance due ($${balanceDue})`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onRecordPayment(invoice._id, {
        amount: numAmount,
        method,
        transactionId: transactionId.trim() || undefined,
        paidAt: new Date(paidAt).toISOString(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Record Payment Settlement
              </h3>
              <p className="text-xs text-neutral-400">
                Apply client remittance to {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Invoice Summary Card */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Client:</span>
              <span className="font-semibold text-neutral-200">
                {invoice.clientId?.name} {invoice.clientId?.company ? `(${invoice.clientId.company})` : ''}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800/80 text-center">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-medium">Total</span>
                <span className="text-xs font-bold text-neutral-200">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-medium">Paid</span>
                <span className="text-xs font-bold text-emerald-400">
                  ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block font-medium">Balance Due</span>
                <span className="text-xs font-bold text-amber-400">
                  ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input & Quick Shortcuts */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Settlement Amount ($ USD) <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-neutral-500">Max: ${balanceDue.toFixed(2)}</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={balanceDue}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm font-bold text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSetAmountPercent(1)}
                className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                Full (${balanceDue.toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => handleSetAmountPercent(0.5)}
                className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                50% (${(balanceDue * 0.5).toFixed(2)})
              </button>
              <button
                type="button"
                onClick={() => handleSetAmountPercent(0.25)}
                className="flex-1 py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                25% (${(balanceDue * 0.25).toFixed(2)})
              </button>
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="stripe">Stripe Online</option>
                <option value="bank_transfer">ACH / Bank Wire</option>
                <option value="paypal">PayPal</option>
                <option value="manual">Manual Settlement</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Payment Date</span>
              </label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Transaction Reference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Transaction ID / Gateway Reference
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. ch_3M5s... or WIRE-9982"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </div>

          {/* Payment Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Settlement Notes / Memo
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes regarding this transaction..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm Settlement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
