import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Calendar, DollarSign, Tag, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../ui';

export const ProjectFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  project = null,
  clients = [],
  loading = false,
}) => {
  const isEdit = Boolean(project);

  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    code: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    budget: 0,
    currency: 'USD',
    startDate: '',
    targetDate: '',
    progressPercent: 0,
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        clientId: project.clientId?._id || project.clientId || (clients[0]?._id || ''),
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        status: project.status || 'planning',
        priority: project.priority || 'medium',
        budget: project.budget || 0,
        currency: project.currency || 'USD',
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
        targetDate: project.targetDate ? new Date(project.targetDate).toISOString().slice(0, 10) : '',
        progressPercent: project.progressPercent || 0,
        tags: Array.isArray(project.tags) ? [...project.tags] : [],
      });
    } else {
      setFormData({
        clientId: clients[0]?._id || '',
        name: '',
        code: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        budget: 0,
        currency: 'USD',
        startDate: new Date().toISOString().slice(0, 10),
        targetDate: '',
        progressPercent: 0,
        tags: [],
      });
    }
    setTagInput('');
    setErrors({});
  }, [project, isOpen, clients]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !formData.tags.includes(clean)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, clean],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Project name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Project name must be at least 2 characters';
    }

    if (!formData.clientId) {
      errs.clientId = 'Please assign an active workspace client';
    }

    if (Number(formData.budget) < 0) {
      errs.budget = 'Budget cannot be negative';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget) || 0,
        progressPercent: Number(formData.progressPercent) || 0,
      };

      // Strip empty dates
      if (!payload.startDate) delete payload.startDate;
      if (!payload.targetDate) delete payload.targetDate;
      if (!payload.code) delete payload.code;

      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.message) {
        setErrors((prev) => ({ ...prev, api: err.message }));
      }
    }
  };

  const STATUS_OPTIONS = [
    { value: 'planning', label: 'Planning & Scoping' },
    { value: 'active', label: 'Active Sprint' },
    { value: 'on-hold', label: 'On Hold / Blocked' },
    { value: 'completed', label: 'Completed Deliverable' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent Critical' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Project: ${project?.name}` : 'Initialize New Project'}
      size="lg"
      className="bg-neutral-900 border border-neutral-800"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errors.api && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.api}</span>
          </div>
        )}

        {/* Section 1: Client & Project Name */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Client Account <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleChange('clientId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500"
              >
                {clients.length === 0 && (
                  <option value="">No clients available - Add client first</option>
                )}
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.clientId}</p>
              )}
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Project Code <span className="text-neutral-500 font-normal">(Auto if empty)</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g. ACM-001"
                className="bg-neutral-950 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Project Deliverable Name <span className="text-rose-400">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Enterprise Cloud Migration & Observability Suite"
              error={errors.name}
              className="bg-neutral-950"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Scope of Work & Deliverable Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Outline project milestones, key requirements, tech stack commitments, and SLA agreements..."
              className="w-full p-2.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Status, Priority, Budget */}
        <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Delivery Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Committed Budget</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">$</span>
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.budget && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.budget}</p>
            )}
          </div>
        </div>

        {/* Section 3: Timeline & Progress */}
        <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Kickoff / Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Target Deadline</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => handleChange('targetDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-neutral-300 font-medium">Progress %</label>
              <span className="font-mono text-neutral-400">{formData.progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progressPercent}
              onChange={(e) => handleChange('progressPercent', Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
            />
          </div>
        </div>

        {/* Section 4: Tags */}
        <div className="pt-3 border-t border-neutral-800 space-y-1.5">
          <label className="block text-neutral-300 font-medium">
            Tags (Press Enter or comma to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 min-h-[38px]">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-neutral-800 text-neutral-200 border border-neutral-700"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-neutral-400 hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={formData.tags.length === 0 ? "Type tag (e.g. Migration, Cloud) and press Enter" : ""}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
