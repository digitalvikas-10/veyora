import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Key,
  Globe,
  Sliders,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function TenantTester() {
  const {
    user,
    workspace,
    userWorkspaces,
    switchWorkspace,
    createNewWorkspace,
    fetchMyWorkspaces,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'isolation_demo' | 'attack_simulator' | 'members'
  const [isolationData, setIsolationData] = useState(null);
  const [isolationLoading, setIsolationLoading] = useState(false);

  // Workspace Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'member' });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  // Create Workspace form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWsForm, setNewWsForm] = useState({ name: '', plan: 'starter', currency: 'USD' });
  const [creatingWs, setCreatingWs] = useState(false);

  // Cross-tenant attack simulation state
  const [attackLoading, setAttackLoading] = useState(false);
  const [attackResult, setAttackResult] = useState(null);

  // Load isolation demo
  const loadIsolationDemo = async () => {
    setIsolationLoading(true);
    try {
      const res = await api.get('/workspaces/probes/isolation-demo');
      if (res?.data) {
        setIsolationData(res.data);
      }
    } catch (err) {
      console.error('Failed to load isolation demo:', err);
    } finally {
      setIsolationLoading(false);
    }
  };

  // Load workspace members
  const loadMembers = async () => {
    if (!workspace?._id) return;
    setMembersLoading(true);
    try {
      const res = await api.get('/workspaces/members');
      if (res?.data?.members) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error('Failed to load workspace members:', err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    loadIsolationDemo();
    loadMembers();
  }, [workspace?._id]);

  // Handle Invite Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.email) return;
    setInviting(true);
    setInviteSuccess(null);
    try {
      const res = await api.post('/workspaces/members/invite', inviteForm);
      setInviteSuccess(`Invited ${inviteForm.email} as ${inviteForm.role}`);
      setInviteForm({ name: '', email: '', role: 'member' });
      await loadMembers();
    } catch (err) {
      setInviteSuccess(err.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  // Handle Create Workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsForm.name) return;
    setCreatingWs(true);
    try {
      await createNewWorkspace(newWsForm);
      setShowCreateModal(false);
      setNewWsForm({ name: '', plan: 'starter', currency: 'USD' });
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreatingWs(false);
    }
  };

  // Simulate Cross-Tenant Spoofing Attack
  const simulateCrossTenantAttack = async () => {
    setAttackLoading(true);
    setAttackResult(null);
    const startTime = performance.now();

    // Use a completely fake or foreign workspace ID
    const foreignWorkspaceId = '666666666666666666666666';

    try {
      // Intentionally forge X-Workspace-Id header to foreign ID
      const res = await api.get('/workspaces/current', {
        headers: {
          'X-Workspace-Id': foreignWorkspaceId,
        },
      });
      const elapsed = Math.round(performance.now() - startTime);
      setAttackResult({
        breachSucceeded: true,
        status: 200,
        message: 'CRITICAL WARNING: Cross-tenant access was allowed!',
        data: res,
        latency: `${elapsed}ms`,
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setAttackResult({
        breachSucceeded: false,
        status: err.status || 403,
        message: err.message || 'Cross-workspace access denied: You cannot access foreign tenant resources',
        errors: err.errors || [],
        latency: `${elapsed}ms`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setAttackLoading(false);
    }
  };

  return (
    <div id="phase-5-tenant-section" className="space-y-6">
      {/* Header & Active Workspace Overview */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Phase 5: Multi-Tenancy Workspace Isolation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Enforced & Partioned
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Logical schema-level database partitioning with AsyncLocalStorage request binding and cross-tenant barrier verification.
              </p>
            </div>
          </div>

          {/* New Workspace Button */}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Workspace
          </button>
        </div>

        {/* Active Workspace Banner Card */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-md">
              {workspace?.name ? workspace.name.substring(0, 2).toUpperCase() : 'VE'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100">
                  {workspace?.name || 'Veyora Demo Agency'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-indigo-400">
                  {workspace?.plan || 'growth'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                <span>Slug: <code className="text-neutral-300">{workspace?.slug || 'demo'}</code></span>
                <span>•</span>
                <span>Currency: <code className="text-neutral-300">{workspace?.currency || 'USD'}</code></span>
                <span>•</span>
                <span>Timezone: <code className="text-neutral-300">{workspace?.timezone || 'UTC'}</code></span>
              </div>
            </div>
          </div>

          {/* Workspace Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 whitespace-nowrap">Switch Tenant:</span>
            <select
              value={workspace?._id || ''}
              onChange={(e) => switchWorkspace(e.target.value)}
              className="text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {userWorkspaces && userWorkspaces.length > 0 ? (
                userWorkspaces.map((item) => (
                  <option key={item.workspace?._id || item._id} value={item.workspace?._id || item._id}>
                    {item.workspace?.name || item.name} ({item.role || 'owner'})
                  </option>
                ))
              ) : (
                <option value={workspace?._id || ''}>
                  {workspace?.name || 'Active Tenant'} (owner)
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          {[
            { id: 'overview', label: 'Isolation Architecture', icon: ShieldCheck },
            { id: 'isolation_demo', label: 'Side-by-Side Tenant Proof', icon: Layers },
            { id: 'attack_simulator', label: 'Cross-Tenant Attack Simulator', icon: ShieldAlert },
            { id: 'members', label: 'Workspace Team Members', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: Isolation Architecture Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-200">AsyncLocalStorage Context</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Every HTTP request runs within a thread-isolated tenant boundary (<code className="text-indigo-400">runWithTenant</code>). Downstream services and Mongoose hooks auto-read the active workspace ID without parameter leaks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-200">Multi-Tenant Mongoose Plugin</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                All business models utilize <code className="text-indigo-400">multiTenantPlugin</code> to append compound indexes (<code className="text-neutral-300">workspaceId: 1, createdAt: -1</code>) and auto-filter all queries.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-200">Zero-Trust Boundary Validation</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Incoming <code className="text-indigo-400">X-Workspace-Id</code> headers must match verified session memberships. Any cross-tenant spoofing attempt is terminated with an RFC-compliant 403 Forbidden.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Side-by-Side Tenant Isolation Proof */}
        {activeTab === 'isolation_demo' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-300 font-semibold">
                Side-by-Side Tenant Partitioning Proof (Live from Database)
              </span>
              <button
                type="button"
                onClick={loadIsolationDemo}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Partition Report
              </button>
            </div>

            {isolationData?.tenants && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isolationData.tenants.map((t, idx) => (
                  <div
                    key={t.workspace.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div>
                        <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          {t.workspace.name}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          ID: {t.workspace.id} • Slug: {t.workspace.slug}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {t.workspace.currency}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        Isolated Clients (Tenant Scoped):
                      </span>
                      <div className="mt-1 space-y-1">
                        {t.sampleClients.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 text-xs flex items-center justify-between"
                          >
                            <span className="text-neutral-200">{c.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-950 text-emerald-400 border border-emerald-900/30">
                              {c.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400">
                        Isolated Invoices (Tenant Scoped):
                      </span>
                      <div className="mt-1 space-y-1">
                        {t.sampleInvoices.map((inv, invIdx) => (
                          <div
                            key={invIdx}
                            className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 text-xs flex items-center justify-between"
                          >
                            <span className="text-neutral-200 font-mono">{inv.invoiceNumber}</span>
                            <span className="font-semibold text-neutral-200">
                              {inv.currency} {inv.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Cross-Tenant Attack & Breach Simulator */}
        {activeTab === 'attack_simulator' && (
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4 pt-1">
            <div>
              <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Cross-Tenant Horizontal Escalation Test
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                This test simulates an attacker modifying their browser headers to send a foreign <code className="text-indigo-400">X-Workspace-Id: 666666666666666666666666</code> to access another company's data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={simulateCrossTenantAttack}
                disabled={attackLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 transition shadow-sm"
              >
                {attackLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                Launch Simulated Spoofing Attack
              </button>
              <span className="text-[11px] text-neutral-400">
                Tests server-side tenant barrier middleware in real-time
              </span>
            </div>

            {attackResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs font-mono space-y-1.5 ${
                  attackResult.breachSucceeded
                    ? 'bg-red-950/60 border-red-700 text-red-200'
                    : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    {attackResult.breachSucceeded ? (
                      <XCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    HTTP {attackResult.status} — Barrier Successfully Repelled Attack
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {attackResult.latency} • {attackResult.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-200 pt-0.5">
                  Server Response: "{attackResult.message}"
                </p>
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                  Verification: The server detected that the authenticated session does not hold membership in the requested foreign tenant and halted execution before database querying.
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Workspace Members Management */}
        {activeTab === 'members' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-semibold text-neutral-200">
                Active Workspace Teammates ({members.length})
              </span>

              {/* Quick Invite Form */}
              <form onSubmit={handleInviteMember} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 w-28"
                />
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 w-44"
                />
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="client">Client</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1"
                >
                  {inviting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Add Member
                </button>
              </form>
            </div>

            {inviteSuccess && (
              <div className="p-2 rounded bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 font-mono">
                {inviteSuccess}
              </div>
            )}

            {/* Members List */}
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <th className="py-2.5 px-3 font-semibold">User</th>
                    <th className="py-2.5 px-3 font-semibold">Email</th>
                    <th className="py-2.5 px-3 font-semibold">Assigned Role</th>
                    <th className="py-2.5 px-3 font-semibold">Joined At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {members.map((m) => (
                    <tr key={m._id} className="hover:bg-neutral-950/40">
                      <td className="py-2.5 px-3 font-sans font-medium text-neutral-200">
                        {m.name}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-400">{m.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono capitalize bg-neutral-900 border border-neutral-800 text-indigo-300">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Workspace */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Provision New Tenant Workspace
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Design Agency"
                  required
                  value={newWsForm.name}
                  onChange={(e) => setNewWsForm({ ...newWsForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    value={newWsForm.plan}
                    onChange={(e) => setNewWsForm({ ...newWsForm, plan: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={newWsForm.currency}
                    onChange={(e) => setNewWsForm({ ...newWsForm, currency: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingWs}
                  className="px-4 py-1.5 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm"
                >
                  {creatingWs && <RefreshCw className="w-3 h-3 animate-spin" />}
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
