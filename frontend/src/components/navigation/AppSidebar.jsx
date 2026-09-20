import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  FolderOpen,
  Bell,
  History,
  Code2,
  Layers,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
  Activity,
  CheckCircle,
  Zap,
  Radio,
  Globe,
} from 'lucide-react';

export default function AppSidebar() {
  const { user } = useAuth();
  const { sidebarCollapsed, toggleSidebar, activeTab, setActiveTab } = useUI();
  const { currentWorkspace } = useWorkspace();
  const { clients, projects, tasks, invoices, unreadNotificationsCount } = useData();

  const userRole = user?.role || 'admin';
  const isMember = userRole === 'member';
  const isClient = userRole === 'client';
  const isViewer = userRole === 'viewer';

  let NAV_ITEMS = [];

  if (isMember) {
    // Member Role Scope: Projects, Tasks, Deliverables (Proposals), Documents, Notifications
    NAV_ITEMS = [
      { id: 'projects', label: 'Assigned Projects', icon: Briefcase, badge: projects.length, anchor: 'section-project-management' },
      { id: 'tasks', label: 'Task Sprints', icon: CheckSquare, badge: tasks.length, anchor: 'section-task-management' },
      { id: 'proposals', label: 'Deliverables & Scopes', icon: FileText, anchor: 'section-proposal-management' },
      { id: 'documents', label: 'Documents Hub', icon: FolderOpen, anchor: 'section-document-management' },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount, alert: unreadNotificationsCount > 0, anchor: 'section-notification-management' },
    ];
  } else if (isClient) {
    NAV_ITEMS = [
      { id: 'portal', label: 'Client Portal Hub', icon: Globe, anchor: 'section-client-portal' },
      { id: 'projects', label: 'My Projects', icon: Briefcase, badge: projects.length, anchor: 'section-project-management' },
      { id: 'proposals', label: 'Proposals & Scope', icon: FileText, anchor: 'section-proposal-management' },
      { id: 'invoices', label: 'Invoices & Payments', icon: DollarSign, badge: invoices.length, anchor: 'section-invoice-management' },
      { id: 'documents', label: 'Documents', icon: FolderOpen, anchor: 'section-document-management' },
    ];
  } else if (isViewer) {
    NAV_ITEMS = [
      { id: 'projects', label: 'Projects', icon: Briefcase, badge: projects.length, anchor: 'section-project-management' },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: tasks.length, anchor: 'section-task-management' },
      { id: 'proposals', label: 'Proposals', icon: FileText, anchor: 'section-proposal-management' },
      { id: 'documents', label: 'Documents', icon: FolderOpen, anchor: 'section-document-management' },
    ];
  } else {
    // Admin / Owner / SuperAdmin Full Scope
    NAV_ITEMS = [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, anchor: 'section-dashboard-analytics' },
      { id: 'portal', label: 'Client Portal Hub', icon: Globe, anchor: 'section-client-portal' },
      { id: 'team', label: 'Team Members', icon: UserPlus, anchor: 'section-team-management' },
      { id: 'clients', label: 'Clients', icon: Users, badge: clients.length, anchor: 'section-client-management' },
      { id: 'projects', label: 'Projects', icon: Briefcase, badge: projects.length, anchor: 'section-project-management' },
      { id: 'tasks', label: 'Task Sprints', icon: CheckSquare, badge: tasks.length, anchor: 'section-task-management' },
      { id: 'proposals', label: 'Proposals', icon: FileText, anchor: 'section-proposal-management' },
      { id: 'invoices', label: 'Invoices & Billing', icon: DollarSign, badge: invoices.length, anchor: 'section-invoice-management' },
      { id: 'documents', label: 'Documents Hub', icon: FolderOpen, anchor: 'section-document-management' },
      { id: 'workflows', label: 'Automations & Rules', icon: Zap, anchor: 'section-workflow-automation' },
      { id: 'webhooks', label: 'Webhooks & Events', icon: Radio, anchor: 'section-webhook-dispatch' },
      { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount, alert: unreadNotificationsCount > 0, anchor: 'section-notification-management' },
      { id: 'audit-logs', label: 'Compliance Audit', icon: History, anchor: 'section-audit-log-management' },
      { id: 'security', label: 'Security & Shield', icon: Shield, anchor: 'section-security-hardening' },
    ];
  }

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    if (item.anchor) {
      const el = document.getElementById(item.anchor);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-full min-h-0 shrink-0 border-r border-neutral-800 bg-neutral-950 transition-all duration-300 ${
        sidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 shrink-0 border-b border-neutral-800 flex items-center justify-between px-4">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
              V
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-neutral-100 text-base">
                VEYORA
              </span>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-indigo-400">
                Operations SaaS
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm mx-auto shadow-md">
            V
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar overscroll-contain p-3 space-y-6">
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
              Workspace Modules
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                          item.alert
                            ? 'bg-rose-500 text-white'
                            : isActive
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Tenant Status Card */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-neutral-800 m-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">{currentWorkspace?.name || 'VEYORA Workspace'}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>{currentWorkspace?.currency || 'USD'} Ledger</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Isolated
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
