import React, { useState, useEffect } from 'react';
import {
  X,
  Edit2,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function DocumentEditModal({
  isOpen,
  onClose,
  document,
  onUpdate,
  clients = [],
  projects = [],
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('deliverable');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document && isOpen) {
      setTitle(document.title || '');
      setCategory(document.category || 'deliverable');
      setClientId(document.clientId?._id || document.clientId || '');
      setProjectId(document.projectId?._id || document.projectId || '');
      setError('');
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onUpdate(document._id, {
        title: title.trim(),
        category,
        clientId: clientId || null,
        projectId: projectId || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update document metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProjects = clientId
    ? projects.filter(
        (p) => (p.clientId?._id || p.clientId) === clientId
      )
    : projects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">
                Edit Document Metadata
              </h3>
              <p className="text-xs text-neutral-400 font-mono truncate max-w-xs">
                {document.fileName}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Document Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Document Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="deliverable">Deliverable</option>
              <option value="contract">Contract & Agreement</option>
              <option value="design">Design Asset</option>
              <option value="invoice">Invoice / Billing</option>
              <option value="brief">Project Brief</option>
              <option value="asset">Resource Pack</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Associated Client
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId('');
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="">General / Internal Asset</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">
              Associated Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
            >
              <option value="">No Project Linked</option>
              {availableProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
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
              className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
