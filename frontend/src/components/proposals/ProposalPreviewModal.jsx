import React from 'react';
import {
  X,
  Printer,
  FileCheck2,
  Building2,
  Calendar,
  ShieldCheck,
  Send,
  PenTool,
  CheckCircle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function ProposalPreviewModal({
  isOpen,
  onClose,
  proposal,
  onSend,
  onSign,
}) {
  const { currentWorkspace } = useWorkspace();

  if (!isOpen || !proposal) return null;

  const handlePrint = () => {
    window.print();
  };

  const isAccepted = proposal.status === 'accepted';
  const client = proposal.clientId || {};
  const project = proposal.projectId || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-950/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {proposal.proposalNumber}
            </span>
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Document Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>

            {proposal.status === 'draft' && (
              <button
                onClick={() => {
                  onClose();
                  onSend(proposal);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Client</span>
              </button>
            )}

            {!isAccepted && (
              <button
                onClick={() => {
                  onClose();
                  onSign(proposal);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Sign & Ratify</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Proposal Document Body */}
        <div className="p-8 sm:p-12 space-y-8 bg-neutral-900 print:bg-white print:text-neutral-900 text-neutral-100 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header Brand & Proposal Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-800 print:border-neutral-200 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
                  V
                </div>
                <span className="text-xl font-extrabold tracking-tight">
                  {currentWorkspace?.name || 'VEYORA Workspace'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 print:text-neutral-600 max-w-sm">
                Multi-Tenant Client Operations & Enterprise Deliverables
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 print:text-indigo-600">
                Project Proposal & Statement of Work
              </span>
              <div className="text-2xl font-mono font-extrabold text-neutral-100 print:text-neutral-900">
                {proposal.proposalNumber}
              </div>
              <div className="text-xs text-neutral-400 print:text-neutral-600">
                Date:{' '}
                {proposal.issueDate
                  ? new Date(proposal.issueDate).toLocaleDateString()
                  : 'N/A'}
              </div>
              {proposal.validUntil && (
                <div className="text-xs text-neutral-400 print:text-neutral-600">
                  Valid Until: {new Date(proposal.validUntil).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Prepared For / Prepared By Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500">
                Prepared For:
              </span>
              <div className="space-y-1 text-sm text-neutral-200 print:text-neutral-800">
                <div className="font-bold text-base text-neutral-100 print:text-neutral-900">
                  {client.company || client.name}
                </div>
                {client.company && <div>Attention: {client.name}</div>}
                {client.email && <div className="text-neutral-400 print:text-neutral-600">{client.email}</div>}
                {client.phone && <div className="text-neutral-400 print:text-neutral-600">{client.phone}</div>}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500">
                Project Scope & Deliverable:
              </span>
              <div className="space-y-1 text-sm text-neutral-200 print:text-neutral-800">
                <div className="font-bold text-base text-neutral-100 print:text-neutral-900">
                  {proposal.title}
                </div>
                {project.name && (
                  <div className="text-indigo-400 print:text-indigo-600">
                    Linked Initiative: {project.name}
                  </div>
                )}
                <div className="text-xs text-neutral-400 print:text-neutral-600">
                  Status:{' '}
                  <span className="uppercase font-semibold text-neutral-300 print:text-neutral-800">
                    {proposal.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500">
              Itemized Scope of Deliverables
            </h4>
            <div className="overflow-x-auto rounded-lg border border-neutral-800 print:border-neutral-200">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-950/70 print:bg-neutral-100 border-b border-neutral-800 print:border-neutral-200 text-xs font-semibold text-neutral-400 print:text-neutral-700 uppercase">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center w-24">Qty</th>
                    <th className="py-3 px-4 text-right w-32">Rate</th>
                    <th className="py-3 px-4 text-right w-32">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 print:divide-neutral-200">
                  {proposal.lineItems?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/20 print:hover:bg-transparent">
                      <td className="py-3 px-4 text-neutral-500 text-xs">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-neutral-200 print:text-neutral-900">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-center text-neutral-300 print:text-neutral-700">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-300 print:text-neutral-700">
                        ${(item.unitPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-100 print:text-neutral-900">
                        ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-8 pt-4">
            <div className="flex-1 space-y-4">
              {proposal.notes && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500">
                    Scope Notes
                  </span>
                  <p className="text-xs text-neutral-300 print:text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {proposal.notes}
                  </p>
                </div>
              )}

              {proposal.terms && (
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500">
                    Terms & Conditions
                  </span>
                  <p className="text-xs text-neutral-400 print:text-neutral-600 leading-relaxed whitespace-pre-wrap">
                    {proposal.terms}
                  </p>
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-72 p-4 rounded-xl bg-neutral-950/60 print:bg-neutral-50 border border-neutral-800 print:border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400 print:text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-mono text-neutral-200 print:text-neutral-900">
                  ${(proposal.subtotal || 0).toLocaleString()}
                </span>
              </div>
              {proposal.discount > 0 && (
                <div className="flex justify-between text-rose-400 print:text-rose-600">
                  <span>Discount:</span>
                  <span className="font-mono">-${proposal.discount.toLocaleString()}</span>
                </div>
              )}
              {proposal.taxRate > 0 && (
                <div className="flex justify-between text-neutral-400 print:text-neutral-600">
                  <span>Tax ({proposal.taxRate}%):</span>
                  <span className="font-mono text-neutral-200 print:text-neutral-900">
                    ${(proposal.taxAmount || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-neutral-800 print:border-neutral-300 text-sm font-bold text-neutral-100 print:text-neutral-900">
                <span>Total Amount:</span>
                <span className="text-emerald-400 print:text-emerald-700 font-mono">
                  ${(proposal.totalAmount || 0).toLocaleString()} {proposal.currency || 'USD'}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature Execution Block */}
          <div className="pt-8 border-t border-neutral-800 print:border-neutral-200">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-500 block mb-3">
              Acceptance & Digital Signatures
            </span>

            {isAccepted && proposal.signature ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 print:bg-emerald-50 border border-emerald-500/20 print:border-emerald-300 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-emerald-400 print:text-emerald-600 shrink-0" />
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-sm text-emerald-300 print:text-emerald-800 flex items-center gap-2">
                    Contract Ratified & Legally Binding
                    <CheckCircle className="w-4 h-4 text-emerald-400 print:text-emerald-600" />
                  </div>
                  <div className="text-neutral-300 print:text-neutral-800 font-medium">
                    Signed by: <strong>{proposal.signature.signedBy}</strong> (
                    {proposal.signature.signedEmail})
                  </div>
                  <div className="text-neutral-400 print:text-neutral-600 text-[11px]">
                    Timestamp:{' '}
                    {new Date(proposal.signature.signedAt).toLocaleString()} • IP Address:{' '}
                    {proposal.signature.ipAddress || '127.0.0.1'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-950/40 print:bg-neutral-50 border border-dashed border-neutral-800 print:border-neutral-300 text-xs text-neutral-400 print:text-neutral-600 flex items-center justify-between">
                <span>
                  This proposal is currently in <strong>{proposal.status.toUpperCase()}</strong>{' '}
                  state awaiting client ratification.
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onSign(proposal);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold print:hidden cursor-pointer"
                >
                  Sign Document
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
