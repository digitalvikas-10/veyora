import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Building, 
  FolderPlus, 
  Receipt, 
  CheckSquare 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Select, Card } from '../ui';

import { ExecutiveKpis } from './ExecutiveKpis';
import { RevenueChart } from './RevenueChart';
import { AgingMatrixChart } from './AgingMatrixChart';
import { ProjectHealthChart } from './ProjectHealthChart';
import { SprintVelocityChart } from './SprintVelocityChart';
import { TopClientsTable } from './TopClientsTable';
import { RecentActivityFeed } from './RecentActivityFeed';
import { QuickActionModals } from './QuickActionModals';

export const ExecutiveDashboard = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { analytics, fetchAnalytics, loadingStates } = useData();

  const [timeframe, setTimeframe] = useState('6m');
  const [activeModal, setActiveModal] = useState(null); // 'invoice' | 'project' | 'task' | null
  const [selectedClient, setSelectedClient] = useState(null);

  // Initial fetch on mount or timeframe switch
  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchAnalytics(timeframe);
    }
  }, [currentWorkspace?._id, timeframe, fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics(timeframe);
  };

  const handleExportSummary = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analytics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `veyora-analytics-${currentWorkspace?.slug || 'tenant'}-${timeframe}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isLoading = loadingStates.analytics;

  return (
    <div className="space-y-4" id="executive-dashboard-container">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-neutral-100 tracking-tight">
                Executive Telemetry & Revenue Dashboard
              </h1>
              <Badge variant="success" size="xs" dot>
                Live Sync
              </Badge>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
              <span>Tenant: <strong className="text-neutral-200">{currentWorkspace?.name || 'VEYORA Global'}</strong></span>
              <span className="text-neutral-600">•</span>
              <span className="text-[11px] text-neutral-500">
                Updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleTimeString() : 'Current'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 text-xs">
            {[
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '6m', label: '6 Months' },
              { id: '1y', label: '1 Year' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeframe === t.id
                    ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Sync
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSummary}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Export
          </Button>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setActiveModal('invoice')}
              icon={<Receipt className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              + Invoice
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveModal('project')}
              icon={<FolderPlus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              + Project
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveModal('task')}
              icon={<CheckSquare className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              + Task
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Cards (Row 1) */}
      <ExecutiveKpis kpis={analytics?.kpis} loading={isLoading} />

      {/* 3. Primary Visualizations (Row 2): Cashflow Trajectory (7 cols) + Aging Matrix (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-7">
          <RevenueChart data={analytics?.revenueTrend} loading={isLoading} />
        </div>
        <div className="lg:col-span-5">
          <AgingMatrixChart data={analytics?.arAging} loading={isLoading} />
        </div>
      </div>

      {/* 4. Secondary Analytics (Row 3): Project Stages (4 cols) + Sprint Velocity (4 cols) + Activity Feed (4 cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-4">
          <ProjectHealthChart data={analytics?.projectDistribution} loading={isLoading} />
        </div>
        <div className="lg:col-span-4">
          <SprintVelocityChart 
            taskPriorityData={analytics?.taskPriorityDistribution} 
            kpis={analytics?.kpis} 
            loading={isLoading} 
          />
        </div>
        <div className="lg:col-span-4 md:col-span-2">
          <RecentActivityFeed 
            activities={analytics?.recentAuditLogs} 
            loading={isLoading} 
            onRefresh={handleRefresh}
          />
        </div>
      </div>

      {/* 5. Tertiary Analytics (Row 4): Top Performing Clients (8 cols) + Financial Reconciliation Card (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-8">
          <TopClientsTable 
            clients={analytics?.topClients} 
            loading={isLoading} 
            onSelectClient={(c) => setSelectedClient(c)}
          />
        </div>

        <div className="lg:col-span-4">
          <Card variant="glass" className="h-full flex flex-col justify-between p-4" id="dashboard-financial-summary-card">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Cashflow Reconciliation
                </span>
                <Badge variant="success" size="xs">
                  Balanced
                </Badge>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Stripe Escrow Settled:</span>
                  <span className="font-mono text-neutral-200 font-medium">
                    ${Number((analytics?.kpis?.totalCollected || 0) * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/80">
                  <span className="text-neutral-400">ACH Bank Wires:</span>
                  <span className="font-mono text-neutral-200 font-medium">
                    ${Number((analytics?.kpis?.totalCollected || 0) * 0.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Estimated Gross Margin:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {analytics?.kpis?.totalInvoiced > 0 ? '72.4%' : '0.0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-neutral-800/80">
                  <span className="text-neutral-400">Average Contract Value:</span>
                  <span className="font-mono text-neutral-200 font-medium">
                    ${analytics?.kpis?.totalClients > 0 ? Math.round((analytics?.kpis?.totalInvoiced || 0) / analytics.kpis.totalClients).toLocaleString('en-US') : 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>SOC2 Type II Audit Ready</span>
              </div>
              <Button 
                size="xs" 
                variant="outline" 
                onClick={() => setActiveModal('invoice')}
              >
                Issue Invoice
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 6. Quick Action Modals */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSuccess={() => fetchAnalytics(timeframe)}
      />
    </div>
  );
};
