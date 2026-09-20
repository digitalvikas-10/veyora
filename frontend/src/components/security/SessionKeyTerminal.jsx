import React, { useState } from 'react';
import {
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Terminal,
} from 'lucide-react';

export const SessionKeyTerminal = ({ keyRotation, onRotateKeys }) => {
  const [isRotating, setIsRotating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const lastRotated = keyRotation?.lastRotatedAt
    ? new Date(keyRotation.lastRotatedAt).toLocaleString()
    : 'System Initialization';
  const saltVersion = keyRotation?.saltVersion || 'v1-init';

  const handleExecuteRotation = async () => {
    try {
      setIsRotating(true);
      await onRotateKeys();
      setConfirmOpen(false);
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              Cryptographic Session & Key Lifecycle Terminal
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Manage JSON Web Token (JWT) cryptographic signing salts, token freshness windows, and
              session invalidation boundaries.
            </p>
          </div>

          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            Rotate Workspace Keys
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                Confirm Cryptographic Key & Salt Rotation
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rotating keys generates a new 256-bit cryptographically secure pseudorandom salt.
                An immutable SOC 2 audit record will be logged.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleExecuteRotation}
                  disabled={isRotating}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all disabled:opacity-50"
                >
                  {isRotating ? 'Rotating Keys...' : 'Confirm & Invalidate Previous Salts'}
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            Active Key Configuration
          </h4>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Signing Algorithm:</span>
              <span className="text-white font-bold">HMAC-SHA256 (HS256)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Entropy Level:</span>
              <span className="text-emerald-400 font-bold">256-bit Cryptographic CSPRNG</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Access Token TTL:</span>
              <span className="text-white">15 Minutes (Short-lived)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Refresh Token TTL:</span>
              <span className="text-white">7 Days (Sliding Window)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Active Salt Version:</span>
              <span className="text-indigo-400 font-bold">{saltVersion}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Lifecycle & Rotation Audit
          </h4>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Last Rotated:</span>
              <span className="text-white font-bold">{lastRotated}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Recommended Cycle:</span>
              <span className="text-white">90 Days (SOC 2 Type II)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Cookie Security:</span>
              <span className="text-emerald-400 font-bold">HttpOnly, SameSite=Strict</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Compliance Status:</span>
              <span className="text-emerald-400 font-bold">Compliant & Anchored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
