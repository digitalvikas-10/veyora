import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Workflow,
  Zap,
  Play,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  RefreshCw,
  Sparkles,
  Layers,
  Bell,
  CheckSquare,
  FileText,
  DollarSign,
  Radio,
  ShieldAlert,
  ChevronRight,
  Sliders,
  Check,
  Copy,
  Terminal,
  Activity,
  UserCheck,
  FolderPlus,
} from 'lucide-react';

const TRIGGER_EVENTS = [
  { id: 'client.created', label: 'Client Created', icon: UserCheck, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'client.updated', label: 'Client Updated', icon: UserCheck, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'proposal.signed', label: 'Proposal E-Signed', icon: FileText, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'proposal.created', label: 'Proposal Drafted', icon: FileText, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'invoice.paid', label: 'Invoice Paid', icon: DollarSign, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { id: 'invoice.created', label: 'Invoice Generated', icon: DollarSign, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'task.completed', label: 'Task Completed', icon: CheckSquare, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'project.status_changed', label: 'Project Status Changed', icon: FolderPlus, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'security.threat_detected', label: 'Security Threat Detected', icon: ShieldAlert, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
];

const ACTION_TYPES = [
  { id: 'create_task', label: 'Create Project Task', icon: CheckSquare, desc: 'Add a new prioritized task to workspace or project' },
  { id: 'send_notification', label: 'Send In-App Notification', icon: Bell, desc: 'Dispatch instant alert to workspace members' },
  { id: 'update_client_status', label: 'Update Client Status', icon: UserCheck, desc: 'Transition client to active/onboarding/vip' },
  { id: 'generate_invoice_draft', label: 'Generate Draft Invoice', icon: DollarSign, desc: 'Draft an itemized invoice for client review' },
  { id: 'dispatch_webhook', label: 'Dispatch Outbound Webhook', icon: Radio, desc: 'Broadcast payload to external API listener' },
];

const PREBUILT_TEMPLATES = [
  {
    name: 'VIP Client Onboarding & Task Suite',
    description: 'When a new client is registered, instantly create an onboarding task, alert team, and notify external CRM.',
    trigger: {
      event: 'client.created',
      conditions: [{ field: 'status', operator: 'equals', value: 'active' }],
    },
    actions: [
      {
        type: 'create_task',
        params: {
          title: 'Complete Onboarding Checklist for {{name}}',
          description: 'Review SLA terms, configure workspace credentials, and schedule kickoff.',
          priority: 'high',
          dueInDays: 3,
        },
      },
      {
        type: 'send_notification',
        params: {
          title: 'New Client Onboarded: {{name}}',
          message: 'Client profile created with active SLA status.',
          type: 'client',
        },
      },
      {
        type: 'dispatch_webhook',
        params: {
          customEvent: 'client.vip_onboarding',
        },
      },
    ],
  },
  {
    name: 'Invoice Paid -> Retainer & Delivery Setup',
    description: 'When an invoice is marked as paid, trigger follow-up sprint tasks and notify finance stakeholders.',
    trigger: {
      event: 'invoice.paid',
      conditions: [{ field: 'totalAmount', operator: 'greater_than', value: 1000 }],
    },
    actions: [
      {
        type: 'create_task',
        params: {
          title: 'Initiate Deliverable Sprint for Paid Invoice {{invoiceNumber}}',
          description: 'Payment verified. Allocate resources and begin milestone execution.',
          priority: 'urgent',
          dueInDays: 2,
        },
      },
      {
        type: 'send_notification',
        params: {
          title: 'Payment Received: {{invoiceNumber}}',
          message: 'Invoice payment confirmed in ledger.',
          type: 'billing',
        },
      },
    ],
  },
  {
    name: 'Proposal Accepted -> Deposit Invoice & Alert',
    description: 'When a proposal is e-signed by client, automatically draft an initial deposit invoice and update status.',
    trigger: {
      event: 'proposal.signed',
      conditions: [],
    },
    actions: [
      {
        type: 'generate_invoice_draft',
        params: {
          lineItemDescription: 'Initial Deposit for Accepted SOW: {{title}}',
          amount: 5000,
        },
      },
      {
        type: 'update_client_status',
        params: {
          status: 'active',
        },
      },
      {
        type: 'send_notification',
        params: {
          title: 'Proposal Signed: {{title}}',
          message: 'Contract executed with cryptographic e-signature.',
          type: 'proposal',
        },
      },
    ],
  },
];

export function WorkflowManager() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'executions' | 'templates'
  const { isAuthenticated, user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [rules, setRules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRules: 0,
    activeRules: 0,
    totalExecutions: 0,
    successRate: 100,
    avgLatencyMs: 14,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testModalRule, setTestModalRule] = useState(null);
  const [testPayloadText, setTestPayloadText] = useState('{\n  "name": "Acme Global Corp",\n  "status": "active",\n  "amount": 15000,\n  "invoiceNumber": "INV-2026-9901"\n}');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form State for Create/Edit Rule
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerEvent: 'client.created',
    conditions: [],
    actions: [
      {
        type: 'create_task',
        params: { title: 'Follow-up on {{name}}', priority: 'medium', dueInDays: 3 },
      },
    ],
  });

  const fetchWorkflowsData = useCallback(async () => {
    if (!isAuthenticated && !user && !currentWorkspace?._id) {
      return;
    }
    try {
      setIsLoading(true);
      const [rulesRes, execRes, metricsRes] = await Promise.all([
        api.get('/workflows', { params: { event: filterEvent, status: filterStatus, search: searchQuery } }),
        api.get('/workflows/executions', { params: { limit: 25 } }),
        api.get('/workflows/metrics'),
      ]);

      setRules(rulesRes?.data?.rules || rulesRes?.rules || rulesRes?.data || []);
      setExecutions(execRes?.data?.executions || execRes?.executions || execRes?.data || []);
      setMetrics(
        metricsRes?.data?.metrics || metricsRes?.metrics || {
          totalRules: 0,
          activeRules: 0,
          totalExecutions: 0,
          successRate: 100,
          avgLatencyMs: 12,
        }
      );
    } catch (err) {
      console.warn('Workflows fetch note:', err.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [filterEvent, filterStatus, searchQuery, isAuthenticated, user, currentWorkspace?._id]);

  useEffect(() => {
    fetchWorkflowsData();
  }, [fetchWorkflowsData]);

  const handleOpenCreateModal = (template = null) => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        triggerEvent: template.trigger.event,
        conditions: template.trigger.conditions || [],
        actions: template.actions || [],
      });
      setEditingRule(null);
    } else {
      setFormData({
        name: '',
        description: '',
        triggerEvent: 'client.created',
        conditions: [],
        actions: [
          {
            type: 'create_task',
            params: { title: 'Follow up on {{name}}', priority: 'medium', dueInDays: 3 },
          },
        ],
      });
      setEditingRule(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      triggerEvent: rule.trigger?.event || 'client.created',
      conditions: rule.trigger?.conditions || [],
      actions: rule.actions || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        trigger: {
          event: formData.triggerEvent,
          conditions: formData.conditions,
        },
        actions: formData.actions,
      };

      if (editingRule) {
        await api.put(`/workflows/${editingRule._id}`, payload);
      } else {
        await api.post('/workflows', payload);
      }

      setIsModalOpen(false);
      fetchWorkflowsData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save workflow rule');
    }
  };

  const handleToggleRuleStatus = async (rule) => {
    try {
      await api.put(`/workflows/${rule._id}`, { isActive: !rule.isActive });
      fetchWorkflowsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle rule status');
    }
  };

  const handleDeleteRule = async (ruleId, name) => {
    if (!window.confirm(`Delete workflow rule "${name}"?`)) return;
    try {
      await api.delete(`/workflows/${ruleId}`);
      fetchWorkflowsData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete rule');
    }
  };

  // Conditions helpers
  const handleAddCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, { field: 'status', operator: 'equals', value: 'active' }],
    });
  };

  const handleRemoveCondition = (index) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateCondition = (index, key, val) => {
    const updated = [...formData.conditions];
    updated[index][key] = val;
    setFormData({ ...formData, conditions: updated });
  };

  // Actions helpers
  const handleAddAction = (actionType = 'send_notification') => {
    let initialParams = {};
    if (actionType === 'create_task') {
      initialParams = { title: 'Automated Task: {{name}}', priority: 'medium', dueInDays: 3 };
    } else if (actionType === 'send_notification') {
      initialParams = { title: 'Alert on {{name}}', message: 'Automation triggered', type: 'system' };
    } else if (actionType === 'update_client_status') {
      initialParams = { status: 'active' };
    } else if (actionType === 'generate_invoice_draft') {
      initialParams = { lineItemDescription: 'Automated Billing Deliverable', amount: 1500 };
    } else if (actionType === 'dispatch_webhook') {
      initialParams = { customEvent: formData.triggerEvent };
    }

    setFormData({
      ...formData,
      actions: [...formData.actions, { type: actionType, params: initialParams }],
    });
  };

  const handleRemoveAction = (index) => {
    if (formData.actions.length <= 1) {
      alert('A workflow must contain at least one action.');
      return;
    }
    setFormData({
      ...formData,
      actions: formData.actions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateActionParam = (actionIndex, paramKey, val) => {
    const updated = [...formData.actions];
    updated[actionIndex].params = {
      ...updated[actionIndex].params,
      [paramKey]: val,
    };
    setFormData({ ...formData, actions: updated });
  };

  // Test Simulation
  const handleOpenTestModal = (rule) => {
    setTestModalRule(rule);
    setTestResult(null);
    setIsTesting(false);
  };

  const handleRunSimulation = async () => {
    if (!testModalRule) return;
    try {
      setIsTesting(true);
      setTestResult(null);
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(testPayloadText);
      } catch {
        alert('Invalid JSON in payload');
        setIsTesting(false);
        return;
      }

      const res = await api.post(`/workflows/${testModalRule._id}/test`, {
        testPayload: parsedPayload,
      });

      setTestResult(res.data?.data?.result);
      fetchWorkflowsData();
    } catch (err) {
      setTestResult({
        status: 'failed',
        error: err.response?.data?.message || err.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Trigger-Action Event Automation
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2.5">
              <Workflow className="w-6 h-6 text-indigo-400" />
              Automated Workflows & Business Rule Engine
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Design event-driven automations across VEYORA. Intercept lifecycle events (proposals signed, invoices paid, clients created)
              to auto-generate tasks, send instant alerts, update records, and orchestrate webhooks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleOpenCreateModal()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Automation
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/80 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Templates
            </button>
            <button
              onClick={fetchWorkflowsData}
              className="p-2 rounded-xl bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/80 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/90">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <div className="text-xs text-neutral-400 font-medium">Active Rules</div>
            <div className="text-lg font-bold text-neutral-100 mt-0.5 flex items-center gap-1.5">
              {metrics.activeRules} <span className="text-2xs font-normal text-neutral-500">/ {metrics.totalRules} total</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <div className="text-xs text-neutral-400 font-medium">Total Executions</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5">
              {metrics.totalExecutions.toLocaleString()}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <div className="text-xs text-neutral-400 font-medium">Success Rate</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {metrics.successRate}%
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
            <div className="text-xs text-neutral-400 font-medium">Avg Execution Latency</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {metrics.avgLatencyMs}ms
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'rules'
              ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Workflow className="w-4 h-4 text-indigo-400" />
          Active Rules ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab('executions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'executions'
              ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-400" />
          Execution Logs ({executions.length})
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'templates'
              ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Workflow Templates
        </button>
      </div>

      {/* TAB 1: RULES LIST */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
              >
                <option value="all">All Trigger Events</option>
                {TRIGGER_EVENTS.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.label}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            <div className="text-2xs text-neutral-500 font-mono">
              Showing {rules.length} automation {rules.length === 1 ? 'rule' : 'rules'}
            </div>
          </div>

          {/* Rules Cards */}
          {rules.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <Workflow className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-neutral-200">No Workflow Automations Defined</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Create custom triggers to automate cross-module tasks, client updates, and alerts, or install one from our pre-built templates.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Create Rule
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Browse Templates
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rules.map((rule) => {
                const triggerConfig = TRIGGER_EVENTS.find((t) => t.id === rule.trigger?.event) || {
                  label: rule.trigger?.event,
                  color: 'text-neutral-400 bg-neutral-800 border-neutral-700',
                  icon: Zap,
                };
                const TriggerIcon = triggerConfig.icon;

                return (
                  <div
                    key={rule._id}
                    className={`p-5 rounded-2xl bg-neutral-900/70 border transition space-y-4 ${
                      rule.isActive ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-800/50 opacity-60'
                    }`}
                  >
                    {/* Top Row: Title, Switch, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-neutral-100">{rule.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-2xs font-semibold border ${triggerConfig.color} flex items-center gap-1`}
                          >
                            <TriggerIcon className="w-3 h-3" />
                            WHEN: {triggerConfig.label}
                          </span>
                          {!rule.isActive && (
                            <span className="px-1.5 py-0.5 rounded text-2xs bg-neutral-800 text-neutral-400">
                              PAUSED
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-xs text-neutral-400">{rule.description}</p>
                        )}
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenTestModal(rule)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Simulate Run
                        </button>
                        <button
                          onClick={() => handleToggleRuleStatus(rule)}
                          className="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                        >
                          {rule.isActive ? 'Pause' : 'Enable'}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule._id, rule.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Visual Execution Flow Pipeline */}
                    <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Trigger: {triggerConfig.label}
                      </div>

                      {rule.trigger?.conditions && rule.trigger.conditions.length > 0 && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300 text-2xs font-mono">
                            <Sliders className="w-3 h-3 text-amber-400" />
                            IF {rule.trigger.conditions.map((c) => `${c.field} ${c.operator} "${c.value}"`).join(' & ')}
                          </div>
                        </>
                      )}

                      <ArrowRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />

                      {/* Action Chain */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {rule.actions?.map((act, idx) => {
                          const actionConfig = ACTION_TYPES.find((a) => a.id === act.type) || {
                            label: act.type,
                            icon: CheckCircle2,
                          };
                          const ActionIcon = actionConfig.icon;

                          return (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-neutral-600 text-xs font-bold">+</span>}
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
                                <ActionIcon className="w-3.5 h-3.5 text-indigo-400" />
                                {actionConfig.label}
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Stats & Footer */}
                    <div className="flex flex-wrap items-center justify-between text-2xs text-neutral-400 pt-1 border-t border-neutral-800/50">
                      <div className="flex items-center gap-4">
                        <span>
                          Triggered: <strong className="text-neutral-200">{rule.stats?.totalTriggered || 0}</strong> times
                        </span>
                        <span>
                          Succeeded: <strong className="text-emerald-400">{rule.stats?.totalSucceeded || 0}</strong>
                        </span>
                        {rule.stats?.totalFailed > 0 && (
                          <span>
                            Failed: <strong className="text-red-400">{rule.stats.totalFailed}</strong>
                          </span>
                        )}
                      </div>
                      <div>
                        {rule.stats?.lastExecutedAt ? (
                          <span>Last run: {new Date(rule.stats.lastExecutedAt).toLocaleString()}</span>
                        ) : (
                          <span>Never executed</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXECUTION AUDIT LOGS */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-neutral-200">Automation Execution Trace History</h3>
            </div>
            <button
              onClick={fetchWorkflowsData}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Refresh Trace Logs
            </button>
          </div>

          {executions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-xs">
              No executions recorded yet. Trigger an event or run a rule simulation to generate trace logs.
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-semibold uppercase text-2xs tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Rule Name</th>
                    <th className="px-4 py-3">Trigger Event</th>
                    <th className="px-4 py-3">Actions Completed</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Executed At</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {executions.map((exec) => (
                    <tr key={exec._id} className="hover:bg-neutral-800/30 transition">
                      <td className="px-4 py-3">
                        {exec.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        ) : exec.status === 'partial' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-neutral-200">{exec.ruleName}</td>
                      <td className="px-4 py-3 font-mono text-2xs text-neutral-300">{exec.triggerEvent}</td>
                      <td className="px-4 py-3 text-neutral-400">
                        {exec.actionsExecuted?.length || 0} actions
                      </td>
                      <td className="px-4 py-3 font-mono text-2xs text-cyan-400">
                        {exec.totalDurationMs}ms
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {new Date(exec.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedExecution(exec)}
                          className="px-2.5 py-1 text-2xs rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700/60"
                        >
                          Inspect Trace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRE-BUILT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PREBUILT_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral-100">{tmpl.name}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{tmpl.description}</p>

                <div className="space-y-1.5 pt-2">
                  <div className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Trigger</div>
                  <div className="text-xs font-mono text-indigo-300 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800">
                    {tmpl.trigger.event}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Actions ({tmpl.actions.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {tmpl.actions.map((act, aIdx) => (
                      <span key={aIdx} className="px-2 py-0.5 rounded text-2xs bg-neutral-800 text-neutral-300">
                        {act.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal(tmpl)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition cursor-pointer"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT RULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Rule Name & Desc */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Client Setup & Onboarding"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="What business process does this rule automate?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Trigger Event */}
              <div className="space-y-2 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <label className="block text-xs font-bold text-neutral-200">1. Select Trigger Event</label>
                <select
                  value={formData.triggerEvent}
                  onChange={(e) => setFormData({ ...formData, triggerEvent: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {TRIGGER_EVENTS.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.label} ({ev.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditions Builder */}
              <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200">2. Conditions / Filters (Optional)</label>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="text-2xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Filter
                  </button>
                </div>

                {formData.conditions.length === 0 ? (
                  <div className="text-2xs text-neutral-500 italic">No conditions set — rule will trigger on all occurrences of this event.</div>
                ) : (
                  <div className="space-y-2">
                    {formData.conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Field (e.g. status, amount)"
                          value={cond.field}
                          onChange={(e) => handleUpdateCondition(idx, 'field', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                        />
                        <select
                          value={cond.operator}
                          onChange={(e) => handleUpdateCondition(idx, 'operator', e.target.value)}
                          className="px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300"
                        >
                          <option value="equals">equals</option>
                          <option value="not_equals">not equals</option>
                          <option value="greater_than">&gt; (greater than)</option>
                          <option value="less_than">&lt; (less than)</option>
                          <option value="contains">contains</option>
                          <option value="is_set">is set</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Value"
                          value={cond.value}
                          onChange={(e) => handleUpdateCondition(idx, 'value', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          className="p-1.5 text-neutral-500 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Chain Builder */}
              <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200">3. Action Execution Chain</label>
                  <div className="flex items-center gap-1">
                    <span className="text-2xs text-neutral-500">Add Action:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddAction(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="text-2xs px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-300 focus:outline-none"
                    >
                      <option value="">+ Choose Type</option>
                      {ACTION_TYPES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.actions.map((act, aIdx) => (
                    <div key={aIdx} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                          Step {aIdx + 1}: {ACTION_TYPES.find((a) => a.id === act.type)?.label || act.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(aIdx)}
                          className="text-2xs text-neutral-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Params specific to action */}
                      {act.type === 'create_task' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Task Title (Supports {{name}})"
                            value={act.params?.title || ''}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'title', e.target.value)}
                            className="col-span-2 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                          <select
                            value={act.params?.priority || 'medium'}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'priority', e.target.value)}
                            className="px-2 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent Priority</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Due in days"
                            value={act.params?.dueInDays || 3}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'dueInDays', Number(e.target.value))}
                            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                        </div>
                      )}

                      {act.type === 'send_notification' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Notification Title ({{name}})"
                            value={act.params?.title || ''}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'title', e.target.value)}
                            className="col-span-2 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                          <input
                            type="text"
                            placeholder="Message body"
                            value={act.params?.message || ''}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'message', e.target.value)}
                            className="col-span-2 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                        </div>
                      )}

                      {act.type === 'update_client_status' && (
                        <div className="text-xs">
                          <select
                            value={act.params?.status || 'active'}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'status', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          >
                            <option value="lead">Lead</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="churned">Churned</option>
                          </select>
                        </div>
                      )}

                      {act.type === 'generate_invoice_draft' && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Line item description"
                            value={act.params?.lineItemDescription || ''}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'lineItemDescription', e.target.value)}
                            className="col-span-2 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                          <input
                            type="number"
                            placeholder="Amount ($)"
                            value={act.params?.amount || 1000}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'amount', Number(e.target.value))}
                            className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                        </div>
                      )}

                      {act.type === 'dispatch_webhook' && (
                        <div className="text-xs">
                          <input
                            type="text"
                            placeholder="Custom Outbound Event Name (e.g. client.onboarded)"
                            value={act.params?.customEvent || ''}
                            onChange={(e) => handleUpdateActionParam(aIdx, 'customEvent', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                >
                  {editingRule ? 'Update Rule' : 'Create Automation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATE / TEST RUN MODAL */}
      {testModalRule && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400 fill-current" />
                <h3 className="text-base font-bold text-neutral-100">
                  Simulate Run: {testModalRule.name}
                </h3>
              </div>
              <button
                onClick={() => setTestModalRule(null)}
                className="text-neutral-400 hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs text-neutral-400">
                Trigger Event: <strong className="text-indigo-300 font-mono">{testModalRule.trigger?.event}</strong>.
                Provide sample JSON to test condition matching and action chains:
              </div>

              <textarea
                rows={6}
                value={testPayloadText}
                onChange={(e) => setTestPayloadText(e.target.value)}
                className="w-full p-3 font-mono text-2xs bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleRunSimulation}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  Execute Simulation
                </button>
                <button
                  onClick={() => setTestModalRule(null)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Close
                </button>
              </div>

              {/* Simulation Result Output */}
              {testResult && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      {testResult.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-400" />
                      )}
                      Status: <strong className="uppercase">{testResult.status}</strong>
                    </span>
                    <span className="font-mono text-2xs text-cyan-400">{testResult.totalDurationMs}ms</span>
                  </div>

                  <div className="text-2xs text-neutral-400">
                    Conditions Filter Result: <strong className={testResult.conditionsPassed ? 'text-emerald-400' : 'text-red-400'}>
                      {testResult.conditionsPassed ? 'MATCHED (PASSED)' : 'NOT MATCHED (SKIPPED)'}
                    </strong>
                  </div>

                  {testResult.actionLogs && testResult.actionLogs.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="text-2xs font-semibold uppercase tracking-wider text-neutral-500">Executed Actions</div>
                      {testResult.actionLogs.map((log, idx) => (
                        <div key={idx} className="p-2 rounded bg-neutral-900 border border-neutral-800/80 text-2xs flex items-center justify-between">
                          <span className="text-neutral-300 font-mono">{log.actionType}</span>
                          <span className={log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                            {log.status} ({log.durationMs}ms)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT EXECUTION TRACE DRAWER/MODAL */}
      {selectedExecution && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-neutral-100">
                  Trace: {selectedExecution.ruleName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedExecution(null)}
                className="text-neutral-400 hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="text-2xs text-neutral-500">Trigger Event</div>
                  <div className="font-mono text-neutral-200 mt-0.5">{selectedExecution.triggerEvent}</div>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <div className="text-2xs text-neutral-500">Execution Time</div>
                  <div className="font-mono text-cyan-400 mt-0.5">{selectedExecution.totalDurationMs} ms</div>
                </div>
              </div>

              {/* Actions Executed */}
              <div className="space-y-2">
                <div className="text-2xs font-semibold uppercase tracking-wider text-neutral-400">Action Step Outputs</div>
                {selectedExecution.actionsExecuted?.map((act, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-indigo-300">{act.actionType}</span>
                      <span className={act.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                        {act.status} ({act.durationMs}ms)
                      </span>
                    </div>
                    <pre className="p-2 rounded bg-neutral-900 text-2xs font-mono text-neutral-400 overflow-x-auto">
                      {JSON.stringify(act.output, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Trigger Payload */}
              <div className="space-y-1">
                <div className="text-2xs font-semibold uppercase tracking-wider text-neutral-400">Trigger Event Payload</div>
                <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-2xs font-mono text-neutral-300 overflow-x-auto max-h-40">
                  {JSON.stringify(selectedExecution.triggerPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default WorkflowManager;
