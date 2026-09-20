import React, { useState } from 'react';
import {
  GlobeLock,
  Shield,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Laptop,
} from 'lucide-react';

export const IpFirewallManager = ({ firewall, onUpdateFirewall }) => {
  const [mode, setMode] = useState(firewall?.mode || 'allow_all');
  const [allowlist, setAllowlist] = useState(firewall?.allowlist || []);
  const [blocklist, setBlocklist] = useState(firewall?.blocklist || []);
  const [newIp, setNewIp] = useState('');
  const [testIp, setTestIp] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    const ip = newIp.trim();

    if (mode === 'allowlist_only') {
      if (!allowlist.includes(ip)) {
        setAllowlist([...allowlist, ip]);
      }
    } else {
      if (!blocklist.includes(ip)) {
        setBlocklist([...blocklist, ip]);
      }
    }
    setNewIp('');
  };

  const handleRemoveRule = (ipToRemove, type) => {
    if (type === 'allowlist') {
      setAllowlist(allowlist.filter((ip) => ip !== ipToRemove));
    } else {
      setBlocklist(blocklist.filter((ip) => ip !== ipToRemove));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateFirewall({
        mode,
        allowlist,
        blocklist,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const runTestSimulation = () => {
    if (!testIp.trim()) return;
    const ip = testIp.trim();

    if (mode === 'allow_all') {
      setTestResult({ allowed: true, reason: 'Firewall is in Open Access mode.' });
      return;
    }

    if (mode === 'blocklist_active') {
      const isBlocked = blocklist.some((b) => b === ip || b === '0.0.0.0');
      if (isBlocked) {
        setTestResult({ allowed: false, reason: `Matched active blocklist rule (${ip}).` });
      } else {
        setTestResult({ allowed: true, reason: 'IP is not present in blocklist.' });
      }
      return;
    }

    if (mode === 'allowlist_only') {
      const isAllowed =
        allowlist.some((a) => a === ip) ||
        ['127.0.0.1', '::1', 'localhost'].includes(ip);
      if (isAllowed) {
        setTestResult({ allowed: true, reason: 'IP matches an authorized allowlist entry.' });
      } else {
        setTestResult({ allowed: false, reason: 'IP is not on the authorized allowlist (Zero Trust).' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Firewall Mode Selection Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <GlobeLock className="w-5 h-5 text-indigo-400" />
              Perimeter IP Access Guard & Firewall
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Restrict access to your workspace by enforcing strict IP CIDR boundaries or quarantine
              threat actor IPs.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Policy...' : 'Save Firewall Rules'}
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode('allow_all')}
            className={`p-4 rounded-xl border text-left transition-all ${
              mode === 'allow_all'
                ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Open Access</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                Default
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Allow all valid authenticated requests from any network IP.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('allowlist_only')}
            className={`p-4 rounded-xl border text-left transition-all ${
              mode === 'allowlist_only'
                ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-emerald-300">Allowlist Only</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Zero Trust
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Only listed corporate CIDR / office IPs can access the workspace.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('blocklist_active')}
            className={`p-4 rounded-xl border text-left transition-all ${
              mode === 'blocklist_active'
                ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-sm'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-rose-300">Blocklist Active</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                Quarantine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Block explicitly listed suspicious IP addresses and subnets.
            </p>
          </button>
        </div>
      </div>

      {/* Rules Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center justify-between">
              <span>
                {mode === 'allowlist_only'
                  ? `Authorized IP Allowlist (${allowlist.length})`
                  : `Quarantined IP Blocklist (${blocklist.length})`}
              </span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                Active Mode: {mode}
              </span>
            </h4>

            {/* Add IP Form */}
            <form onSubmit={handleAddRule} className="flex gap-2">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="e.g. 192.168.1.100 or 10.0.0.0/24"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Rule
              </button>
            </form>

            {/* Active Rules List */}
            <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
              {(mode === 'allowlist_only' ? allowlist : blocklist).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No custom IP rules defined. Add an IP address or subnet above.
                </div>
              ) : (
                (mode === 'allowlist_only' ? allowlist : blocklist).map((ip) => (
                  <div
                    key={ip}
                    className="py-2.5 flex items-center justify-between text-xs font-mono text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      {ip}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveRule(ip, mode === 'allowlist_only' ? 'allowlist' : 'blocklist')
                      }
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Rule Simulator */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              Live IP Access Simulator
            </h4>
            <p className="text-xs text-slate-400">
              Test an IP address against the current rule configuration before saving.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={testIp}
                onChange={(e) => setTestIp(e.target.value)}
                placeholder="Enter client IP to test"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={runTestSimulation}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                Evaluate IP Access
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  testResult.allowed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {testResult.allowed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> ACCESS GRANTED
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="w-4 h-4" /> ACCESS DENIED (HTTP 403)
                    </>
                  )}
                </div>
                <p className="opacity-90">{testResult.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
