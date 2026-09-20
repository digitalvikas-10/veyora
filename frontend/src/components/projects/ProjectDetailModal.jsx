import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  Edit2,
  Trash2,
  CheckSquare,
  FileText,
  Plus,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export const ProjectDetailModal = ({
  isOpen,
  onClose,
  project,
  tasks = [],
  invoices = [],
  onEdit,
  onDelete,
  onCreateTask,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'billing'

  if (!isOpen || !project) return null;

  const clientObj = project.clientId;
  const projectTasks = tasks.filter(
    (t) => t.projectId === project._id || t.projectId?._id === project._id
  );
  const doneTasks = projectTasks.filter((t) => t.status === 'done');
  const projectInvoices = invoices.filter(
    (inv) =>
      inv.projectId === project._id ||
      inv.clientId === clientObj?._id ||
      inv.clientId?._id === clientObj?._id
  );

  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOverdue =
    project.status !== 'completed' &&
    project.status !== 'cancelled' &&
    project.targetDate &&
    new Date(project.targetDate) < new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{project.name}</span>
          {project.code && (
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
              {project.code}
            </span>
          )}
        </div>
      }
      size="lg"
      className="bg-neutral-900 border border-neutral-800"
    >
      <div className="space-y-4 text-xs">
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                project.status === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : project.status === 'planning'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                  : project.status === 'on-hold'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : project.status === 'completed'
                  ? 'bg-violet-950/80 text-violet-300 border border-violet-800'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-800'
              }`}
            >
              Status: {project.status}
            </span>

            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                project.priority === 'urgent'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : project.priority === 'high'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Priority: {project.priority}
            </span>

            {isOverdue && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue Milestone
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className="text-xs flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(project)}
              className="text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'text-indigo-400 border-indigo-500'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Overview & Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'text-indigo-400 border-indigo-500'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task Sprints ({projectTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'billing'
                ? 'text-indigo-400 border-indigo-500'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financials & Budget</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Progress Bar Card */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300">Project Completion Velocity</span>
                <span className="font-mono text-sm font-bold text-neutral-100">
                  {project.progressPercent || 0}%
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, project.progressPercent || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>
                  {doneTasks.length} of {projectTasks.length} sprint tasks verified complete
                </span>
                <span>Budget: {formatCurrency(project.budget, project.currency)}</span>
              </div>
            </div>

            {/* Client & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Associated Client
                </span>
                {clientObj ? (
                  <div className="space-y-1">
                    <div className="font-semibold text-sm text-neutral-100">{clientObj.name}</div>
                    {clientObj.company && (
                      <div className="text-neutral-400 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{clientObj.company}</span>
                      </div>
                    )}
                    {clientObj.email && (
                      <div className="text-neutral-400 text-[11px]">{clientObj.email}</div>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-500 italic">No client assigned</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Timeline & Target Dates
                </span>
                <div className="space-y-1 text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Kickoff Date:</span>
                    <span className="font-mono">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Target Deadline:</span>
                    <span
                      className={`font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}
                    >
                      {formatDate(project.targetDate)}
                    </span>
                  </div>
                  {project.completedDate && (
                    <div className="flex justify-between text-violet-400">
                      <span>Delivered:</span>
                      <span className="font-mono">{formatDate(project.completedDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Scope of Work & Objectives
                </span>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Classification Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-xs bg-neutral-800 text-neutral-200 border border-neutral-700 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-xs">
                {projectTasks.length} task(s) linked to this project
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateTask(project)}
                className="text-xs flex items-center gap-1 border-neutral-800 text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </Button>
            </div>

            {projectTasks.length === 0 ? (
              <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-neutral-400">No sprint tasks recorded for this project yet.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onCreateTask(project)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {projectTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-neutral-200 flex items-center gap-2">
                        <span>{t.title}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                            t.status === 'done'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : t.status === 'in-progress'
                              ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-[11px] text-neutral-400 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[11px] font-mono text-neutral-400 shrink-0">
                      {t.loggedHours || 0} / {t.estimatedHours || 0} hrs
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FINANCIALS */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Contract Budget</span>
                <span className="text-xl font-bold font-mono text-neutral-100">
                  {formatCurrency(project.budget, project.currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-[11px] text-neutral-400 block mb-1">Client Lifetime Billed</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(clientObj?.totalBilled || 0, project.currency)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Related Workspace Invoices ({projectInvoices.length})
              </span>
              {projectInvoices.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-neutral-500">
                  No invoices linked to this project or client.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {projectInvoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-neutral-200">
                          {inv.invoiceNumber || 'INV-DRAFT'}
                        </span>
                        <span className="text-neutral-500 text-[11px] ml-2">
                          {formatDate(inv.issueDate || inv.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-neutral-200">
                          {formatCurrency(inv.totalAmount || inv.total || 0, inv.currency)}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
