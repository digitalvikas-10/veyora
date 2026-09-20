import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { Card, Badge } from '../ui';

export const ProjectGrid = ({
  projects = [],
  tasks = [],
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onCreateTaskForProject,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'planning':
        return <Badge variant="info">Planning</Badge>;
      case 'on-hold':
        return <Badge variant="warning">On-Hold</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-violet-950/60 text-violet-300 border-violet-800/60">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
        <p className="text-xs text-neutral-400">Loading projects...</p>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="p-8 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-500 flex items-center justify-center mx-auto">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-200">No Projects Found</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          No projects match your current filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const clientObj = project.clientId;
        const projectTasks = tasks.filter(
          (t) => t.projectId === project._id || t.projectId?._id === project._id
        );
        const overdue = isOverdue(project);

        return (
          <Card
            key={project._id}
            onClick={() => onSelectProject(project)}
            className="p-4 bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
          >
            {/* Top Row: Code, Status, Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {project.code ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                    {project.code}
                  </span>
                ) : (
                  <span className="p-1.5 rounded-md bg-indigo-950/40 text-indigo-400 border border-indigo-800/30">
                    <Briefcase className="w-3.5 h-3.5" />
                  </span>
                )}
                {getStatusBadge(project.status)}
              </div>

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

            {/* Title & Client */}
            <div>
              <h3 className="font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors line-clamp-1 text-sm">
                {project.name}
              </h3>
              {clientObj && (
                <div className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate">
                    {clientObj.name} {clientObj.company ? `(${clientObj.company})` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Progress</span>
                <span className="font-mono text-neutral-200">{project.progressPercent || 0}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    project.status === 'completed'
                      ? 'bg-violet-500'
                      : (project.progressPercent || 0) >= 80
                      ? 'bg-emerald-500'
                      : (project.progressPercent || 0) >= 40
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, project.progressPercent || 0)}%` }}
                />
              </div>
            </div>

            {/* Financials & Target Date */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 block">Committed Budget</span>
                <span className="font-mono font-semibold text-neutral-200">
                  {formatCurrency(project.budget, project.currency)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block">Target Date</span>
                <span
                  className={`font-medium flex items-center gap-1 ${
                    overdue ? 'text-rose-400 font-bold' : 'text-neutral-300'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-neutral-500" />
                  {formatDate(project.targetDate) || 'Flexible'}
                </span>
              </div>
            </div>

            {/* Tags & Action Bar */}
            <div
              className="pt-2 border-t border-neutral-800/80 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
                <span>{projectTasks.length} tasks</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onCreateTaskForProject(project)}
                  title="Add Task"
                  className="p-1 rounded text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditProject(project)}
                  title="Edit Project"
                  className="p-1 rounded text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteProject(project)}
                  title="Delete Project"
                  className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
