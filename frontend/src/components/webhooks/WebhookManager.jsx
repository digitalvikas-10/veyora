import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  Radio,
  Plus,
  RefreshCw,
  Send,
  Shield,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code2,
  Copy,
  Trash2,
  Edit2,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Activity,
  Layers,
  ArrowRight,
  Play,
  Terminal,
  Zap,
} from 'lucide-react';

const AVAILABLE_EVENTS = [
  {
    category: 'Clients & CRM',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    events: [
      { id: 'client.created', label: 'Client Created', desc: 'Triggered when a new client record is added' },
      { id: 'client.updated', label: 'Client Updated', desc: 'Triggered on status or profile changes' },
      { id: 'client.deleted', label: 'Client Deleted', desc: 'Triggered on client record archival or deletion' },
    ],
  },
  {
    category: 'Projects & Workflows',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    events: [
      { id: 'project.created', label: 'Project Created', desc: 'Triggered when a project is provisioned' },
      { id: 'project.status_changed', label: 'Project Status Changed', desc: 'Triggered when project transitions stage' },
    ],
  },
  {
    category: 'Sprint Tasks',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    events: [
      { id: 'task.created', label: 'Task Created', desc: 'Triggered when sprint item is logged' },
      { id: 'task.completed', label: 'Task Completed', desc: 'Triggered when task is resolved' },
    ],
  },
  {
    category: 'Proposals & E-Signatures',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    events: [
      { id: 'proposal.created', label: 'Proposal Created', desc: 'Triggered on new SOW draft' },
      { id: 'proposal.signed', label: 'Proposal Signed', desc: 'Triggered when client e-signs contract' },
    ],
  },
  {
    category: 'Invoicing & Settlements',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    events: [
      { id: 'invoice.created', label: 'Invoice Generated', desc: 'Triggered when invoice is billed' },
      { id: 'invoice.paid', label: 'Invoice Paid', desc: 'Triggered when payment is reconciled' },
    ],
  },
  {
    category: 'Security & Audit',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    events: [
      { id: 'security.threat_detected', label: 'Threat Detected', desc: 'Triggered on NoSQL or brute-force attack' },
    ],
  },
];

