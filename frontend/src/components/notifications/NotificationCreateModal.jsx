import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Send,
  Layers,
  CreditCard,
  FileCheck,
  Briefcase,
  AlertCircle,
  Info,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import { useAuth } from '../../context/AuthContext';

const PRESET_TEMPLATES = [
  {
    label: 'Invoice Paid Event',
    type: 'invoice_paid',
    title: 'Payment Received: INV-2026-001 ($14,500.00)',
    message: 'Acme Global settled invoice INV-2026-001 in full via Automated ACH Transfer. Funds have been posted to workspace ledger.',
    icon: CreditCard,
    color: 'text-emerald-400',
  },
  {
    label: 'Task Assignment Event',
    type: 'task_assigned',
    title: 'New High Priority Task: Design System Tokens Audit',
    message: 'Arthur Sterling assigned you to sprint work item #TSK-804 with a due date in 48 hours.',
    icon: Layers,
    color: 'text-sky-400',
  },
  {
    label: 'Proposal Signed Event',
    type: 'proposal_signed',
    title: 'Proposal Executed: Enterprise Architecture Retainer',
    message: 'Claire Dupont (Apex Dynamics) completed digital e-signature on the Q3 SLA proposal package.',
    icon: FileCheck,
    color: 'text-purple-400',
  },
  {
    label: 'Project Milestone Event',
    type: 'project_update',
    title: 'Milestone Completed: Core Microservices Deployed',
    message: 'Phase 3 deployment sprint has reached 100% velocity. Client notification dispatched.',
    icon: Briefcase,
    color: 'text-amber-400',
  },
  {
    label: 'System Maintenance Notice',
    type: 'system',
    title: 'Workspace Backup Routine Successful',
    message: 'Multi-tenant database snapshot #BKP-9831 generated and archived to multi-region cloud bucket.',
    icon: AlertCircle,
    color: 'text-rose-400',
  },
];

export default function NotificationCreateModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'custom'

  const [formData, setFormData] = useState({
    type: 'info',
    title: '',
    message: '',
    link: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyTemplate = async (tmpl) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: tmpl.type,
        title: tmpl.title,
        message: tmpl.message,
        recipientId: user?._id || user?.id,
      });
      onClose();
    } catch (err) {
      console.warn('Dispatch failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        recipientId: user?._id || user?.id,
      });
      setFormData({
        type: 'info',
        title: '',
        message: '',
        link: '',
      });
      onClose();
    } catch (err) {
      console.warn('Dispatch failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch In-App Notification"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Subheader tab toggle */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulated Lifecycle Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Custom Alert Composer</span>
          </button>
        </div>

        {activeTab === 'templates' ? (
          <div className="space-y-2.5">
            <p className="text-xs text-neutral-400">
              Instantly fire realistic enterprise lifecycle events into your workspace notification channel to verify multi-tenant reactivity and alert states:
            </p>

            <div className="space-y-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="w-full text-left p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-indigo-500/40 hover:bg-neutral-900 transition flex items-start gap-3 group disabled:opacity-50"
                  >
                    <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700/60 shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition">
                      <Icon className={`w-4 h-4 ${tmpl.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200 group-hover:text-indigo-300 transition">
                          {tmpl.label}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-0.5">
                          Trigger Event →
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-medium truncate">
                        {tmpl.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                        {tmpl.message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Notification Category
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="info">General Info (info)</option>
                  <option value="task_assigned">Task Assignment (task_assigned)</option>
                  <option value="invoice_paid">Invoice & Billing (invoice_paid)</option>
                  <option value="proposal_signed">Proposal Execution (proposal_signed)</option>
                  <option value="project_update">Project Milestone (project_update)</option>
                  <option value="system">System Notice (system)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Recipient
                </label>
                <div className="px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                  {user?.name || 'Current User'} ({user?.email || 'Active Session'})
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Alert Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Critical SLA Warning or Sprint Deliverable Approved"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Message Body *
              </label>
              <Textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe the context, trigger parameters, or call to action..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !formData.title.trim() || !formData.message.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Notification'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
