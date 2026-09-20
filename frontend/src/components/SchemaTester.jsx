import React, { useState, useEffect } from 'react';
import {
  Database,
  Layers,
  Table,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Search,
  FileText,
  Briefcase,
  CheckSquare,
  FileCode,
  DollarSign,
  FolderOpen,
  Bell,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  Code2,
  Server,
  Hash,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MODEL_ICONS = {
  Workspace: Building,
  User: User,
  Client: Briefcase,
  Project: Layers,
  Task: CheckSquare,
  Proposal: FileText,
  Invoice: DollarSign,
  Document: FolderOpen,
  Notification: Bell,
  AuditLog: ShieldCheck,
};

export default function SchemaTester() {
  const { workspace } = useAuth();

  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Counts State
  const [counts, setCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  // Fetch Schema Catalog
  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await api.get('/schemas/models-catalog');
      if (res?.data?.models) {
        setCatalog(res.data.models);
        if (!selectedModel && res.data.models.length > 0) {
          // Select Client by default
          const clientModel = res.data.models.find((m) => m.modelName === 'Client');
          setSelectedModel(clientModel || res.data.models[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load models catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Fetch Live Counts for Active Workspace
  const fetchCounts = async () => {
    if (!workspace?._id) return;
    setCountsLoading(true);
    try {
      const res = await api.get('/schemas/counts');
      if (res?.data?.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      console.error('Failed to load collection counts:', err);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [workspace?._id]);

  // Seed Realistic Dataset
  const handleSeedData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.post('/schemas/seed-sample-data');
      setSeedResult({
        success: true,
        message: 'Sample dataset seeded successfully into active workspace!',
        data: res.data?.seededEntities,
      });
      await fetchCounts();
    } catch (err) {
      setSeedResult({
        success: false,
        message: err.message || 'Failed to seed sample data',
      });
    } finally {
      setSeeding(false);
    }
  };

  // Clear Dataset
  const handleClearData = async () => {
    setClearing(true);
    setSeedResult(null);
    try {
      await api.delete('/schemas/clear-sample-data');
      setSeedResult({
        success: true,
        message: 'Operational test data cleared from active workspace.',
      });
      await fetchCounts();
    } catch (err) {
      setSeedResult({
        success: false,
        message: err.message || 'Failed to clear sample data',
      });
    } finally {
      setClearing(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Models (10)' },
    { id: 'core', label: 'Core & Auth (2)' },
    { id: 'crm', label: 'CRM (1)' },
    { id: 'operations', label: 'Operations (2)' },
    { id: 'finance', label: 'Finance & Billing (2)' },
    { id: 'assets', label: 'Assets (1)' },
    { id: 'communication', label: 'Comms (1)' },
    { id: 'security', label: 'Audit (1)' },
  ];

  const filteredCatalog = catalog.filter((m) => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      m.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="phase-6-schemas-section" className="space-y-6">
      {/* Header & Live Operational Database Status */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Phase 6: Database Models & Mongoose Schemas
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  10 Models Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Production MongoDB schemas with multi-tenant partitioning, compound indexes, and business lifecycle hooks.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSeedData}
              disabled={seeding}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition shadow-sm"
            >
              {seeding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Seed Realistic Workspace Data
            </button>
            <button
              type="button"
              onClick={handleClearData}
              disabled={clearing}
              title="Clear sample operational records"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-red-900/30 text-neutral-400 hover:text-red-300 border border-neutral-700 transition"
            >
              {clearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Workspace Collection Metric Badges */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-medium flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              Live Collection Records in Active Tenant (
              <span className="text-neutral-200 font-semibold">{workspace?.name || 'Active Workspace'}</span>)
            </span>
            <button
              type="button"
              onClick={fetchCounts}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${countsLoading ? 'animate-spin' : ''}`} /> Refresh Counts
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 font-mono text-xs">
            {[
              { label: 'Clients', count: counts?.clients ?? 0, icon: Briefcase, color: 'text-blue-400' },
              { label: 'Projects', count: counts?.projects ?? 0, icon: Layers, color: 'text-indigo-400' },
              { label: 'Tasks', count: counts?.tasks ?? 0, icon: CheckSquare, color: 'text-violet-400' },
              { label: 'Proposals', count: counts?.proposals ?? 0, icon: FileText, color: 'text-amber-400' },
              { label: 'Invoices', count: counts?.invoices ?? 0, icon: DollarSign, color: 'text-emerald-400' },
              { label: 'Documents', count: counts?.documents ?? 0, icon: FolderOpen, color: 'text-cyan-400' },
              { label: 'Notifications', count: counts?.notifications ?? 0, icon: Bell, color: 'text-pink-400' },
              { label: 'Audit Logs', count: counts?.auditLogs ?? 0, icon: ShieldCheck, color: 'text-neutral-300' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="truncate">{stat.label}</span>
                    <Icon className={`w-3 h-3 ${stat.color}`} />
                  </div>
                  <div className="text-base font-bold text-neutral-100 mt-1">{stat.count}</div>
                </div>
              );
            })}
          </div>

          {seedResult && (
            <div
              className={`p-2.5 rounded-lg text-xs font-mono mt-2 flex items-center justify-between ${
                seedResult.success
                  ? 'bg-emerald-950/40 border border-emerald-800/80 text-emerald-300'
                  : 'bg-red-950/40 border border-red-800/80 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{seedResult.message}</span>
              </div>
              {seedResult.data && (
                <span className="text-[10px] text-neutral-400">
                  {Object.entries(seedResult.data)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' • ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Model Filtering & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-neutral-800 text-neutral-100 border border-neutral-700 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model, field, or index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Master-Detail Layout: Models Grid & Schema Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
          {/* Left Column: Model Cards List (5 columns) */}
          <div className="lg:col-span-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredCatalog.map((item) => {
              const Icon = MODEL_ICONS[item.modelName] || Table;
              const isSelected = selectedModel?.modelName === item.modelName;

              return (
                <div
                  key={item.modelName}
                  onClick={() => setSelectedModel(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/20 border-indigo-500/50 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400/30'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-100">{item.modelName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {item.collection}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{item.description}</p>

                    <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-neutral-500">
                      <span>{item.totalPaths} paths</span>
                      <span>•</span>
                      <span>{item.indexCount} indexes</span>
                      {item.isMultiTenant && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">multi-tenant</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Schema Inspector & Paths Inspector (7 columns) */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            {selectedModel ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      {selectedModel.modelName} Schema Definition
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      MongoDB Collection: <code className="text-neutral-300 font-mono">{selectedModel.collection}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {selectedModel.totalPaths} Properties
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 border border-emerald-800/80 text-emerald-400">
                      {selectedModel.indexCount} Compound Indexes
                    </span>
                  </div>
                </div>

                {/* Schema Paths Table */}
                <div>
                  <span className="text-xs font-semibold text-neutral-300 block mb-2">
                    Schema Paths & Constraints:
                  </span>
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-lg border border-neutral-800">
                    <table className="w-full text-left text-xs border-collapse font-mono">
                      <thead>
                        <tr className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 text-[11px]">
                          <th className="py-2 px-3 font-semibold">Path</th>
                          <th className="py-2 px-3 font-semibold">Type</th>
                          <th className="py-2 px-3 font-semibold">Required</th>
                          <th className="py-2 px-3 font-semibold">Restrictions / Enum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-[11px]">
                        {selectedModel.paths.map((p) => (
                          <tr key={p.path} className="hover:bg-neutral-900/40">
                            <td className="py-2 px-3 text-indigo-300 font-medium">
                              {p.path}
                            </td>
                            <td className="py-2 px-3 text-neutral-400">{p.instance}</td>
                            <td className="py-2 px-3">
                              {p.isRequired ? (
                                <span className="text-amber-400 font-bold">Yes</span>
                              ) : (
                                <span className="text-neutral-500">No</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-neutral-400 text-[10px]">
                              {p.enum && p.enum.length > 0 ? (
                                <span className="text-violet-300">
                                  enum: [{p.enum.slice(0, 4).join(', ')}
                                  {p.enum.length > 4 ? ` +${p.enum.length - 4}` : ''}]
                                </span>
                              ) : p.defaultValue !== undefined ? (
                                <span className="text-neutral-500">default: {String(p.defaultValue)}</span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Compound Indexes List */}
                <div>
                  <span className="text-xs font-semibold text-neutral-300 block mb-2">
                    Indexed Paths & Multi-Tenant Compound Indexes:
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {selectedModel.indexes.map((idx, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-indigo-400" />
                          <span className="text-neutral-200">
                            {Object.entries(idx.fields)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500">
                          {idx.unique ? 'UNIQUE' : 'INDEX'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-neutral-500 text-xs">
                Select a model from the list to inspect its schema and indexes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
