import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export const ProjectTable = ({
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-blue-950/60 text-blue-300 border border-blue-800">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-neutral-800 text-neutral-400 border border-neutral-700">
            Low
          </span>
        );
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
    if (!dateStr) return '—';
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
      <Card className="p-6 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading project records from current workspace...</p>
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
          No projects match your current filter criteria or none have been initialized in this workspace yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-950/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800 text-[11px]">
            <tr>
              <th className="py-3 px-4">Project & Code</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 min-w-[140px]">Progress</th>
              <th className="py-3 px-4 text-right">Budget</th>
              <th className="py-3 px-4">Target Date</th>
              <th className="py-3 px-4 text-center">Tasks</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {projects.map((project) => {
              const overdue = isOverdue(project);
              const clientObj = project.clientId;
              const projectTasks = tasks.filter(
                (t) => t.projectId === project._id || t.projectId?._id === project._id
              );

              return (
                <tr
                  key={project._id}
                  className="hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectProject(project)}
                >
                  {/* 1. Name, Code & Tags */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/30 text-indigo-400 shrink-0 mt-0.5">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-100 hover:text-indigo-400 transition-colors">
                            {project.name}
                          </span>
                          {project.code && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                              {project.code}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {project.description}
                          </p>
                        )}
                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800/70 text-neutral-400 font-mono"
                              >
                                #{tag}
                              </span>
                            ))}
                            {project.tags.length > 3 && (
                              <span className="text-[10px] text-neutral-500">
                                +{project.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Client */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {clientObj ? (
                      <div>
                        <div className="font-medium text-neutral-200">
                          {clientObj.name}
                        </div>
                        {clientObj.company && (
                          <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-neutral-500" />
                            <span>{clientObj.company}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic">Unassigned</span>
                    )}
                  </td>

                  {/* 3. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>

                  {/* 4. Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(project.priority)}
                  </td>

                  {/* 5. Progress */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-neutral-300 font-mono">
                          {project.progressPercent || 0}%
                        </span>
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
                  </td>

                  {/* 6. Budget */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono">
                    <span className="font-semibold text-neutral-200">
                      {formatCurrency(project.budget, project.currency)}
                    </span>
                  </td>

                  {/* 7. Target Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span
                        className={`${
                          overdue ? 'text-rose-400 font-semibold' : 'text-neutral-300'
                        }`}
                      >
                        {formatDate(project.targetDate)}
                      </span>
                      {overdue && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 8. Associated Tasks Count */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {projectTasks.length}
                    </span>
                  </td>

                  {/* 9. Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onCreateTaskForProject(project)}
                        title="Add Task to Project"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditProject(project)}
                        title="Edit Project"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project)}
                        title="Delete Project"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
