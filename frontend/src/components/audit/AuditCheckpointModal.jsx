import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  FileCheck2,
  KeyRound,
  AlertOctagon,
  Layers,
  Send,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { useAuth } from '../../context/AuthContext';

const COMPLIANCE_TEMPLATES = [
  {
    title: 'SOC 2 Type II Annual Access Audit',
    action: 'SOC2_ACCESS_AUDIT_VERIFIED',
    entityType: 'Security',
    category: 'compliance',
    notes: 'Completed annual user access matrix review across all workspace tenants. Confirmed principle of least privilege enforcement.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
  },
  {
    title: 'Quarterly RBAC Permission Review',
    action: 'QUARTERLY_RBAC_REVIEW_APPROVED',
    entityType: 'Security',
    category: 'access_review',
    notes: 'Audited owner, admin, and member role assignments. Zero unapproved privilege escalations detected.',
    icon: Lock,
    color: 'text-sky-400',
  },
  {
    title: 'OAuth & API Key Rotation Checkpoint',
    action: 'API_CREDENTIALS_ROTATED',
    entityType: 'Security',
    category: 'security',
    notes: 'Rotated production webhook signing secrets and workspace refresh tokens per 90-day compliance cycle.',
    icon: KeyRound,
    color: 'text-purple-400',
  },
  {
    title: 'GDPR Sub-Processor Privacy Scan',
    action: 'GDPR_DATA_PRIVACY_AUDIT',
    entityType: 'Workspace',
    category: 'governance',
    notes: 'Verified cryptographic storage isolation and client data retention policies for EU compliance.',
    icon: FileCheck2,
    color: 'text-amber-400',
  },
];

export default function AuditCheckpointModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'

  const [formData, setFormData] = useState({
    action: '',
    entityType: 'Security',
    category: 'compliance',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyPreset = async (tmpl) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        action: tmpl.action,
        entityType: tmpl.entityType,
        category: tmpl.category,
        notes: tmpl.notes,
        metadata: { template: tmpl.title, signedBy: user?.email },
      });
      onClose();
    } catch (err) {
      console.warn('Failed to log preset checkpoint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!formData.action.trim() || !formData.notes.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        action: formData.action.toUpperCase().replace(/\s+/g, '_'),
        metadata: { author: user?.name, signedBy: user?.email },
      });
      setFormData({
        action: '',
        entityType: 'Security',
        category: 'compliance',
        notes: '',
      });
      onClose();
    } catch (err) {
      console.warn('Failed to log custom checkpoint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Compliance Audit Checkpoint"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Navigation Switch */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Compliance Presets</span>
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Custom Checkpoint Composer</span>
          </button>
        </div>

        {activeTab === 'presets' ? (
          <div className="space-y-2.5">
            <p className="text-xs text-neutral-400">
              Select an enterprise governance checkpoint template to append an immutable signed record to this workspace's compliance audit ledger:
            </p>

            <div className="space-y-2">
              {COMPLIANCE_TEMPLATES.map((tmpl, idx) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleApplyPreset(tmpl)}
                    className="w-full text-left p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-indigo-500/40 hover:bg-neutral-900 transition flex items-start gap-3 group disabled:opacity-50"
                  >
                    <div className="p-2 rounded-lg bg-neutral-800 border border-neutral-700/60 shrink-0 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition">
                      <Icon className={`w-4 h-4 ${tmpl.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-200 group-hover:text-indigo-300 transition">
                          {tmpl.title}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-0.5">
                          Sign & Log →
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        Action: {tmpl.action}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">
                        {tmpl.notes}
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
                  Action Key *
                </label>
                <Input
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  placeholder="e.g. PEN_TEST_COMPLETED"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="compliance">Compliance (SOC2 / ISO)</option>
                  <option value="security">Security Event</option>
                  <option value="access_review">RBAC Access Review</option>
                  <option value="governance">Governance & Policy</option>
                  <option value="system_event">System Architecture</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Target Entity Scope
              </label>
              <Input
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                placeholder="e.g. Security, Workspace, or Auth"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Audit Notes & Verification Evidence *
              </label>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Describe scope, auditor sign-off reference, and verification outcome..."
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
                disabled={isSubmitting || !formData.action.trim() || !formData.notes.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 font-medium"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Recording...' : 'Commit Audit Checkpoint'}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
