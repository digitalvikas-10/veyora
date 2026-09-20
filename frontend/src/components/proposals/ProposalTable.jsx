import React from 'react';
import {
  FileText,
  Building2,
  Calendar,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  PenTool,
} from 'lucide-react';

export default function ProposalTable({
  proposals = [],
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
          label: 'Sent',
          icon: Send,
          classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
      case 'viewed':
        return {
          label: 'Viewed',
          icon: Eye,
          classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        };
      case 'accepted':
        return {
          label: 'Accepted',
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

  if (proposals.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-sm">
        No proposals match your current filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-950/40 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            <th className="py-3 px-4">Proposal / Title</th>
            <th className="py-3 px-4">Client</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Issue Date</th>
            <th className="py-3 px-4">Valid Until</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60 text-sm">
          {proposals.map((proposal) => {
            const badge = getStatusBadge(proposal.status);
            const StatusIcon = badge.icon;
            const isAccepted = proposal.status === 'accepted';
            const clientName = proposal.clientId?.name || 'Unassigned';
            const clientCompany = proposal.clientId?.company;

            return (
              <tr
                key={proposal._id}
                className="hover:bg-neutral-800/30 transition-colors group"
              >
                {/* Proposal # & Title */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {proposal.proposalNumber}
                    </span>
                    <span className="font-medium text-neutral-200 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                      {proposal.title}
                    </span>
                    {proposal.projectId?.name && (
                      <span className="text-[11px] text-neutral-500">
                        Proj: {proposal.projectId.name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Client */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <div>
                      <div className="text-neutral-200 font-medium truncate max-w-[160px]">
                        {clientCompany || clientName}
                      </div>
                      {clientCompany && (
                        <div className="text-xs text-neutral-500">{clientName}</div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </td>

                {/* Amount */}
                <td className="py-3 px-4">
                  <div className="font-bold text-emerald-400">
                    ${(proposal.totalAmount || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {proposal.lineItems?.length || 0} item(s)
                  </div>
                </td>

                {/* Issue Date */}
                <td className="py-3 px-4 text-xs text-neutral-400">
                  {proposal.issueDate
                    ? new Date(proposal.issueDate).toLocaleDateString()
                    : 'N/A'}
                </td>

                {/* Valid Until */}
                <td className="py-3 px-4 text-xs text-neutral-400">
                  {proposal.validUntil
                    ? new Date(proposal.validUntil).toLocaleDateString()
                    : '—'}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onPreview(proposal)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {proposal.status === 'draft' && (
                      <button
                        onClick={() => onSend(proposal)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 transition-colors"
                        title="Send to Client"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}

                    {!isAccepted && (
                      <button
                        onClick={() => onSign(proposal)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                        title="Sign Contract"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>
                    )}

                    {!isAccepted && (
                      <button
                        onClick={() => onEdit(proposal)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                        title="Edit Proposal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(proposal._id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      title="Delete Proposal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
