import React, { useState } from 'react';
import {
  History,
  Clock,
  User,
  Shield,
  ShieldCheck,
  Globe,
  Terminal,
  Copy,
  Check,
  Code,
  Layers,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getActionBadgeConfig, getEntityIcon } from './AuditLogTable';

export default function AuditDetailModal({
  isOpen,
  onClose,
  log,
}) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const actionConfig = getActionBadgeConfig(log.action);
  const EntityIcon = getEntityIcon(log.entityType);

  const formattedDate = (() => {
    try {
      if (!log.createdAt) return 'N/A';
      return new Date(log.createdAt).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'long',
      });
    } catch (e) {
      return 'N/A';
    }
  })();

  const rawJson = JSON.stringify(log, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Inspection"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Event Header Banner */}
        <div className="flex items-start justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700/60 text-indigo-400">
              <EntityIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${actionConfig.bg}`}>
                  {actionConfig.label}
                </span>
                <span className="text-xs font-semibold text-neutral-300">
                  {log.entityType} Mutation
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono block mt-1">
                Log ID: {log._id || log.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Immutable</span>
          </div>
        </div>

        {/* Key Event Metadata Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Timestamp */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Recorded Timestamp
            </span>
            <div className="flex items-center gap-1.5 text-neutral-200">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{formattedDate}</span>
            </div>
          </div>

          {/* Actor */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Authorized Actor
            </span>
            <div className="flex items-center gap-1.5 text-neutral-200">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold">{log.actorName || 'System'}</span>
              <span className="text-neutral-500 font-mono text-[11px]">({log.actorEmail || 'daemon'})</span>
            </div>
          </div>

          {/* Target Entity */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Target Entity ID
            </span>
            <div className="flex items-center gap-1.5 font-mono text-neutral-300">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{log.entityId || 'Global / Workspace'}</span>
            </div>
          </div>

          {/* Remote IP */}
          <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Client Network IP
            </span>
            <div className="flex items-center gap-1.5 font-mono text-neutral-300">
              <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{log.ipAddress || '127.0.0.1'}</span>
            </div>
          </div>
        </div>

        {/* Client User Agent if available */}
        {log.userAgent && (
          <div className="p-3 rounded-xl bg-neutral-950/40 border border-neutral-800/60 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              User Agent Client Header
            </span>
            <span className="text-[11px] text-neutral-400 font-mono break-all block">
              {log.userAgent}
            </span>
          </div>
        )}

        {/* Raw Payload JSON */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-neutral-400" />
              <span>Full Audit Payload (JSON)</span>
            </span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 font-mono overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
            {rawJson}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
}
