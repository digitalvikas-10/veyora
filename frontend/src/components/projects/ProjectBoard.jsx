import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  MoreVertical,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const ProjectBoard = ({
  projects = [],
  tasks = [],
  onSelectProject,
  onEditProject,
  onUpdateStatus,
  onNewProjectInStatus,
  loading = false,
}) => {
  const COLUMNS = [
    { id: 'planning', label: 'Planning & Scoping', color: 'indigo' },
    { id: 'active', label: 'Active Delivery', color: 'emerald' },
    { id: 'on-hold', label: 'On Hold / Blocked', color: 'amber' },
    { id: 'completed', label: 'Completed Deliverables', color: 'violet' },
  ];

  const NEXT_STATUS = {
    planning: 'active',
    active: 'completed',
    'on-hold': 'active',
    completed: null,
  };

  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = (project) => {
    if (project.status === 'completed' || project.status === 'cancelled') return false;
    if (!project.targetDate) return false;
    return new Date(project.targetDate) < new Date();
  };

  if (loading) {
    return (
      <Card className="p-8 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading project boards...</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.status === col.id);
        const colBudget = colProjects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-xl bg-neutral-900/80 border border-neutral-800/90 overflow-hidden min-h-[480px]"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    col.id === 'active'
                      ? 'bg-emerald-400'
                      : col.id === 'planning'
                      ? 'bg-indigo-400'
                      : col.id === 'on-hold'
                      ? 'bg-amber-400'
                      : 'bg-violet-400'
                  }`}
                />
                <h3 className="font-semibold text-neutral-200 text-xs tracking-tight">
                  {col.label}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400">
                  {colProjects.length}
                </span>
              </div>

              <span className="text-[11px] font-mono text-neutral-500">
                {formatCurrency(colBudget)}
              </span>
            </div>

            {/* Column Body / Cards List */}
            <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[700px]">
              {colProjects.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-lg p-4 text-center">
                  <span className="text-xs text-neutral-500">No projects in this stage</span>
                </div>
              ) : (
                colProjects.map((project) => {
                  const overdue = isOverdue(project);
                  const clientObj = project.clientId;
                  const projectTasks = tasks.filter(
                    (t) => t.projectId === project._id || t.projectId?._id === project._id
                  );
                  const nextStage = NEXT_STATUS[project.status];

                  return (
                    <div
                      key={project._id}
                      onClick={() => onSelectProject(project)}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition-all cursor-pointer space-y-2.5 group hover:shadow-md"
                    >
                      {/* Card Top: Code, Priority, Budget */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {project.code && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {project.code}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              project.priority === 'urgent'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : project.priority === 'high'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {project.priority}
                          </span>
                        </div>

                        <span className="text-[11px] font-mono font-semibold text-neutral-300">
                          {formatCurrency(project.budget, project.currency)}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {project.name}
                        </h4>
                        {clientObj && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-neutral-500" />
                            <span className="truncate">
                              {clientObj.name} {clientObj.company ? `(${clientObj.company})` : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-neutral-400">Deliverable Progress</span>
                          <span className="font-mono text-neutral-200">{project.progressPercent || 0}%</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              project.status === 'completed'
                                ? 'bg-violet-500'
                                : (project.progressPercent || 0) >= 75
                                ? 'bg-emerald-500'
                                : (project.progressPercent || 0) >= 35
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, project.progressPercent || 0)}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Footer: Target Date, Tasks, Next Stage Action */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          {project.targetDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                overdue ? 'text-rose-400 font-semibold' : 'text-neutral-400'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(project.targetDate)}
                            </span>
                          )}
                          <span className="text-neutral-500 font-mono">
                            {projectTasks.length} tasks
                          </span>
                        </div>

                        {nextStage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(project._id, nextStage);
                            }}
                            title={`Advance to ${nextStage}`}
                            className="p-1 rounded bg-neutral-800 hover:bg-indigo-600 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] px-1.5"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
