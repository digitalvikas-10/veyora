import React, { useState, useEffect } from 'react';
import { CheckSquare, Briefcase, Calendar, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Modal, Button, Input } from '../ui';

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  projects = [],
  loading = false,
}) => {
  const isEdit = Boolean(task);

  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    estimatedHours: 0,
    dueDate: '',
    checklist: [],
  });

  const [checklistInput, setChecklistInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId?._id || task.projectId || (projects[0]?._id || ''),
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        estimatedHours: task.estimatedHours || 0,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
        checklist: Array.isArray(task.checklist) ? [...task.checklist] : [],
      });
    } else {
      setFormData({
        projectId: projects[0]?._id || '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        estimatedHours: 0,
        dueDate: '',
        checklist: [],
      });
    }
    setChecklistInput('');
    setErrors({});
  }, [task, isOpen, projects]);

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

  const handleAddChecklistItem = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = checklistInput.trim();
      if (clean) {
        setFormData((prev) => ({
          ...prev,
          checklist: [...prev.checklist, { title: clean, completed: false }],
        }));
        setChecklistInput('');
      }
    }
  };

  const handleAddChecklistClick = () => {
    const clean = checklistInput.trim();
    if (clean) {
      setFormData((prev) => ({
        ...prev,
        checklist: [...prev.checklist, { title: clean, completed: false }],
      }));
      setChecklistInput('');
    }
  };

  const handleRemoveChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, idx) => idx !== index),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required';
    } else if (formData.title.trim().length < 2) {
      errs.title = 'Task title must be at least 2 characters';
    }

    if (!formData.projectId) {
      errs.projectId = 'Please select a parent project';
    }

    if (Number(formData.estimatedHours) < 0) {
      errs.estimatedHours = 'Estimated hours cannot be negative';
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
        estimatedHours: Number(formData.estimatedHours) || 0,
      };

      if (!payload.dueDate) delete payload.dueDate;

      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.message) {
        setErrors((prev) => ({ ...prev, api: err.message }));
      }
    }
  };

  const STATUS_OPTIONS = [
    { value: 'todo', label: 'To Do / Backlog' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'in-review', label: 'In Review / QA' },
    { value: 'done', label: 'Completed' },
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
      title={isEdit ? `Edit Task: ${task?.title}` : 'Initialize Sprint Task'}
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

        {/* Section 1: Project & Title */}
        <div className="space-y-3">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Parent Project <span className="text-rose-400">*</span>
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500"
            >
              {projects.length === 0 && (
                <option value="">No projects available - Create a project first</option>
              )}
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code ? `[${p.code}] ` : ''}{p.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.projectId}</p>
            )}
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Implement multi-tenant JWT middleware and auth tests"
              error={errors.title}
              className="bg-neutral-950"
            />
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">
              Scope of Work & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detail task requirements, edge cases, acceptance criteria, and PR checklist..."
              className="w-full p-2.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Status, Priority, Estimate, Due Date */}
        <div className="pt-3 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Status</label>
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
            <label className="block text-neutral-300 font-medium mb-1">Est. Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={formData.estimatedHours}
              onChange={(e) => handleChange('estimatedHours', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
            />
            {errors.estimatedHours && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.estimatedHours}</p>
            )}
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Section 3: Checklist Items */}
        <div className="pt-3 border-t border-neutral-800 space-y-2">
          <label className="block text-neutral-300 font-medium">
            Checklist Items & Milestones ({formData.checklist.length})
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={handleAddChecklistItem}
              placeholder="Type checklist step and press Enter (e.g. Write integration test)..."
              className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddChecklistClick}
              className="text-xs border-neutral-800"
            >
              Add Item
            </Button>
          </div>

          {formData.checklist.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {formData.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs"
                >
                  <span className="text-neutral-200">{item.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-neutral-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {loading ? 'Saving...' : isEdit ? 'Save Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