export function WebhookManager() {
  const [activeTab, setActiveTab] = useState('endpoints'); // 'endpoints' | 'logs' | 'docs'
  const { isAuthenticated, user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [testModalSub, setTestModalSub] = useState(null);
  const [testEventSelected, setTestEventSelected] = useState('test.ping');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [expandedDeliveryId, setExpandedDeliveryId] = useState(null);
  const [revealedSecrets, setRevealedSecrets] = useState({});

  // Create/Edit form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: ['*'],
    headers: '',
    maxRetries: 3,
  });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Fetch Subscriptions & Metrics
  const fetchData = useCallback(async () => {
    if (!isAuthenticated && !user && !currentWorkspace?._id) {
      return;
    }
    setLoading(true);
    try {
      const [subsRes, metricsRes] = await Promise.all([
        api.get('/webhooks'),
        api.get('/webhooks/metrics'),
      ]);
      setSubscriptions(subsRes?.data?.subscriptions || subsRes?.subscriptions || []);
      setMetrics(metricsRes?.data?.metrics || metricsRes?.metrics || null);
    } catch (err) {
      console.warn('Webhook data fetch note:', err.message || err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, currentWorkspace?._id]);

  // Fetch Delivery Logs
  const fetchDeliveries = useCallback(async () => {
    if (!isAuthenticated && !user && !currentWorkspace?._id) {
      return;
    }
    setLoadingDeliveries(true);
    try {
      const res = await api.get('/webhooks/deliveries');
      setDeliveries(res?.data?.deliveries || res?.deliveries || []);
    } catch (err) {
      console.warn('Deliveries fetch note:', err.message || err);
    } finally {
      setLoadingDeliveries(false);
    }
  }, [isAuthenticated, user, currentWorkspace?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchDeliveries();
    }
  }, [activeTab, fetchDeliveries]);

  const copyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSecret = (id) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCreate = (sub = null) => {
    if (sub) {
      setEditingSub(sub);
      setFormData({
        name: sub.name,
        url: sub.url,
        events: sub.events || [],
        headers: sub.headers ? JSON.stringify(sub.headers, null, 2) : '',
        maxRetries: sub.retryPolicy?.maxRetries ?? 3,
      });
    } else {
      setEditingSub(null);
      setFormData({
        name: '',
        url: '',
        events: ['client.created', 'invoice.paid'],
        headers: '',
        maxRetries: 3,
      });
    }
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      setFormError('Subscription name and valid endpoint URL are required');
      return;
    }
    if (formData.events.length === 0) {
      setFormError('Select at least one subscribed event trigger');
      return;
    }

    setFormSaving(true);
    setFormError('');
    try {
      let parsedHeaders = {};
      if (formData.headers.trim()) {
        try {
          parsedHeaders = JSON.parse(formData.headers);
        } catch {
          setFormError('Headers must be valid JSON format');
          setFormSaving(false);
          return;
        }
      }

      const payload = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        events: formData.events,
        headers: parsedHeaders,
        retryPolicy: { maxRetries: Number(formData.maxRetries) },
      };

      if (editingSub) {
        await api.put(`/webhooks/${editingSub._id}`, payload);
      } else {
        await api.post('/webhooks', payload);
      }

      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save webhook subscription');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteSubscription = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete webhook "${name}"? All delivery history will be purged.`)) return;
    try {
      await api.delete(`/webhooks/${id}`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete subscription');
    }
  };

  const handleRotateSecret = async (id) => {
    if (!window.confirm('Rotate HMAC signing secret? Your webhook endpoint will need to be updated with the new secret.')) return;
    try {
      await api.post(`/webhooks/${id}/rotate-secret`);
      await fetchData();
      setRevealedSecrets((prev) => ({ ...prev, [id]: true }));
    } catch (err) {
      alert(err.message || 'Failed to rotate secret');
    }
  };

  const handleToggleStatus = async (sub) => {
    const nextStatus = sub.status === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/webhooks/${sub._id}`, { status: nextStatus });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleOpenTest = (sub) => {
    setTestModalSub(sub);
    setTestEventSelected(sub.events.includes('*') ? 'client.created' : sub.events[0] || 'test.ping');
    setTestResult(null);
  };

  const handleExecuteTest = async () => {
    if (!testModalSub) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await api.post(`/webhooks/${testModalSub._id}/test`, {
        event: testEventSelected,
      });
      setTestResult(res?.data?.delivery || null);
      await fetchData();
    } catch (err) {
      setTestResult({
        status: 'failed',
        error: err.message || 'Test dispatch failed',
      });
    } finally {
      setTestSending(false);
    }
  };

  const handleRedeliver = async (deliveryId) => {
    try {
      await api.post(`/webhooks/deliveries/${deliveryId}/redeliver`);
      alert('Event successfully redelivered!');
      await fetchDeliveries();
      await fetchData();
    } catch (err) {
      alert(err.message || 'Redelivery attempt failed');
    }
  };

  const toggleEventSelection = (eventId) => {
    setFormData((prev) => {
      const exists = prev.events.includes(eventId);
      if (exists) {
        return { ...prev, events: prev.events.filter((e) => e !== eventId) };
      } else {
        return { ...prev, events: [...prev.events, eventId] };
      }
    });
  };

  const selectAllEvents = () => {
    const all = AVAILABLE_EVENTS.flatMap((c) => c.events.map((e) => e.id));
    setFormData((prev) => ({ ...prev, events: all }));
  };

  const deselectAllEvents = () => {
    setFormData((prev) => ({ ...prev, events: [] }));
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900/60 border border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-100">Outbound Webhooks & Event Automation</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Event Dispatch
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time HTTP event dispatch with cryptographic HMAC-SHA256 signature verification, automatic retries & payload logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-800"
            title="Refresh Webhooks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Webhook Endpoint
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Active Endpoints</div>
          <div className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
            {metrics?.activeSubscriptions ?? 0}
            <span className="text-xs text-neutral-500 font-normal">/ {metrics?.totalSubscriptions ?? 0} total</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Total Dispatches</div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics?.totalDeliveries ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Delivery Success Rate</div>
          <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {metrics?.successRate ?? 100}%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Avg Dispatch Latency</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {metrics?.avgLatencyMs ?? 0}ms
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'endpoints', label: 'Subscriptions & Endpoints', icon: Radio, count: subscriptions.length },
            { id: 'logs', label: 'Live Delivery Logs & Inspector', icon: Activity },
            { id: 'docs', label: 'HMAC Signature & SDK Guide', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-2xs bg-neutral-950 text-neutral-400 font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Subscriptions & Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search webhooks by name or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Status:</span>
              {['all', 'active', 'paused'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-neutral-800 text-neutral-100 border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Webhook Cards List */}
          {filteredSubscriptions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Radio className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-neutral-200">No Webhook Subscriptions Found</div>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Configure an outbound endpoint URL to receive real-time HTTP payloads whenever events occur in this workspace.
              </p>
              <button
                onClick={() => handleOpenCreate()}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition"
              >
                <Plus className="w-4 h-4" />
                Add Your First Webhook
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubscriptions.map((sub) => {
                const isSecretRevealed = revealedSecrets[sub._id];
                return (
                  <div
                    key={sub._id}
                    className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-sm font-bold text-neutral-100">{sub.name}</h3>
                          <span
                            className={`px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider rounded-md border ${
                              sub.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                          <span className="truncate max-w-md bg-neutral-950 px-2.5 py-1 rounded-md border border-neutral-800">
                            {sub.url}
                          </span>
                          <button
                            onClick={() => copyText(sub.url, `url-${sub._id}`)}
                            className="p-1 text-neutral-400 hover:text-neutral-200"
                            title="Copy URL"
                          >
                            {copiedId === `url-${sub._id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Top Action Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenTest(sub)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Test Payload
                        </button>
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className="px-2.5 py-1.5 text-xs rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
                        >
                          {sub.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleOpenCreate(sub)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubscription(sub._id, sub.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subscribed Events Pills */}
                    <div className="space-y-1.5">
                      <div className="text-2xs uppercase tracking-wider text-neutral-400 font-semibold">
                        Subscribed Event Triggers ({sub.events.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {sub.events.map((evt) => (
                          <span
                            key={evt}
                            className="px-2 py-0.5 text-2xs font-mono font-medium rounded-md bg-neutral-950 text-neutral-300 border border-neutral-800"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* HMAC Signing Secret Bar */}
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-neutral-400 font-medium">Signing Secret:</span>
                        <span className="font-mono text-neutral-300">
                          {isSecretRevealed ? sub.secret : `${sub.secret.slice(0, 10)}••••••••••••••••••••••••`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSecret(sub._id)}
                          className="text-2xs text-indigo-400 hover:underline"
                        >
                          {isSecretRevealed ? 'Hide' : 'Reveal'}
                        </button>
                        <button
                          onClick={() => copyText(sub.secret, `sec-${sub._id}`)}
                          className="p-1 text-neutral-400 hover:text-neutral-200"
                          title="Copy Secret"
                        >
                          {copiedId === `sec-${sub._id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRotateSecret(sub._id)}
                          className="flex items-center gap-1 text-2xs text-amber-400 hover:underline ml-2"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Rotate
                        </button>
                      </div>
                    </div>

                    {/* Delivery Stats Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800/80 text-xs text-neutral-400">
                      <div className="flex items-center gap-4">
                        <span>
                          Total Dispatches: <strong className="text-neutral-200">{sub.stats?.totalDeliveries || 0}</strong>
                        </span>
                        <span>
                          Success: <strong className="text-emerald-400">{sub.stats?.successCount || 0}</strong>
                        </span>
                        <span>
                          Failures: <strong className="text-red-400">{sub.stats?.failureCount || 0}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.stats?.lastStatusCode && (
                          <span className="font-mono">
                            Last Status: <strong className={sub.stats.lastStatusCode === 200 ? 'text-emerald-400' : 'text-amber-400'}>HTTP {sub.stats.lastStatusCode}</strong>
                          </span>
                        )}
                        {sub.stats?.lastDeliveredAt && (
                          <span>
                            Last: {new Date(sub.stats.lastDeliveredAt).toLocaleTimeString()}
                          </span>
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

      {/* TAB 2: Live Delivery Logs & Inspector */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Event Dispatch History &amp; Request Inspector
            </h3>
            <button
              onClick={fetchDeliveries}
              disabled={loadingDeliveries}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDeliveries ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-xs">
              No delivery events logged yet. Trigger a webhook or click "Test Payload" from the Subscriptions tab.
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((del) => {
                const isExpanded = expandedDeliveryId === del._id;
                return (
                  <div
                    key={del._id}
                    className="rounded-xl bg-neutral-900/80 border border-neutral-800 overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => setExpandedDeliveryId(isExpanded ? null : del._id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-900/90 select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md ${
                            del.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {del.responseStatus ? `HTTP ${del.responseStatus}` : 'FAILED'}
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-300">{del.event}</span>
                        <span className="text-xs text-neutral-400 truncate max-w-xs">{del.endpointUrl}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="font-mono">{del.durationMs}ms</span>
                        <span>{new Date(del.createdAt).toLocaleTimeString()}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-4 text-xs font-mono">
                        {/* Request Headers */}
                        <div className="space-y-1.5">
                          <div className="text-2xs uppercase text-neutral-400 font-sans font-semibold">
                            Request Headers Sent
                          </div>
                          <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(del.requestHeaders, null, 2)}
                          </pre>
                        </div>

                        {/* Request Payload */}
                        <div className="space-y-1.5">
                          <div className="text-2xs uppercase text-neutral-400 font-sans font-semibold">
                            Signed JSON Payload Body
                          </div>
                          <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-300 overflow-x-auto text-[11px]">
                            {JSON.stringify(del.payload, null, 2)}
                          </pre>
                        </div>

                        {/* Response Body */}
                        <div className="space-y-1.5">
                          <div className="text-2xs uppercase text-neutral-400 font-sans font-semibold">
                            Server Response Body
                          </div>
                          <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-300 overflow-x-auto text-[11px]">
                            {del.responseBody || '(Empty response body)'}
                          </pre>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedeliver(del._id);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-sans transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                            Re-deliver Event Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HMAC Signature & SDK Guide */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Cryptographic HMAC-SHA256 Verification
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Every outbound webhook request from VEYORA includes a cryptographic signature in the header:
            </p>
            <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-indigo-300 border border-neutral-800">
              X-Veyora-Signature: sha256=4f2a79...
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              To verify that an event was sent by VEYORA and was not tampered with, compute the HMAC SHA-256 of the raw request payload using your webhook endpoint's secret and compare it using a constant-time comparison function.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              Node.js (Express) Verification Example
            </h4>
            <pre className="p-3.5 rounded-xl bg-neutral-950 font-mono text-2xs text-neutral-300 border border-neutral-800 overflow-x-auto leading-relaxed">
{`// Verify Veyora Signature in Express handler
import crypto from 'crypto';

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-veyora-signature'];
  const secret = process.env.VEYORA_WEBHOOK_SECRET;

  const expected = 'sha256=' + crypto.createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return res.status(401).send('Signature Mismatch');
  }

  const event = JSON.parse(req.body);
  console.log('Processed Event:', event.event);
  res.status(200).json({ received: true });
});`}
            </pre>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WEBHOOK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-neutral-100">
                  {editingSub ? 'Edit Webhook Endpoint' : 'New Webhook Subscription'}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-200 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubscription} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Subscription Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production Slack Bot, Accounting Sync"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Endpoint URL (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://api.yourdomain.com/webhooks/veyora"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Event selector grouped by category */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300">Select Subscribed Events</label>
                  <div className="flex items-center gap-2 text-2xs">
                    <button
                      type="button"
                      onClick={selectAllEvents}
                      className="text-purple-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-600">|</span>
                    <button
                      type="button"
                      onClick={deselectAllEvents}
                      className="text-neutral-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  {AVAILABLE_EVENTS.map((category) => (
                    <div key={category.category} className="space-y-1.5">
                      <div className="text-2xs font-bold uppercase tracking-wider text-neutral-400">
                        {category.category}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {category.events.map((evt) => {
                          const isChecked = formData.events.includes(evt.id);
                          return (
                            <label
                              key={evt.id}
                              onClick={() => toggleEventSelection(evt.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${
                                isChecked
                                  ? 'bg-purple-950/30 border-purple-800/80 text-purple-200'
                                  : 'bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-purple-600 focus:ring-0 focus:ring-offset-0 bg-neutral-950 border-neutral-700"
                              />
                              <span className="font-medium truncate">{evt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
                >
                  {formSaving ? 'Saving...' : editingSub ? 'Update Webhook' : 'Create Webhook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST EVENT PAYLOAD MODAL */}
      {testModalSub && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-neutral-100">Send Test Webhook Event</h3>
              </div>
              <button
                onClick={() => setTestModalSub(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
                <div className="text-neutral-400">Target Endpoint:</div>
                <div className="font-mono text-purple-300 font-semibold truncate">{testModalSub.url}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">Simulate Event Type</label>
                <select
                  value={testEventSelected}
                  onChange={(e) => setTestEventSelected(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="test.ping">test.ping (Standard Ping Payload)</option>
                  <option value="client.created">client.created (New Client Onboarded)</option>
                  <option value="invoice.paid">invoice.paid (Revenue Settlement)</option>
                  <option value="proposal.signed">proposal.signed (Contract Acceptance)</option>
                  <option value="security.threat_detected">security.threat_detected (Shield Alert)</option>
                </select>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${
                    testResult.status === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/40 border-red-800 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      {testResult.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      )}
                      {testResult.status === 'success' ? `HTTP ${testResult.responseStatus} OK (${testResult.durationMs}ms)` : 'Dispatch Failed'}
                    </span>
                    <span className="text-neutral-400 text-2xs">Signed with HMAC-SHA256</span>
                  </div>
                  {testResult.error && (
                    <div className="text-red-300 text-2xs">{testResult.error}</div>
                  )}
                  {testResult.signature && (
                    <div className="text-2xs truncate text-neutral-400">
                      Sig: {testResult.signature.slice(0, 32)}...
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTestModalSub(null)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Close
                </button>
                <button
                  onClick={handleExecuteTest}
                  disabled={testSending}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${testSending ? 'animate-bounce' : ''}`} />
                  {testSending ? 'Dispatching...' : 'Dispatch Test Payload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
