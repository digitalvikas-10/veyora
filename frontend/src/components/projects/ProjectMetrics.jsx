import React from 'react';
import {
  Briefcase,
  Activity,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../ui';

export const ProjectMetrics = ({ projects = [] }) => {
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const planningProjects = projects.filter((p) => p.status === 'planning').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const onHoldProjects = projects.filter((p) => p.status === 'on-hold').length;

  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);
  
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + (Number(p.progressPercent) || 0), 0) / totalProjects)
    : 0;

  const now = new Date();
  const overdueCount = projects.filter((p) => {
    if (p.status === 'completed' || p.status === 'cancelled') return false;
    if (!p.targetDate) return false;
    return new Date(p.targetDate) < now;
  }).length;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Portfolio */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Total Portfolio</span>
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100">
            {totalProjects}
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">projects</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>{planningProjects} in scoping/planning</span>
        </div>
      </Card>

      {/* 2. Active Sprints / Delivery */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Active Delivery</span>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-emerald-400">
            {activeProjects}
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">in progress</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>{onHoldProjects} currently on hold</span>
        </div>
      </Card>

      {/* 3. Committed Budget Portfolio */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Committed Value</span>
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
            {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          <span>Across all active workspaces</span>
        </div>
      </Card>

      {/* 4. Completion & Health */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Avg Completion</span>
          <div className="p-2 rounded-lg bg-violet-950/60 border border-violet-800/40 text-violet-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
            {avgProgress}%
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            ({completedProjects} completed)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {overdueCount > 0 ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overdueCount} project(s) past target date
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All milestones on schedule
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
