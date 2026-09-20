import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Percent,
  CheckCircle,
} from 'lucide-react';

export default function ProposalFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  clients = [],
  projects = [],
}) {
  const isEdit = !!initialData;

  const defaultLineItem = {
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  };

  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    proposalNumber: '',
    title: '',
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    currency: 'USD',
    lineItems: [{ ...defaultLineItem, description: 'Consulting & Implementation Scope', quantity: 1, unitPrice: 2500, amount: 2500 }],
    discount: 0,
    taxRate: 0,
    notes: 'Thank you for your business. Please review the deliverables and terms outlined above.',
    terms: 'Payment is due within 30 days of contract ratification. All intellectual property transfers upon final payment.',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        clientId: initialData.clientId?._id || initialData.clientId || '',
        projectId: initialData.projectId?._id || initialData.projectId || '',
        proposalNumber: initialData.proposalNumber || '',
        title: initialData.title || '',
        status: initialData.status || 'draft',
        issueDate: initialData.issueDate
          ? new Date(initialData.issueDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        validUntil: initialData.validUntil
          ? new Date(initialData.validUntil).toISOString().split('T')[0]
          : '',
        currency: initialData.currency || 'USD',
        lineItems:
          initialData.lineItems && initialData.lineItems.length > 0
            ? initialData.lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: (item.quantity || 0) * (item.unitPrice || 0),
              }))
            : [{ ...defaultLineItem }],
        discount: initialData.discount || 0,
        taxRate: initialData.taxRate || 0,
        notes: initialData.notes || '',
        terms: initialData.terms || '',
      });
    } else {
      setFormData({
        clientId: clients[0]?._id || '',
        projectId: '',
        proposalNumber: '',
        title: '',
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        currency: 'USD',
        lineItems: [
          {
            description: 'Core Engineering & Sprint Milestones',
            quantity: 1,
            unitPrice: 3500,
            amount: 3500,
          },
        ],
        discount: 0,
        taxRate: 5,
        notes: 'Deliverables include full technical architecture, cloud deployment, and sprint delivery.',
        terms: 'Work commences upon signature. Terms: Net 30 days.',
      });
    }
    setErrors({});
  }, [initialData, isOpen, clients]);

  if (!isOpen) return null;

  // Filter projects for selected client
  const clientProjects = formData.clientId
    ? projects.filter(
        (p) =>
          (p.clientId?._id || p.clientId) === formData.clientId
      )
    : projects;

  // Financial calculations
  const calculateSubtotal = () => {
    return formData.lineItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const subtotal = calculateSubtotal();
  const taxableAmount = Math.max(0, subtotal - (Number(formData.discount) || 0));
  const taxAmount = taxableAmount * ((Number(formData.taxRate) || 0) / 100);
  const totalAmount = taxableAmount + taxAmount;

  // Line item handlers
  const handleLineItemChange = (index, field, value) => {
    const updated = [...formData.lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === 'description' ? value : Number(value) || 0,
    };
    updated[index].amount =
      (Number(updated[index].quantity) || 0) * (Number(updated[index].unitPrice) || 0);
    setFormData({ ...formData, lineItems: updated });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { ...defaultLineItem }],
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length <= 1) return;
    const updated = formData.lineItems.filter((_, idx) => idx !== index);
    setFormData({ ...formData, lineItems: updated });
  };

  const validate = () => {
    const errs = {};
    if (!formData.clientId) errs.clientId = 'Client selection is required';
    if (!formData.title.trim()) errs.title = 'Proposal title is required';
    if (!formData.lineItems || formData.lineItems.length === 0) {
      errs.lineItems = 'At least one line item is required';
    } else {
      const hasInvalidItem = formData.lineItems.some(
        (item) => !item.description.trim() || Number(item.quantity) <= 0
      );
      if (hasInvalidItem) {
        errs.lineItems = 'All line items must have a description and quantity > 0';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        clientId: formData.clientId,
        projectId: formData.projectId || undefined,
        discount: Number(formData.discount) || 0,
        taxRate: Number(formData.taxRate) || 0,
        lineItems: formData.lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })),
      };

      if (!payload.proposalNumber) {
        delete payload.proposalNumber;
      }

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('Failed to submit proposal:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div>
            <h2 className="text-lg font-bold text-neutral-100">
              {isEdit ? 'Edit Proposal' : 'Draft New Proposal'}
            </h2>
            <p className="text-xs text-neutral-400">
              {isEdit
                ? `Modify terms for ${initialData?.proposalNumber || ''}`
                : 'Structure scopes, deliverables, line items, and pricing for your client'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Primary Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Client <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Select a Client...</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-[11px] text-rose-400">{errors.clientId}</p>
              )}
            </div>

            {/* Project Selection (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Link to Project (Optional)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">No Project Linked</option>
                {clientProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} {p.code ? `(${p.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Proposal Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Proposal Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Enterprise Cloud Migration & UI Revamp"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
            </div>

            {/* Proposal Number (Optional auto) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Proposal Number
              </label>
              <input
                type="text"
                value={formData.proposalNumber}
                onChange={(e) => setFormData({ ...formData, proposalNumber: e.target.value.toUpperCase() })}
                placeholder="Auto-generated (e.g. PROP-2026-001)"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Status (if editing) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent to Client</option>
                <option value="viewed">Viewed</option>
                <option value="accepted">Accepted / Signed</option>
                <option value="declined">Declined</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Issue Date
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Valid Until */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Line Items & Deliverable Scopes
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {errors.lineItems && (
              <p className="text-[11px] text-rose-400">{errors.lineItems}</p>
            )}

            <div className="space-y-2">
              {formData.lineItems.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(index, 'description', e.target.value)
                      }
                      placeholder="Item description / milestone..."
                      className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(index, 'quantity', e.target.value)
                      }
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 text-center focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleLineItemChange(index, 'unitPrice', e.target.value)
                      }
                      placeholder="Rate ($)"
                      className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 text-right focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-1 text-right font-mono text-xs text-emerald-400 font-bold truncate">
                    ${(item.amount || 0).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={formData.lineItems.length <= 1}
                      className="p-1 text-neutral-500 hover:text-rose-400 disabled:opacity-30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation Summary Box */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">
                  Discount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-400">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-1.5 text-xs text-neutral-400 border-t sm:border-t-0 sm:border-l border-neutral-800/80 sm:pl-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-200">${subtotal.toLocaleString()}</span>
              </div>
              {formData.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount:</span>
                  <span className="font-mono">-${Number(formData.discount).toLocaleString()}</span>
                </div>
              )}
              {formData.taxRate > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span className="font-mono text-neutral-200">${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold text-neutral-100">
                <span>Total Contract:</span>
                <span className="text-emerald-400 font-mono">${totalAmount.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Scope Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Scope details or timeline expectations..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                placeholder="Payment terms, copyright, confidentiality..."
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEdit ? 'Update Proposal' : 'Save & Create Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
