import React from 'react';
import {
  History,
  Clock,
  User,
  Shield,
  Layers,
  FileText,
  DollarSign,
  FolderOpen,
  Briefcase,
  Users,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Copy,
  Check,
  Globe,
} from 'lucide-react';
import { formatTimeAgo } from '../notifications/NotificationItem';
import Badge from '../ui/Badge';

export const getActionBadgeConfig = (action = '') => {
  const act = action.toUpperCase();
  if (act.includes('CREATE') || act.includes('ADD')) {
    return {
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      label: act,
    };
  }
  if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('PURGE')) {
    return {
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      label: act,
    };
  }
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
    return {
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      label: act,
    };
  }
  if (act.includes('SIGN') || act.includes('EXECUTE')) {
    return {
      bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      label: act,
    };
  }
  if (act.includes('PAY') || act.includes('SETTLEMENT')) {
    return {
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      label: act,
    };
  }
  if (act.includes('UPLOAD')) {
    return {
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      label: act,
    };
  }
  if (act.includes('CHECKPOINT') || act.includes('REVIEW') || act.includes('AUDIT')) {
    return {
      bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      label: act,
    };
  }
  return {
    bg: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    label: act || 'EVENT',
  };
};

export const getEntityIcon = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('client')) return Users;
  if (t.includes('project')) return Briefcase;
  if (t.includes('task')) return Layers;
  if (t.includes('invoice')) return DollarSign;
  if (t.includes('proposal')) return FileText;
  if (t.includes('document')) return FolderOpen;
  if (t.includes('security') || t.includes('auth') || t.includes('rbac')) return Shield;
  return History;
};

export default function AuditLogTable({
  logs = [],
  onSelectLog,
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-900/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Actor</th>
            <th className="py-3 px-4">Action</th>
            <th className="py-3 px-4">Entity</th>
            <th className="py-3 px-4">Audit Summary</th>
            <th className="py-3 px-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {logs.map((log, idx) => {
            const actionConfig = getActionBadgeConfig(log.action);
            const EntityIcon = getEntityIcon(log.entityType);
            const timeAgo = formatTimeAgo(log.createdAt);

            const detailsSummary = (() => {
              if (log.details?.notes) return log.details.notes;
              if (log.details?.reason) return log.details.reason;
              if (log.details?.changes) {
                const keys = Object.keys(log.details.changes);
                return `Modified properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
              }
              if (log.details?.fileName) return `File: ${log.details.fileName}`;
              if (log.details?.amount) return `Amount: $${log.details.amount}`;
              return `Target ${log.entityType} ID: ${log.entityId || 'N/A'}`;
            })();

            return (
              <tr
                key={log._id || log.id || `audit-${idx}`}
                onClick={() => onSelectLog(log)}
                className="hover:bg-neutral-850/60 transition cursor-pointer group"
              >
                {/* Timestamp */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{timeAgo}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono block">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>

                {/* Actor */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-[10px] border border-indigo-500/30">
                      {log.actorName ? log.actorName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className="min-w-0 max-w-[140px]">
                      <span className="block font-semibold text-neutral-200 truncate">
                        {log.actorName || 'System'}
                      </span>
                      <span className="text-[10px] text-neutral-500 block truncate font-mono">
                        {log.actorEmail || 'daemon'}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Action Badge */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${actionConfig.bg}`}
                  >
                    {actionConfig.label}
                  </span>
                </td>

                {/* Entity */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      <EntityIcon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="block font-semibold text-neutral-300">
                        {log.entityType}
                      </span>
                      {log.entityId && (
                        <button
                          onClick={(e) => handleCopyId(log.entityId, e)}
                          className="text-[10px] text-neutral-500 hover:text-indigo-400 font-mono flex items-center gap-1 group/id"
                          title="Click to copy entity ID"
                        >
                          <span className="truncate max-w-[80px]">{log.entityId}</span>
                          {copiedId === log.entityId ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 opacity-0 group-hover/id:opacity-100 transition" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {/* Audit Summary */}
                <td className="py-3 px-4 max-w-xs">
                  <p className="text-xs text-neutral-300 truncate font-mono text-[11px]">
                    {detailsSummary}
                  </p>
                  {log.ipAddress && (
                    <span className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 mt-0.5">
                      <Globe className="w-2.5 h-2.5 text-neutral-600" />
                      <span>{log.ipAddress}</span>
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLog(log);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-indigo-600 hover:text-white text-neutral-400 border border-neutral-700/60 transition"
                    title="Inspect Raw Audit Payload"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
