import React from 'react';
import {
  FileText,
  Calendar,
  Send,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Sparkles,
  DollarSign,
  PenTool,
} from 'lucide-react';

export default function ProposalCard({
  proposal,
  onPreview,
  onEdit,
  onSend,
  onSign,
  onDelete,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          icon: Clock,
          classes: 'bg-neutral-800 text-neutral-400 border-neutral-700',
        };
      case 'sent':
        return {
          label: 'Sent to Client',
          icon: Send,
          classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      case 'viewed':
        return {
          label: 'Viewed by Client',
          icon: Eye,
          classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'accepted':
        return {
          label: 'Contract Ratified',
          icon: CheckCircle,
          classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
      case 'declined':
        return {
          label: 'Declined',
          icon: AlertCircle,
          classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        };
      case 'expired':
        return {
          label: 'Expired',
          icon: AlertCircle,
          classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      default:
        return {
          label: status,
          icon: FileText,
          classes: 'bg-neutral-800 text-neutral-300 border-neutral-700',
        };
    }
  };

  const badge = getStatusBadge(proposal.status);
  const StatusIcon = badge.icon;
  const isAccepted = proposal.status === 'accepted';

  const clientName = proposal.clientId?.name || 'Unassigned Client';
  const clientCompany = proposal.clientId?.company;
  const projectName = proposal.projectId?.name;

  return (
    <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800/90 hover:border-neutral-700/80 transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Top Meta Bar */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-800 text-indigo-400 border border-neutral-700/60">
                {proposal.proposalNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.classes}`}
              >
                <StatusIcon className="w-3 h-3" />
                {badge.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-neutral-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {proposal.title}
            </h3>
          </div>
        </div>

        {/* Client & Project Info */}
        <div className="space-y-1.5 text-xs text-neutral-400 border-t border-neutral-800/60 pt-3">
          <div className="flex items-center gap-2 text-neutral-300 font-medium">
            <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="truncate">
              {clientCompany ? `${clientCompany} • ${clientName}` : clientName}
            </span>
          </div>
          {projectName && (
            <div className="flex items-center gap-2 text-indigo-400/90 pl-5 text-[11px]">
              <span>Project: {projectName}</span>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-lg p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-neutral-400">Total Contract Value</span>
            <span className="text-lg font-bold text-emerald-400">
              ${(proposal.totalAmount || 0).toLocaleString()} {proposal.currency || 'USD'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>
              {proposal.lineItems?.length || 0} line item{proposal.lineItems?.length === 1 ? '' : 's'}
            </span>
            {proposal.discount > 0 && (
              <span className="text-rose-400">-${proposal.discount} discount</span>
            )}
            {proposal.taxRate > 0 && (
              <span className="text-neutral-400">{proposal.taxRate}% tax included</span>
            )}
          </div>
        </div>

        {/* Date Timeline & Signer Stamp */}
        <div className="space-y-2 text-xs text-neutral-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              <span>
                Issued: {proposal.issueDate ? new Date(proposal.issueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {proposal.validUntil && (
              <span className="text-neutral-400 text-[11px]">
                Expires: {new Date(proposal.validUntil).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* E-Signature info if ratified */}
          {isAccepted && proposal.signature && (
            <div className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300/90 flex items-center justify-between">
              <span className="truncate">
                Digitally Signed by: <strong>{proposal.signature.signedBy}</strong>
              </span>
              <span className="text-neutral-400 shrink-0 text-[10px]">
                {new Date(proposal.signature.signedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          {/* Preview / View */}
          <button
            onClick={() => onPreview(proposal)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Preview & Export Proposal"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit (only if not ratified) */}
          {!isAccepted && (
            <button
              onClick={() => onEdit(proposal)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Edit Proposal Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(proposal._id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Delete Proposal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Workflow actions */}
        <div className="flex items-center gap-1.5">
          {proposal.status === 'draft' && (
            <button
              onClick={() => onSend(proposal)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          )}

          {!isAccepted && (
            <button
              onClick={() => onSign(proposal)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all cursor-pointer"
              title="Client Digital Signature Simulation"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sign / Accept</span>
            </button>
          )}

          {isAccepted && (
            <button
              onClick={() => onPreview(proposal)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
