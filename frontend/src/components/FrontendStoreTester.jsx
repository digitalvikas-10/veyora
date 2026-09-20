import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { useUI } from '../context/UIContext';
import { useData } from '../context/DataContext';
import PermissionGate from './common/PermissionGate';
import {
  Layers,
  Sparkles,
  Command,
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Shield,
  Building2,
  Database,
  RefreshCw,
  Plus,
  Lock,
  Unlock,
  Check,
  Zap,
  Users,
  Briefcase,
  CheckSquare,
  DollarSign,
  Activity,
  CreditCard,
} from 'lucide-react';

const PERSONAS = [
  { role: 'owner', name: 'Olivia Vance', label: 'Owner', weight: 80, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { role: 'admin', name: 'Arthur Sterling', label: 'Admin', weight: 60, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { role: 'member', name: 'Maya Lin', label: 'Member', weight: 40, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { role: 'client', name: 'Claire Dupont', label: 'Client', weight: 20, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { role: 'viewer', name: 'Victor Reed', label: 'Viewer', weight: 10, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
];

export default function FrontendStoreTester() {
  const { user, userPermissions, switchPersona, accessToken } = useAuth();
  const { currentWorkspace, workspaces, changeWorkspace, members, workspaceStats } = useWorkspace();
  const { addToast, toggleCommandPalette, toasts, clearToasts } = useUI();
  const {
    clients,
    projects,
    tasks,
    invoices,
    billingSummary,
    unreadNotificationsCount,
    createClient,
    createTask,
    refreshAllData,
    loadingStates,
  } = useData();

  const [isMutating, setIsMutating] = useState(false);
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'toasts' | 'rbac' | 'mutations'

  // Fast client addition to test store reactivity
  const handleQuickAddClient = async () => {
    setIsMutating(true);
    try {
      const sampleNames = ['Aegis Defense Labs', 'Vanguard Analytics', 'Krypton BioTech', 'Solstice Media Group'];
      const pickedName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      await createClient({
        name: `${pickedName} (${Math.floor(100 + Math.random() * 900)})`,
        company: `${pickedName} Corp`,
        email: `contact@${pickedName.toLowerCase().replace(/\s+/g, '')}.io`,
        status: 'active',
        currency: currentWorkspace?.currency || 'USD',
      });
    } catch (err) {
      // Toast handled by DataContext
    } finally {
      setIsMutating(false);
    }
  };

  // Fast task addition to test store reactivity
  const handleQuickAddTask = async () => {
    if (projects.length === 0) {
      addToast({
        type: 'warning',
        title: 'Project Needed',
        message: 'No project currently exists to assign a task to.',
      });
      return;
    }
    setIsMutating(true);
    try {
      await createTask({
        projectId: projects[0]._id,
        title: `Sprint Feature: Modular Store Sync #${Math.floor(100 + Math.random() * 900)}`,
        status: 'in_progress',
        priority: 'high',
        estimatedHours: 4,
      });
    } catch (err) {
      // Handled
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div id="phase-8-frontend-architecture" className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">Phase 8: Frontend Architecture & Context/Store</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active & Operational
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Centralized multi-tenant state orchestration: AuthContext, WorkspaceContext, UIContext (Toasts & Command Palette), and DataContext domain stores.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleCommandPalette}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Command className="w-3.5 h-3.5 text-indigo-400" />
            <span>Command Palette</span>
            <kbd className="px-1 py-0.2 rounded bg-neutral-900 text-[10px] font-mono text-neutral-400 border border-neutral-800">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => refreshAllData()}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sync All Stores</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800 w-fit overflow-x-auto">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'stores'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Context & Store Hierarchy</span>
        </button>

        <button
          onClick={() => setActiveTab('toasts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'toasts'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Toasts & Notifications ({toasts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'rbac'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>PermissionGate Guards</span>
        </button>

        <button
          onClick={() => setActiveTab('mutations')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
            activeTab === 'mutations'
              ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Optimistic Mutations</span>
        </button>
      </div>

      {/* Tab 1: Context & Store Hierarchy */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AuthContext Panel */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>AuthContext</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Session
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Active User</span>
                <span className="font-semibold text-neutral-200">{user?.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Role</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-indigo-400">
                  {user?.role || 'none'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Permissions</span>
                <span className="font-mono text-neutral-300 font-semibold">{userPermissions.length} Active</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>JWT Token</span>
                <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[110px]">
                  {accessToken ? `${accessToken.slice(0, 10)}...` : 'HTTP-Only Cookie'}
                </span>
              </div>
            </div>
          </div>

          {/* WorkspaceContext Panel */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>WorkspaceContext</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Multi-Tenant
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Current Tenant</span>
                <span className="font-semibold text-neutral-200 truncate max-w-[120px] text-right">
                  {currentWorkspace?.name || 'Default HQ'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Plan Tier</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-900 border border-neutral-800 text-emerald-400">
                  {currentWorkspace?.plan || 'Enterprise'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Ledger Currency</span>
                <span className="font-mono text-neutral-300 font-semibold">{currentWorkspace?.currency || 'USD'}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Accessible Tenants</span>
                <span className="font-mono text-neutral-300">{workspaces.length} Workspaces</span>
              </div>
            </div>
          </div>

          {/* UIContext Panel */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Command className="w-4 h-4 text-emerald-400" />
                <span>UIContext</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Interface
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Active Toasts</span>
                <span className="font-mono text-neutral-300 font-semibold">{toasts.length} queued</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Command Palette</span>
                <span className="font-mono text-emerald-400 text-[11px]">⌘K Enabled</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Sidebar</span>
                <span className="font-mono text-neutral-300">Collapsible</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Modal Manager</span>
                <span className="font-mono text-neutral-400">Ready</span>
              </div>
            </div>
          </div>

          {/* DataContext Panel */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                <Database className="w-4 h-4 text-amber-400" />
                <span>DataContext</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Entity Cache
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Clients In Cache</span>
                <span className="font-mono text-neutral-200 font-semibold">{clients.length}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Projects In Cache</span>
                <span className="font-mono text-neutral-200 font-semibold">{projects.length}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Tasks In Cache</span>
                <span className="font-mono text-neutral-200 font-semibold">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Total Invoices</span>
                <span className="font-mono text-neutral-200 font-semibold">{invoices.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Toasts & Notifications Playground */}
      {activeTab === 'toasts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Toast Dispatcher Testing Matrix
            </h3>
            <p className="text-xs text-neutral-400">
              Dispatch non-blocking notification alerts into the UIContext toast stack to verify auto-dismissal, icons, and styling.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() =>
                  addToast({
                    type: 'success',
                    title: 'Action Completed',
                    message: 'Record successfully synchronized with MongoDB cluster.',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Success Toast</span>
              </button>

              <button
                onClick={() =>
                  addToast({
                    type: 'error',
                    title: 'Permission Denied',
                    message: 'Role "viewer" cannot execute client mutations (403 Forbidden).',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Error Toast</span>
              </button>

              <button
                onClick={() =>
                  addToast({
                    type: 'warning',
                    title: 'Approaching Due Date',
                    message: 'Invoice #INV-2026-003 is due within 48 hours.',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning Toast</span>
              </button>

              <button
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Tenant Switched',
                    message: 'Context dynamically re-scoped to North Star Ventures.',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Info Toast</span>
              </button>

              {toasts.length > 0 && (
                <button
                  onClick={clearToasts}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-medium transition"
                >
                  Clear All ({toasts.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PermissionGate RBAC Simulator */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  PermissionGate RBAC Simulator
                </h3>
                <p className="text-xs text-neutral-400">
                  Select a demo persona below to observe how UI elements conditionally render or lock depending on RBAC authorization.
                </p>
              </div>

              {/* Persona Pill selector */}
              <div className="flex items-center gap-1 flex-wrap">
                {PERSONAS.map((p) => {
                  const isActive = user?.role === p.role;
                  return (
                    <button
                      key={p.role}
                      onClick={() => switchPersona(p.role)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? p.color + ' border shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Permission: client:create */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Create Client</span>
                  <code className="text-[10px] text-indigo-400 font-mono">client:create</code>
                </div>
                <PermissionGate
                  permission="client:create"
                  renderDisabled={true}
                  tooltip="Requires client:create permission (Owner, Admin)"
                >
                  <button
                    onClick={() => addToast({ type: 'success', title: 'Allowed', message: 'You have permission to create clients!' })}
                    className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Client</span>
                  </button>
                </PermissionGate>
              </div>

              {/* Permission: invoice:pay */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Record Payment</span>
                  <code className="text-[10px] text-indigo-400 font-mono">invoice:pay</code>
                </div>
                <PermissionGate
                  permission="invoice:pay"
                  renderDisabled={true}
                  tooltip="Requires invoice:pay permission (Owner, Admin, Client)"
                >
                  <button
                    onClick={() => addToast({ type: 'success', title: 'Payment Permitted', message: 'You have permission to record invoice payments.' })}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Invoice</span>
                  </button>
                </PermissionGate>
              </div>

              {/* Permission: audit:read */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">Audit Trail</span>
                  <code className="text-[10px] text-indigo-400 font-mono">audit:read</code>
                </div>
                <PermissionGate
                  permission="audit:read"
                  renderDisabled={true}
                  tooltip="Requires audit:read permission (Owner, Admin)"
                >
                  <button
                    onClick={() => addToast({ type: 'info', title: 'Compliance Logs', message: 'Viewing audit trail records.' })}
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Inspect Trail</span>
                  </button>
                </PermissionGate>
              </div>

              {/* Role: Owner only */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-300">SuperAdmin Root</span>
                  <code className="text-[10px] text-purple-400 font-mono">role: owner</code>
                </div>
                <PermissionGate
                  roles={['owner']}
                  renderDisabled={true}
                  tooltip="Only the Workspace Owner can modify root tenant keys."
                >
                  <button
                    onClick={() => addToast({ type: 'success', title: 'Root Access', message: 'SuperAdmin workspace configuration unlocked.' })}
                    className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Manage Tenant</span>
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Optimistic Mutations Lab */}
      {activeTab === 'mutations' && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Reactive Store Mutations
            </h3>
            <p className="text-xs text-neutral-400">
              Trigger live mutations through the domain hooks (`useData()`). Watch cached entity counters increment instantly with automatic toast triggers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={isMutating}
              onClick={handleQuickAddClient}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
            >
              {isMutating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Quick Create Client via Store</span>
            </button>

            <button
              disabled={isMutating || projects.length === 0}
              onClick={handleQuickAddTask}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
            >
              {isMutating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckSquare className="w-3.5 h-3.5" />}
              <span>Quick Add Sprint Task via Store</span>
            </button>
          </div>

          {/* Store Live Feed preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">
                Cached Clients ({clients.length})
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {clients.length === 0 ? (
                  <p className="text-[11px] text-neutral-500">No clients loaded yet.</p>
                ) : (
                  clients.slice(0, 4).map((c) => (
                    <div key={c._id} className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between">
                      <span className="font-medium text-neutral-200 truncate">{c.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400">
                        {c.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-300 block">
                Cached Tasks ({tasks.length})
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-[11px] text-neutral-500">No tasks loaded yet.</p>
                ) : (
                  tasks.slice(0, 4).map((t) => (
                    <div key={t._id} className="p-2 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between">
                      <span className="font-medium text-neutral-200 truncate">{t.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                        {t.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
