import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ExecutiveDashboard } from '../components/dashboard/ExecutiveDashboard';
import { TeamManager } from '../components/team/TeamManager';
import { ClientManager } from '../components/clients';
import { ProjectManager } from '../components/projects';
import { TaskManager } from '../components/tasks';
import { ProposalManager } from '../components/proposals';
import { InvoiceManager } from '../components/invoices';
import { DocumentManager } from '../components/documents';
import { NotificationManager } from '../components/notifications';
import { AuditLogManager } from '../components/audit';
import { SecurityManager } from '../components/security';
import { WebhookManager } from '../components/webhooks/WebhookManager';
import { WorkflowManager } from '../components/workflows/WorkflowManager';
import { ClientPortalManager } from '../components/portal/ClientPortalManager';
import {
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  FolderOpen,
  Bell,
  History,
  LayoutDashboard,
  Shield,
  Activity,
  BookOpen,
  Radio,
  Workflow,
  Globe,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isMember = userRole === 'member';
  const isClient = userRole === 'client';
  const isViewer = userRole === 'viewer';
  const isAdminOrOwner = userRole === 'admin' || userRole === 'owner' || userRole === 'superadmin';

  const ALL_MODULES = [
    { id: 'dashboard', icon: LayoutDashboard, name: 'Dashboard Analytics', desc: 'KPI metrics, revenue graphs, deadlines', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'portal', icon: Globe, name: 'Client Self-Service Portal', desc: 'Contract signing, payments, project tracking', roles: ['admin', 'owner', 'superadmin', 'client'] },
    { id: 'team', icon: Users, name: 'Team Roster', desc: 'Teammates, invitation, role management', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'clients', icon: Users, name: 'Client Management', desc: 'Leads, active clients, profiles & notes', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'projects', icon: Briefcase, name: 'Project Tracking', desc: 'Milestones, budgets, team assignments', roles: ['admin', 'owner', 'superadmin', 'member', 'client', 'viewer'] },
    { id: 'tasks', icon: CheckSquare, name: 'Task Board', desc: 'Sprint workflows, statuses, priorities', roles: ['admin', 'owner', 'superadmin', 'member', 'viewer'] },
    { id: 'proposals', icon: FileText, name: 'Deliverables & Proposals', desc: 'Scopes, pricing, deliverables, approval portal', roles: ['admin', 'owner', 'superadmin', 'member', 'client', 'viewer'] },
    { id: 'invoices', icon: DollarSign, name: 'Invoicing & Billing', desc: 'Line items, tax calculations, payment status', roles: ['admin', 'owner', 'superadmin', 'client'] },
    { id: 'documents', icon: FolderOpen, name: 'Documents & Assets', desc: 'Secure asset management & metadata', roles: ['admin', 'owner', 'superadmin', 'member', 'client', 'viewer'] },
    { id: 'workflows', icon: Workflow, name: 'Workflow Automations', desc: 'Trigger-action business rules & condition filters', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'webhooks', icon: Radio, name: 'Webhooks & Events', desc: 'Realtime event dispatch with HMAC signatures', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'notifications', icon: Bell, name: 'Notifications', desc: 'Realtime trigger alerts for workspace users', roles: ['admin', 'owner', 'superadmin', 'member', 'client', 'viewer'] },
    { id: 'audit-logs', icon: History, name: 'Audit Logs', desc: 'Immutable activity tracking for admins', roles: ['admin', 'owner', 'superadmin'] },
    { id: 'security', icon: Shield, name: 'Security & Shield', desc: 'Hardened defenses, scanner & threat shield', roles: ['admin', 'owner', 'superadmin'] },
  ];

  const modules = ALL_MODULES.filter((m) => m.roles.includes(userRole));

  return (
    <div className="bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-300">
      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Banner Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-900/60 border border-neutral-800/90 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isMember ? 'Team Member Workspace — Operational Execution' : 'Active Workspace Engine — Multi-Tenant Client Operations'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-100">
              {isMember
                ? `Welcome back, ${user?.name || 'Teammate'} (Team Member)`
                : 'VEYORA Client Operations & Billing SaaS'}
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {isMember
                ? 'Your account is configured with Team Member access. Manage assigned projects, track task sprint progress, review project deliverables, and access shared workspace documents.'
                : 'Streamline agency operations, client communication, task sprints, proposals, automated invoicing, and digital contract signing in one unified workspace.'}
            </p>
          </div>
        </div>

        {/* Executive Dashboard — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-dashboard-analytics">
            <ExecutiveDashboard />
          </div>
        )}

        {/* Client Self-Service Portal Hub — Admins, Owners & Clients */}
        {(isAdminOrOwner || isClient) && (
          <div id="section-client-portal">
            <ClientPortalManager />
          </div>
        )}

        {/* Team Members & Workspace Roster — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-team-management">
            <TeamManager />
          </div>
        )}

        {/* Client Management Module — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-client-management">
            <ClientManager />
          </div>
        )}

        {/* Project Management Module — All Workspace Roles */}
        <div id="section-project-management">
          <ProjectManager />
        </div>

        {/* Task Sprints Module — Admins, Owners, Members, Viewers */}
        {(isAdminOrOwner || isMember || isViewer) && (
          <div id="section-task-management">
            <TaskManager />
          </div>
        )}

        {/* Proposal & Deliverables Pipeline Module — All Workspace Roles */}
        <div id="section-proposal-management">
          <ProposalManager />
        </div>

        {/* Invoice & Billing Module — Admins, Owners, Clients */}
        {(isAdminOrOwner || isClient) && (
          <div id="section-invoice-management">
            <InvoiceManager />
          </div>
        )}

        {/* Document Vault Module — All Workspace Roles */}
        <div id="section-document-management">
          <DocumentManager />
        </div>

        {/* Workflow Automations Engine — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-workflow-automation">
            <WorkflowManager />
          </div>
        )}

        {/* Webhook Events Module — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-webhook-dispatch">
            <WebhookManager />
          </div>
        )}

        {/* In-App Notifications Engine — All Workspace Roles */}
        <div id="section-notification-management">
          <NotificationManager />
        </div>

        {/* Compliance Audit Trail — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-audit-log-management">
            <AuditLogManager />
          </div>
        )}

        {/* Security & Shield Module — Admins / Owners Only */}
        {isAdminOrOwner && (
          <div id="section-security-hardening">
            <SecurityManager />
          </div>
        )}

        {/* System Modules Grid */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Your Role Capabilities ({userRole.toUpperCase()})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3 hover:border-neutral-700 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-200">{m.name}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Clean Production Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 text-center text-xs text-neutral-400">
        <p>VEYORA Client Operations SaaS • Workspace Role: <span className="font-mono uppercase text-indigo-400">{userRole}</span></p>
      </footer>
    </div>
  );
}
