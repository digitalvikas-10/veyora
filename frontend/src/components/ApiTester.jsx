import React, { useState, useEffect } from 'react';
import api, { setAuthToken } from '../services/api';
import {
  Code2,
  Play,
  RefreshCw,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  DollarSign,
  FolderOpen,
  Bell,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Filter,
  Search,
  ChevronRight,
  PlusCircle,
  CreditCard,
  PenTool,
} from 'lucide-react';

const ENDPOINT_CATEGORIES = [
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    color: 'indigo',
    endpoints: [
      {
        id: 'list-clients',
        name: 'List Clients',
        method: 'GET',
        url: '/clients',
        params: { page: 1, limit: 10, search: '', status: '' },
        description: 'Fetch paginated clients scoped to active workspace with text search and status filter.',
        permission: 'client:read',
      },
      {
        id: 'create-client',
        name: 'Create Client',
        method: 'POST',
        url: '/clients',
        body: {
          name: 'Nexus Frontier Corp',
          company: 'Nexus Frontier Inc.',
          email: 'hello@nexusfrontier.io',
          phone: '+1 (555) 839-4412',
          status: 'active',
          currency: 'USD',
          tags: ['enterprise', 'saas'],
          notes: 'High-value enterprise customer seeking custom operations dashboard.',
        },
        description: 'Register a new client entity in the active workspace and generate an audit log entry.',
        permission: 'client:create',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    color: 'blue',
    endpoints: [
      {
        id: 'list-projects',
        name: 'List Projects',
        method: 'GET',
        url: '/projects',
        params: { page: 1, limit: 10, status: '', priority: '' },
        description: 'Fetch workspace projects populated with client metadata and assignee summaries.',
        permission: 'project:read',
      },
      {
        id: 'create-project',
        name: 'Create Project',
        method: 'POST',
        url: '/projects',
        needsClientId: true,
        body: {
          name: 'Global Platform Modernization',
          status: 'active',
          priority: 'high',
          budget: 18500,
          currency: 'USD',
          progressPercent: 15,
          tags: ['cloud-migration', 'security'],
        },
        description: 'Create a project bound to a client and tenant workspace with automated project code generation.',
        permission: 'project:create',
      },
    ],
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    color: 'emerald',
    endpoints: [
      {
        id: 'list-tasks',
        name: 'List Tasks',
        method: 'GET',
        url: '/tasks',
        params: { page: 1, limit: 20, status: '', priority: '' },
        description: 'Retrieve sprint board tasks with assignee details, checklists, and logged hours.',
        permission: 'task:read',
      },
      {
        id: 'create-task',
        name: 'Create Task',
        method: 'POST',
        url: '/tasks',
        needsProjectId: true,
        body: {
          title: 'Implement Database Resilience & Health Alerts',
          description: 'Setup background monitoring hooks and automated telemetry dispatching.',
          status: 'todo',
          priority: 'high',
          estimatedHours: 8,
          checklist: [
            { title: 'Configure probe intervals', completed: true },
            { title: 'Write unit tests for error boundaries', completed: false },
          ],
        },
        description: 'Create sprint task linked to project with checklist and estimated workload.',
        permission: 'task:create',
      },
      {
        id: 'log-time',
        name: 'Log Time (2.5h)',
        method: 'POST',
        url: '/tasks/:id/time-logs',
        needsTaskId: true,
        body: {
          hours: 2.5,
          note: 'Completed schema validations and route registration.',
        },
        description: 'Appends a work session time-log, updates total loggedHours, and generates an audit log.',
        permission: 'task:log_time',
      },
    ],
  },
  {
    id: 'proposals',
    label: 'Proposals',
    icon: FileText,
    color: 'violet',
    endpoints: [
      {
        id: 'list-proposals',
        name: 'List Proposals',
        method: 'GET',
        url: '/proposals',
        params: { page: 1, limit: 10, status: '' },
        description: 'Fetch contracts and scopes with calculated subtotals, tax calculations, and signatures.',
        permission: 'proposal:read',
      },
      {
        id: 'create-proposal',
        name: 'Create Proposal',
        method: 'POST',
        url: '/proposals',
        needsClientId: true,
        body: {
          title: 'Cloud Infrastructure Retainer & Support Q4',
          status: 'draft',
          lineItems: [
            { description: 'DevOps & Kubernetes Cluster Auditing', quantity: 1, unitPrice: 3500 },
            { description: 'Multi-Tenant Security Architecture Review', quantity: 1, unitPrice: 2800 },
          ],
          discount: 300,
          taxRate: 8.5,
          notes: 'Standard 30-day turnaround upon electronic signature acceptance.',
        },
        description: 'Generate formal client proposal with automatic line item math and pre-save financial triggers.',
        permission: 'proposal:create',
      },
      {
        id: 'sign-proposal',
        name: 'Sign Proposal (Client)',
        method: 'POST',
        url: '/proposals/:id/sign',
        needsProposalId: true,
        body: {
          signedBy: 'Sarah Jenkins',
          signedEmail: 'contact@acmeglobal.com',
        },
        description: 'Simulate client digital signature, transitioning status to accepted and alerting workspace staff.',
        permission: 'proposal:approve',
      },
    ],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: DollarSign,
    color: 'amber',
    endpoints: [
      {
        id: 'list-invoices',
        name: 'List Invoices & Billing Stats',
        method: 'GET',
        url: '/invoices',
        params: { page: 1, limit: 10, status: '' },
        description: 'List billing invoices alongside aggregated total revenue, outstanding balances, and total invoiced.',
        permission: 'invoice:read',
      },
      {
        id: 'create-invoice',
        name: 'Create Invoice',
        method: 'POST',
        url: '/invoices',
        needsClientId: true,
        body: {
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          lineItems: [
            { description: 'Frontend React Architecture Development', quantity: 40, unitPrice: 150 },
            { description: 'REST API & Security Hardening', quantity: 20, unitPrice: 160 },
          ],
          discount: 0,
          taxRate: 8,
          paymentMethod: 'stripe',
          notes: 'Payment due within 14 business days via credit card or ACH transfer.',
        },
        description: 'Create invoice using workspace billing settings, next invoice numbering sequence, and tax formulas.',
        permission: 'invoice:create',
      },
      {
        id: 'record-payment',
        name: 'Record Payment ($2,500)',
        method: 'POST',
        url: '/invoices/:id/payments',
        needsInvoiceId: true,
        body: {
          amount: 2500,
          method: 'stripe',
          transactionId: `ch_demo_${Date.now().toString().slice(-6)}`,
          notes: 'Customer cleared milestone retainer via Stripe card transfer.',
        },
        description: 'Records payment transaction, recalculates balanceDue via pre-save hooks, and updates client history.',
        permission: 'invoice:pay',
      },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    color: 'cyan',
    endpoints: [
      {
        id: 'list-documents',
        name: 'List Documents',
        method: 'GET',
        url: '/documents',
        params: { page: 1, limit: 10, category: '' },
        description: 'Query categorized workspace assets and deliverables with file size and uploader details.',
        permission: 'document:read',
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    color: 'rose',
    endpoints: [
      {
        id: 'list-notifications',
        name: 'Get User Notifications',
        method: 'GET',
        url: '/notifications',
        params: { page: 1, limit: 15 },
        description: 'Retrieve inbox notifications with unread count badge for active authenticated user.',
        permission: null,
      },
      {
        id: 'mark-all-read',
        name: 'Mark All As Read',
        method: 'POST',
        url: '/notifications/mark-all-read',
        body: {},
        description: 'Mark all unread notifications as read for current user.',
        permission: null,
      },
    ],
  },
  {
    id: 'audit-logs',
    label: 'Audit Logs',
    icon: History,
    color: 'teal',
    endpoints: [
      {
        id: 'list-audit-logs',
        name: 'Query Immutable Audit Trail',
        method: 'GET',
        url: '/audit-logs',
        params: { page: 1, limit: 15, search: '' },
        description: 'Inspect compliance audit trail tracking actor, action, timestamp, IP address, and changed details.',
        permission: 'audit:read',
      },
    ],
  },
];

const PERSONAS = [
  { role: 'owner', name: 'Olivia Vance', label: 'Owner', weight: 80, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { role: 'admin', name: 'Arthur Sterling', label: 'Admin', weight: 60, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { role: 'member', name: 'Maya Lin', label: 'Member', weight: 40, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { role: 'client', name: 'Claire Dupont', label: 'Client', weight: 20, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { role: 'viewer', name: 'Victor Reed', label: 'Viewer', weight: 10, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
];

export default function ApiTester() {
  const [activeCategory, setActiveCategory] = useState('clients');
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINT_CATEGORIES[0].endpoints[0]);
  const [currentPersona, setCurrentPersona] = useState('owner');
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchingPersona, setIsSwitchingPersona] = useState(false);
  const [responseLog, setResponseLog] = useState(null);
  const [customParams, setCustomParams] = useState('');
  const [customBody, setCustomBody] = useState('');

  // Cached IDs from the workspace for dynamic linking
  const [entityIds, setEntityIds] = useState({
    clientId: '',
    projectId: '',
    taskId: '',
    proposalId: '',
    invoiceId: '',
  });

  // Switch persona and bootstrap session on mount or selection
  const handleSwitchPersona = async (role) => {
    setIsSwitchingPersona(true);
    try {
      const res = await api.post('/rbac/switch-persona', { targetRole: role });
      const token = res.data?.accessToken;
      if (token) {
        setAuthToken(token);
      }
      setCurrentPersona(role);
      await refreshEntityContext();
    } catch (err) {
      console.error('Failed to switch demo persona:', err);
    } finally {
      setIsSwitchingPersona(false);
    }
  };

  // Discover actual IDs from database to auto-populate request params
  const refreshEntityContext = async () => {
    try {
      const [clientsRes, projectsRes, tasksRes, proposalsRes, invoicesRes] = await Promise.allSettled([
        api.get('/clients?limit=1'),
        api.get('/projects?limit=1'),
        api.get('/tasks?limit=1'),
        api.get('/proposals?limit=1'),
        api.get('/invoices?limit=1'),
      ]);

      setEntityIds({
        clientId: clientsRes.status === 'fulfilled' ? clientsRes.value?.data?.clients?.[0]?._id || '' : '',
        projectId: projectsRes.status === 'fulfilled' ? projectsRes.value?.data?.projects?.[0]?._id || '' : '',
        taskId: tasksRes.status === 'fulfilled' ? tasksRes.value?.data?.tasks?.[0]?._id || '' : '',
        proposalId: proposalsRes.status === 'fulfilled' ? proposalsRes.value?.data?.proposals?.[0]?._id || '' : '',
        invoiceId: invoicesRes.status === 'fulfilled' ? invoicesRes.value?.data?.invoices?.[0]?._id || '' : '',
      });
    } catch (err) {
      // Ignored
    }
  };

  useEffect(() => {
    handleSwitchPersona('owner');
  }, []);

  // Update body/params when selected endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      if (selectedEndpoint.params) {
        setCustomParams(JSON.stringify(selectedEndpoint.params, null, 2));
      } else {
        setCustomParams('');
      }

      if (selectedEndpoint.body) {
        const bodyCopy = { ...selectedEndpoint.body };
        if (selectedEndpoint.needsClientId && entityIds.clientId) {
          bodyCopy.clientId = entityIds.clientId;
        }
        if (selectedEndpoint.needsProjectId && entityIds.projectId) {
          bodyCopy.projectId = entityIds.projectId;
        }
        setCustomBody(JSON.stringify(bodyCopy, null, 2));
      } else {
        setCustomBody('');
      }
    }
  }, [selectedEndpoint, entityIds]);

  // Execute current selected API endpoint
  const handleExecuteRequest = async () => {
    if (!selectedEndpoint) return;
    setIsLoading(true);
    const startTime = performance.now();

    let targetUrl = selectedEndpoint.url;

    // Substitute dynamic :id param if needed
    if (targetUrl.includes(':id')) {
      let resolvedId = '';
      if (selectedEndpoint.needsTaskId) resolvedId = entityIds.taskId;
      else if (selectedEndpoint.needsProposalId) resolvedId = entityIds.proposalId;
      else if (selectedEndpoint.needsInvoiceId) resolvedId = entityIds.invoiceId;
      else if (selectedEndpoint.needsClientId) resolvedId = entityIds.clientId;
      else if (selectedEndpoint.needsProjectId) resolvedId = entityIds.projectId;

      if (!resolvedId) {
        setResponseLog({
          status: 400,
          statusText: 'Client Precondition Failed',
          executionTimeMs: 1,
          endpoint: selectedEndpoint.url,
          method: selectedEndpoint.method,
          data: {
            success: false,
            message: 'No existing entity ID found in workspace to target for this action. Please list or create entities first.',
          },
        });
        setIsLoading(false);
        return;
      }
      targetUrl = targetUrl.replace(':id', resolvedId);
    }

    try {
      let res;
      let parsedParams = {};
      let parsedBody = {};

      if (customParams) {
        try {
          parsedParams = JSON.parse(customParams);
        } catch (e) {
          throw new Error('Query Parameters JSON is invalid.');
        }
      }

      if (customBody && ['POST', 'PATCH', 'PUT'].includes(selectedEndpoint.method)) {
        try {
          parsedBody = JSON.parse(customBody);
        } catch (e) {
          throw new Error('Request Body JSON is invalid.');
        }
      }

      if (selectedEndpoint.method === 'GET') {
        res = await api.get(targetUrl, { params: parsedParams });
      } else if (selectedEndpoint.method === 'POST') {
        res = await api.post(targetUrl, parsedBody);
      } else if (selectedEndpoint.method === 'PATCH') {
        res = await api.patch(targetUrl, parsedBody);
      } else if (selectedEndpoint.method === 'DELETE') {
        res = await api.delete(targetUrl);
      }

      const duration = Math.round(performance.now() - startTime);
      setResponseLog({
        status: res?.statusCode || 200,
        statusText: 'OK',
        executionTimeMs: duration,
        endpoint: targetUrl,
        method: selectedEndpoint.method,
        data: res,
      });

      // Refresh IDs if a creation just succeeded
      if (['create-client', 'create-project', 'create-task', 'create-proposal', 'create-invoice'].includes(selectedEndpoint.id)) {
        refreshEntityContext();
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setResponseLog({
        status: err.status || 500,
        statusText: err.message || 'Error',
        executionTimeMs: duration,
        endpoint: targetUrl,
        method: selectedEndpoint.method,
        data: err.data || {
          success: false,
          message: err.message || 'Request execution failed',
          errors: err.errors || [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentCategoryData = ENDPOINT_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div id="phase-7-api-architecture" className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">Phase 7: REST API Architecture (/api/v1)</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live & Validated
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Full-featured, multi-tenant CRUD & financial endpoints with Zod request schemas, RBAC guards, and immutable audit logging.
              </p>
            </div>
          </div>
        </div>

        {/* Persona Switcher for RBAC Validation */}
        <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800/80">
          <div className="flex items-center gap-1.5 px-2 text-neutral-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Persona:</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {PERSONAS.map((p) => {
              const isActive = currentPersona === p.role;
              return (
                <button
                  key={p.role}
                  disabled={isSwitchingPersona}
                  onClick={() => handleSwitchPersona(p.role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? p.color + ' border shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] opacity-70">({p.weight})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Category & Endpoint Explorer vs Request Execution & Response Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Navigation & Endpoints (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-neutral-950 border border-neutral-800">
            {ENDPOINT_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedEndpoint(cat.endpoints[0]);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Endpoints List for Active Category */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between px-1">
              <span>{currentCategoryData?.label} Endpoints</span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {currentCategoryData?.endpoints.length} Routes
              </span>
            </div>

            <div className="space-y-2">
              {currentCategoryData?.endpoints.map((ep) => {
                const isSelected = selectedEndpoint?.id === ep.id;
                const methodBadgeColor =
                  ep.method === 'GET'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : ep.method === 'POST'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : ep.method === 'PATCH'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

                return (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-500/5 border-indigo-500/40 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${methodBadgeColor}`}>
                          {ep.method}
                        </span>
                        <span className="text-xs font-semibold text-neutral-200 truncate">{ep.name}</span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">
                        /api/v1{ep.url}
                      </p>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">{ep.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition ${isSelected ? 'text-indigo-400' : 'text-neutral-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Context Summary */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="font-semibold text-neutral-300">Live Context Scoping</span>
              <button
                onClick={refreshEntityContext}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Client ID</span>
                <span className="text-neutral-300 truncate block">{entityIds.clientId ? entityIds.clientId.slice(-8) : 'Not found'}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Project ID</span>
                <span className="text-neutral-300 truncate block">{entityIds.projectId ? entityIds.projectId.slice(-8) : 'Not found'}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Invoice ID</span>
                <span className="text-neutral-300 truncate block">{entityIds.invoiceId ? entityIds.invoiceId.slice(-8) : 'Not found'}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">Task ID</span>
                <span className="text-neutral-300 truncate block">{entityIds.taskId ? entityIds.taskId.slice(-8) : 'Not found'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Runner & Live Response Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Request Card */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs overflow-hidden">
                <span
                  className={`px-2 py-0.5 rounded font-bold border text-[11px] ${
                    selectedEndpoint?.method === 'GET'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : selectedEndpoint?.method === 'POST'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : selectedEndpoint?.method === 'PATCH'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {selectedEndpoint?.method}
                </span>
                <span className="text-neutral-200 font-semibold truncate">
                  /api/v1{selectedEndpoint?.url}
                </span>
              </div>

              <button
                disabled={isLoading}
                onClick={handleExecuteRequest}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Send Request</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-neutral-500" />
                <span>Required Permission:</span>
                <code className="text-[11px] font-mono text-indigo-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                  {selectedEndpoint?.permission || 'Authenticated Session'}
                </code>
              </div>
            </div>

            {/* Params / Body Editors */}
            {selectedEndpoint?.method === 'GET' && selectedEndpoint?.params && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Query Parameters (JSON)
                </label>
                <textarea
                  value={customParams}
                  onChange={(e) => setCustomParams(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {['POST', 'PATCH', 'PUT'].includes(selectedEndpoint?.method) && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Payload Body (JSON)
                </label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-200">Response Inspector</span>
                {responseLog && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      responseLog.status >= 200 && responseLog.status < 300
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : responseLog.status === 403
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {responseLog.status} {responseLog.statusText}
                  </span>
                )}
              </div>

              {responseLog && (
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {responseLog.executionTimeMs}ms
                  </span>
                </div>
              )}
            </div>

            {/* JSON Output Container */}
            <div className="relative">
              <pre className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800/90 text-xs font-mono text-neutral-300 max-h-96 overflow-y-auto leading-relaxed">
                {responseLog
                  ? JSON.stringify(responseLog.data, null, 2)
                  : '// Click "Send Request" to trigger endpoint execution and inspect response payload...'}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Badges for Phase 7 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zod Request Validation
          </div>
          <p className="text-[11px] text-neutral-400">
            Intercepts invalid query params and payload structures with 400 Bad Request before controllers execute.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Strict Tenant Scoping
          </div>
          <p className="text-[11px] text-neutral-400">
            All queries automatically bound to verified workspace ID; cross-tenant document tampering is impossible.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Financial Engine Hooks
          </div>
          <p className="text-[11px] text-neutral-400">
            Mongoose pre-save triggers recompute invoice totals, discounts, taxes, and balance settlements automatically.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Automated Audit Logging
          </div>
          <p className="text-[11px] text-neutral-400">
            Mutations and payment settlements record immutable actor, action, timestamp, and IP trace records.
          </p>
        </div>
      </div>
    </div>
  );
}
