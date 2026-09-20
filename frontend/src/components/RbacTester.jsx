import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Key,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  FileCheck,
  Layers,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RbacTester() {
  const { user, workspace, userPermissions, switchPersona, loading: authLoading } = useAuth();

  const [matrixData, setMatrixData] = useState(null);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [switchingRole, setSwitchingRole] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Probe Test Results State
  const [probeResults, setProbeResults] = useState({});
  const [probeLoading, setProbeLoading] = useState({});

  // Fetch RBAC Matrix from backend
  const fetchMatrix = async () => {
    try {
      setMatrixLoading(true);
      const res = await api.get('/rbac/matrix');
      if (res?.data) {
        setMatrixData(res.data);
      }
    } catch (err) {
      console.error('Failed to load RBAC matrix:', err);
    } finally {
      setMatrixLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  // Handle Switching Persona
  const handleSwitchPersona = async (role) => {
    setSwitchingRole(role);
    try {
      await switchPersona(role);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setSwitchingRole(null);
    }
  };

  // Run live diagnostic probe
  const runProbe = async (key, method, url) => {
    setProbeLoading((prev) => ({ ...prev, [key]: true }));
    const startTime = performance.now();
    try {
      const res = method === 'post' ? await api.post(url) : await api.get(url);
      const elapsed = Math.round(performance.now() - startTime);
      setProbeResults((prev) => ({
        ...prev,
        [key]: {
          status: 200,
          success: true,
          message: res.message || 'Access granted',
          data: res.data,
          latency: `${elapsed}ms`,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setProbeResults((prev) => ({
        ...prev,
        [key]: {
          status: err.status || 403,
          success: false,
          message: err.message || 'Access Forbidden',
          errors: err.errors || [],
          latency: `${elapsed}ms`,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setProbeLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const personaList = [
    {
      role: 'owner',
      title: 'Workspace Owner',
      weight: 80,
      scope: 'Tenant Root',
      color: 'violet',
      borderClass: 'border-violet-500/30 hover:border-violet-500/60',
      activeClass: 'bg-violet-500/10 border-violet-500 text-violet-300 ring-1 ring-violet-500/30',
      desc: 'Full workspace authority, billing subscriptions, and team administration.',
    },
    {
      role: 'admin',
      title: 'Operations Manager',
      weight: 60,
      scope: 'Workspace Admin',
      color: 'indigo',
      borderClass: 'border-indigo-500/30 hover:border-indigo-500/60',
      activeClass: 'bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30',
      desc: 'Oversees team operations, projects, tasks, and invoices without workspace deletion.',
    },
    {
      role: 'member',
      title: 'Team Member',
      weight: 40,
      scope: 'Staff Execution',
      color: 'blue',
      borderClass: 'border-blue-500/30 hover:border-blue-500/60',
      activeClass: 'bg-blue-500/10 border-blue-500 text-blue-300 ring-1 ring-blue-500/30',
      desc: 'Executes assigned project deliverables, logs task hours, and updates statuses.',
    },
    {
      role: 'client',
      title: 'Client Stakeholder',
      weight: 20,
      scope: 'Client Portal',
      color: 'emerald',
      borderClass: 'border-emerald-500/30 hover:border-emerald-500/60',
      activeClass: 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/30',
      desc: 'External portal view: signs proposals, monitors milestones, and pays invoices.',
    },
    {
      role: 'viewer',
      title: 'Auditor / Viewer',
      weight: 10,
      scope: 'Read-Only Feed',
      color: 'amber',
      borderClass: 'border-amber-500/30 hover:border-amber-500/60',
      activeClass: 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30',
      desc: 'Read-only access to verify project deliverables, documents, and invoices.',
    },
  ];

  const probeDefinitions = [
    {
      key: 'owner_probe',
      title: 'Owner-Only Route',
      method: 'get',
      url: '/rbac/probes/owner-only',
      guardType: 'Role Guard (owner, superadmin)',
      desc: 'Requires verified root ownership of the workspace tenant.',
    },
    {
      key: 'admin_probe',
      title: 'Admin Hierarchy Route',
      method: 'get',
      url: '/rbac/probes/admin-level',
      guardType: 'Hierarchy Guard (weight >= 60)',
      desc: 'Accessible by Admin, Owner, and Superadmin roles.',
    },
    {
      key: 'member_probe',
      title: 'Member Execution Route',
      method: 'get',
      url: '/rbac/probes/member-level',
      guardType: 'Hierarchy Guard (weight >= 40)',
      desc: 'Accessible by Team Members, Managers, and Owners.',
    },
    {
      key: 'client_probe',
      title: 'Client Portal Exclusive',
      method: 'get',
      url: '/rbac/probes/client-only',
      guardType: 'Exclusive Role (client)',
      desc: 'Accessible strictly by verified external Client Portal accounts.',
    },
    {
      key: 'billing_probe',
      title: 'Billing Action',
      method: 'post',
      url: '/rbac/probes/billing-action',
      guardType: 'Permission Guard (workspace:billing)',
      desc: 'Requires granular workspace:billing permission (Owner only).',
    },
    {
      key: 'proposal_probe',
      title: 'Proposal Contract Sign',
      method: 'post',
      url: '/rbac/probes/proposal-approve',
      guardType: 'Permission Guard (proposal:approve)',
      desc: 'Authorized for Client Stakeholders & Workspace Owners.',
    },
  ];

  // Filter permission list for the matrix table
  const allPermissions = matrixData?.permissions ? Object.values(matrixData.permissions) : [];
  const filteredPermissions = allPermissions.filter((perm) => {
    const matchesCategory =
      activeCategory === 'all' || perm.startsWith(`${activeCategory}:`);
    const matchesQuery =
      searchQuery === '' ||
      perm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const activeRole = user?.role || 'none';

  return (
    <div id="phase-4-rbac-section" className="space-y-6">
      {/* Phase 4 Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Phase 4: Role-Based Access Control (RBAC) & Hierarchy
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active & Enforced
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Granular capability matrix mapping roles across workspaces, client portals, and administrative hierarchies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-neutral-400">Active Identity:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-950 border border-neutral-800 text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {user ? `${user.name} (${user.role})` : 'Guest'}
            </span>
          </div>
        </div>

        {/* Quick Role Persona Switcher */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              One-Click Persona Switcher (Test As Any Role)
            </span>
            <span className="text-[11px] text-neutral-400">
              Instantly boots a live session with that role's token
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {personaList.map((p) => {
              const isSelected = activeRole === p.role;
              const isSwitchingThis = switchingRole === p.role;

              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleSwitchPersona(p.role)}
                  disabled={isSwitchingThis || authLoading}
                  className={`p-3 rounded-xl border text-left transition relative overflow-hidden ${
                    isSelected
                      ? p.activeClass
                      : `bg-neutral-950/80 text-neutral-300 ${p.borderClass}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold capitalize">{p.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                      lvl {p.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {p.desc}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400 font-mono">{p.scope}</span>
                    {isSelected && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                    {isSwitchingThis && (
                      <RefreshCw className="w-3 h-3 animate-spin text-neutral-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Live Probes vs. Matrix Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live Endpoint Access Control Probes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Live Policy Enforcement Probes
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Execute real requests to test role & permission barriers
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {probeDefinitions.map((probe) => {
                const res = probeResults[probe.key];
                const isLoading = probeLoading[probe.key];

                return (
                  <div
                    key={probe.key}
                    className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2.5 transition hover:border-neutral-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-200">
                            {probe.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase">
                            {probe.method}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{probe.desc}</p>
                        <div className="text-[10px] text-indigo-400 font-mono mt-1">
                          {probe.guardType}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => runProbe(probe.key, probe.method, probe.url)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition flex items-center gap-1.5 shrink-0"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        )}
                        Test Probe
                      </button>
                    </div>

                    {/* Result Banner */}
                    {res && (
                      <div
                        className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                          res.success
                            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                            : 'bg-red-950/40 border-red-800/80 text-red-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            {res.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            HTTP {res.status} {res.success ? 'Granted' : 'Forbidden'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {res.latency} • {res.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300 pt-0.5">{res.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Permission Matrix Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Granular Permission Matrix
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live verification of capabilities across all system domains
                </p>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['all', 'workspace', 'team', 'client', 'project', 'task', 'proposal', 'invoice', 'document', 'audit'].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-md capitalize transition font-medium ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                    <th className="py-2.5 px-3 font-semibold text-neutral-200">Capability / Action</th>
                    <th className={`py-2.5 px-2 text-center ${activeRole === 'owner' ? 'bg-violet-950/40 text-violet-300 font-bold' : ''}`}>
                      Owner
                    </th>
                    <th className={`py-2.5 px-2 text-center ${activeRole === 'admin' ? 'bg-indigo-950/40 text-indigo-300 font-bold' : ''}`}>
                      Admin
                    </th>
                    <th className={`py-2.5 px-2 text-center ${activeRole === 'member' ? 'bg-blue-950/40 text-blue-300 font-bold' : ''}`}>
                      Member
                    </th>
                    <th className={`py-2.5 px-2 text-center ${activeRole === 'client' ? 'bg-emerald-950/40 text-emerald-300 font-bold' : ''}`}>
                      Client
                    </th>
                    <th className={`py-2.5 px-2 text-center ${activeRole === 'viewer' ? 'bg-amber-950/40 text-amber-300 font-bold' : ''}`}>
                      Viewer
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {filteredPermissions.map((perm) => {
                    const ownerHas = matrixData?.rolePermissions?.owner?.includes(perm);
                    const adminHas = matrixData?.rolePermissions?.admin?.includes(perm);
                    const memberHas = matrixData?.rolePermissions?.member?.includes(perm);
                    const clientHas = matrixData?.rolePermissions?.client?.includes(perm);
                    const viewerHas = matrixData?.rolePermissions?.viewer?.includes(perm);

                    return (
                      <tr key={perm} className="hover:bg-neutral-950/40 transition">
                        <td className="py-2 px-3 text-neutral-300 font-sans font-medium">
                          {perm}
                        </td>
                        <td className={`py-2 px-2 text-center ${activeRole === 'owner' ? 'bg-violet-950/20' : ''}`}>
                          {ownerHas ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                        <td className={`py-2 px-2 text-center ${activeRole === 'admin' ? 'bg-indigo-950/20' : ''}`}>
                          {adminHas ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                        <td className={`py-2 px-2 text-center ${activeRole === 'member' ? 'bg-blue-950/20' : ''}`}>
                          {memberHas ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                        <td className={`py-2 px-2 text-center ${activeRole === 'client' ? 'bg-emerald-950/20' : ''}`}>
                          {clientHas ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                        <td className={`py-2 px-2 text-center ${activeRole === 'viewer' ? 'bg-amber-950/20' : ''}`}>
                          {viewerHas ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                          ) : (
                            <span className="text-neutral-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>Showing {filteredPermissions.length} capabilities</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> = Allowed by Role Policy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
