import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

export default function InvoiceSendModal({
  isOpen,
  onClose,
  invoice,
  onSend,
}) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      const email = invoice.clientId?.email || '';
      setRecipientEmail(email);
      setSubject(`Invoice ${invoice.invoiceNumber} from VEYORA — Payment Due`);
      const dueDateFormatted = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'upon receipt';
      setMessage(
        `Dear ${invoice.clientId?.name || 'Customer'},\n\nPlease find attached invoice ${invoice.invoiceNumber} for $${(invoice.totalAmount || 0).toLocaleString()} USD, due on ${dueDateFormatted}.\n\nYou can remit payment via your preferred gateway or direct bank transfer.\n\nThank you for your business!`
      );
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await onSend(invoice._id);
      onClose();
    } catch (err) {
      console.error('Invoice send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Dispatch Invoice to Client
              </h3>
              <p className="text-xs text-neutral-400">
                Send official billing notice for {invoice.invoiceNumber}
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
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Recipient Email Address
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="client@company.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Email Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Custom Email Message
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Total Bill Amount:</span>
            <span className="font-bold text-neutral-100 text-sm">
              ${(invoice.totalAmount || 0).toLocaleString()} {invoice.currency || 'USD'}
            </span>
          </div>

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
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'Sending Notice...' : 'Send Invoice Email'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
