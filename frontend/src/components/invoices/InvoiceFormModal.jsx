import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  Briefcase,
  FileSpreadsheet,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  clients = [],
  projects = [],
  proposals = [],
}) {
  const isEditing = Boolean(initialData);

  // Form State
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [status, setStatus] = useState('draft');
  const [currency, setCurrency] = useState('USD');
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [lineItems, setLineItems] = useState([
    { description: 'Technical Architecture & Feature Implementation', quantity: 1, unitPrice: 2500 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      setClientId(initialData.clientId?._id || initialData.clientId || '');
      setProjectId(initialData.projectId?._id || initialData.projectId || '');
      setProposalId(initialData.proposalId?._id || initialData.proposalId || '');
      setInvoiceNumber(initialData.invoiceNumber || '');
      setStatus(initialData.status || 'draft');
      setCurrency(initialData.currency || 'USD');
      setIssueDate(
        initialData.issueDate
          ? new Date(initialData.issueDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDueDate(
        initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : ''
      );
      setPaymentMethod(initialData.paymentMethod || 'stripe');
      setLineItems(
        initialData.lineItems?.length
          ? initialData.lineItems.map((item) => ({
              description: item.description || '',
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice || 0,
            }))
          : [{ description: '', quantity: 1, unitPrice: 0 }]
      );
      setDiscount(initialData.discount || 0);
      setTaxRate(initialData.taxRate || 0);
      setNotes(initialData.notes || '');
    } else {
      // Reset defaults
      setClientId(clients[0]?._id || '');
      setProjectId('');
      setProposalId('');
      setInvoiceNumber('');
      setStatus('draft');
      setCurrency('USD');
      setIssueDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().split('T')[0]);
      setPaymentMethod('stripe');
      setLineItems([
        { description: 'Sprint Deliverable & Development Services', quantity: 1, unitPrice: 3000 },
      ]);
      setDiscount(0);
      setTaxRate(5);
      setNotes('Payment is due within 14 days of issue. Bank transfer, Stripe, and wire settlements accepted.');
    }
    setErrors({});
  }, [initialData, isOpen, clients]);

  // Client-filtered projects and proposals
  const availableProjects = useMemo(() => {
    if (!clientId) return projects;
    return projects.filter((p) => {
      const pClientId = p.clientId?._id || p.clientId;
      return pClientId === clientId;
    });
  }, [projects, clientId]);

  const availableProposals = useMemo(() => {
    if (!clientId) return proposals;
    return proposals.filter((p) => {
      const pClientId = p.clientId?._id || p.clientId;
      return pClientId === clientId;
    });
  }, [proposals, clientId]);

  // Import line items from accepted proposal
  const handleImportProposal = (propId) => {
    setProposalId(propId);
    if (!propId) return;
    const foundProp = proposals.find((p) => p._id === propId);
    if (foundProp) {
      if (foundProp.projectId) {
        setProjectId(foundProp.projectId?._id || foundProp.projectId);
      }
      if (foundProp.lineItems?.length) {
        setLineItems(
          foundProp.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        );
      }
      if (foundProp.discount !== undefined) setDiscount(foundProp.discount);
      if (foundProp.taxRate !== undefined) setTaxRate(foundProp.taxRate);
    }
  };

  // Line item handlers
  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index, field, value) => {
    const updated = [...lineItems];
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index][field] = Math.max(0, Number(value) || 0);
    } else {
      updated[index][field] = value;
    }
    setLineItems(updated);
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);
  }, [lineItems]);

  const taxableAmount = Math.max(0, subtotal - (Number(discount) || 0));
  const taxAmount = (taxableAmount * (Number(taxRate) || 0)) / 100;
  const totalAmount = taxableAmount + taxAmount;

  const validateForm = () => {
    const errs = {};
    if (!clientId) errs.clientId = 'Please select a client';
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (lineItems.length === 0) {
      errs.lineItems = 'At least one line item is required';
    } else {
      const hasEmptyDesc = lineItems.some((item) => !item.description.trim());
      if (hasEmptyDesc) {
        errs.lineItems = 'All line items must have a description';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        clientId,
        projectId: projectId || undefined,
        proposalId: proposalId || undefined,
        status,
        currency,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        paymentMethod,
        lineItems: lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        discount: Number(discount) || 0,
        taxRate: Number(taxRate) || 0,
        notes: notes.trim() || undefined,
      };

      if (invoiceNumber.trim()) {
        payload.invoiceNumber = invoiceNumber.trim().toUpperCase();
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Invoice submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                {isEditing ? `Edit Invoice: ${initialData.invoiceNumber}` : 'Issue New Invoice'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isEditing
                  ? 'Update line items, pricing tiers, and settlement terms.'
                  : 'Generate a customer bill with itemized services, automated taxes, and payment gateways.'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Client Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Client <span className="text-rose-400">*</span></span>
              </label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId('');
                  setProposalId('');
                }}
                disabled={isEditing && initialData?.amountPaid > 0}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-[11px] text-rose-400">{errors.clientId}</p>
              )}
            </div>

            {/* Project Linkage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Project (Optional)</span>
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">No linked project</option>
                {availableProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code || 'PRJ'})
                  </option>
                ))}
              </select>
            </div>

            {/* Proposal Import Linkage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import from Proposal</span>
              </label>
              <select
                value={proposalId}
                onChange={(e) => handleImportProposal(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">No linked proposal</option>
                {availableProposals.map((prop) => (
                  <option key={prop._id} value={prop._id}>
                    {prop.proposalNumber} — {prop.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Invoice Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Invoice Number
              </label>
              <input
                type="text"
                placeholder="Auto-generated (e.g. INV-2026-1001)"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors uppercase"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Issue Date</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.dueDate && (
                <p className="text-[11px] text-rose-400">{errors.dueDate}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="stripe">Stripe Online Checkout</option>
                <option value="bank_transfer">Direct ACH / Wire Transfer</option>
                <option value="paypal">PayPal Gateway</option>
                <option value="manual">Manual / Check</option>
                <option value="cash">Cash Settlement</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Billing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="sent">Dispatched / Sent</option>
                <option value="viewed">Viewed by Client</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Fully Settled</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
                Itemized Services & Deliverables
              </label>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.lineItems && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.lineItems}</span>
              </p>
            )}

            <div className="space-y-2.5">
              {lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Service / product description (e.g. Full-Stack Sprint 1)"
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(idx, 'description', e.target.value)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0.01"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(idx, 'quantity', e.target.value)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-right"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      placeholder="Rate ($)"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(idx, 'unitPrice', e.target.value)
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-right"
                    />
                  </div>
                  <div className="w-full sm:w-28 text-right font-bold text-xs text-neutral-200 px-2 py-1">
                    ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    disabled={lineItems.length === 1}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      lineItems.length === 1
                        ? 'text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Adjustments & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
            {/* Notes & Bank Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Payment Instructions & Client Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include wire details, ACH routing instructions, or invoice notes..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Calculations Box */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-200">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Discount ($)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tax Rate Input */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Tax Rate (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 text-right focus:outline-none focus:border-indigo-500"
                />
              </div>

              {taxRate > 0 && (
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Estimated Tax ({taxRate}%)</span>
                  <span>
                    +${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-sm font-bold text-neutral-100">
                <span>Total Amount Due</span>
                <span className="text-indigo-400 text-base">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Issue Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
