import React, { useState } from 'react';
import { X, ShieldCheck, PenTool, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProposalSignModal({
  isOpen,
  onClose,
  proposal,
  onSign,
}) {
  const [signedBy, setSignedBy] = useState('');
  const [signedEmail, setSignedEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill from client info if available
  React.useEffect(() => {
    if (proposal) {
      setSignedBy(proposal.clientId?.name || '');
      setSignedEmail(proposal.clientId?.email || '');
      setAgreed(false);
      setError('');
    }
  }, [proposal, isOpen]);

  if (!isOpen || !proposal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signedBy.trim()) {
      setError('Signer full name is required');
      return;
    }
    if (!signedEmail.trim() || !signedEmail.includes('@')) {
      setError('A valid signer email is required');
      return;
    }
    if (!agreed) {
      setError('You must accept the terms of the agreement to sign');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSign(proposal._id, { signedBy, signedEmail });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100">
                Digital Contract Acceptance
              </h2>
              <p className="text-xs text-neutral-400">
                Ratify and e-sign {proposal.proposalNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Proposal Recap */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Contract Scope:</span>
              <span className="font-semibold text-neutral-200">{proposal.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Total Value:</span>
              <span className="font-bold text-emerald-400 font-mono">
                ${(proposal.totalAmount || 0).toLocaleString()} {proposal.currency || 'USD'}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Full Legal Name of Signer <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="e.g. Alex Henderson"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Signer Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={signedEmail}
                onChange={(e) => setSignedEmail(e.target.value)}
                placeholder="e.g. alex@clientcompany.com"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Signature Preview Style */}
            {signedBy && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-neutral-400">
                  Electronic Signature Preview
                </label>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-serif italic text-xl text-emerald-300 tracking-wide">
                  {signedBy}
                </div>
              </div>
            )}

            {/* Legal terms checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded bg-neutral-900 border-neutral-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-neutral-400 group-hover:text-neutral-300 leading-relaxed">
                I hereby declare that I am authorized to accept this proposal on behalf of the client, agree to the pricing and deliverables, and understand this creates a legally binding contract.
              </span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Ratifying...' : 'Sign & Ratify Contract'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
