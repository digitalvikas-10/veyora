import React from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  Briefcase,
  ArrowRight,
  Plus,
  AlertCircle,
  CheckCircle2,
  Play,
  User,
  MoreVertical,
} from 'lucide-react';
import { Card, Badge } from '../ui';

export const TaskBoard = ({
  tasks = [],
  projects = [],
  onSelectTask,
  onEditTask,
  onUpdateStatus,
  onLogTime,
  loading = false,
}) => {
  const COLUMNS = [
    { id: 'todo', label: 'To Do', color: 'slate' },
    { id: 'in-progress', label: 'In Progress', color: 'amber' },
    { id: 'in-review', label: 'In Review / QA', color: 'cyan' },
    { id: 'done', label: 'Completed', color: 'emerald' },
  ];

  const NEXT_STATUS = {
    todo: 'in-progress',
    'in-progress': 'in-review',
    'in-review': 'done',
    done: null,
  };

  const PREV_STATUS = {
    todo: null,
    'in-progress': 'todo',
    'in-review': 'in-progress',
    done: 'in-review',
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

  const isOverdue = (task) => {
    if (task.status === 'done' || task.status === 'cancelled') return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  if (loading) {
    return (
      <Card className="p-8 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading sprint tasks board...</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        const colLogged = colTasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);

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
                    col.id === 'done'
                      ? 'bg-emerald-400'
                      : col.id === 'in-review'
                      ? 'bg-cyan-400'
                      : col.id === 'in-progress'
                      ? 'bg-amber-400'
                      : 'bg-neutral-400'
                  }`}
                />
                <h3 className="font-semibold text-neutral-200 text-xs tracking-tight">
                  {col.label}
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-400">
                  {colTasks.length}
                </span>
              </div>

              <span className="text-[11px] font-mono text-neutral-500">
                {colLogged.toFixed(1)}h logged
              </span>
            </div>

            {/* Tasks Container */}
            <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[700px]">
              {colTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-lg p-4 text-center">
                  <span className="text-xs text-neutral-500">No tasks in this lane</span>
                </div>
              ) : (
                colTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const projectObj = task.projectId;
                  const checklistDone = (task.checklist || []).filter((c) => c.completed).length;
                  const checklistTotal = (task.checklist || []).length;
                  const nextStage = NEXT_STATUS[task.status];

                  return (
                    <div
                      key={task._id}
                      onClick={() => onSelectTask(task)}
                      className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/90 hover:border-neutral-700 transition-all cursor-pointer space-y-2.5 group hover:shadow-md"
                    >
                      {/* Card Top: Project Code, Priority */}
                      <div className="flex items-center justify-between">
                        {projectObj ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 truncate max-w-[120px]">
                              {projectObj.code || projectObj.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-500">Workspace Task</span>
                        )}

                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            task.priority === 'urgent'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : task.priority === 'high'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : task.priority === 'medium'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Meta Indicators: Checklist & Hours */}
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        {checklistTotal > 0 && (
                          <span
                            className={`flex items-center gap-1 font-mono ${
                              checklistDone === checklistTotal ? 'text-emerald-400' : 'text-neutral-400'
                            }`}
                          >
                            <CheckSquare className="w-3 h-3" />
                            {checklistDone}/{checklistTotal}
                          </span>
                        )}

                        <span className="flex items-center gap-1 font-mono text-neutral-400">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {task.loggedHours || 0}h
                          {task.estimatedHours ? ` / ${task.estimatedHours}h` : ''}
                        </span>

                        {task.assigneeId && (
                          <span className="flex items-center gap-1 text-neutral-300 truncate max-w-[90px]">
                            <User className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span className="truncate text-[10px]">{task.assigneeId.name}</span>
                          </span>
                        )}
                      </div>

                      {/* Card Footer: Due Date & Action */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                        <div>
                          {task.dueDate ? (
                            <span
                              className={`flex items-center gap-1 ${
                                overdue ? 'text-rose-400 font-bold' : 'text-neutral-400'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          ) : (
                            <span className="text-neutral-600 text-[10px]">No due date</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onLogTime(task);
                            }}
                            title="Log Work Session"
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-cyan-400 text-[10px] px-1.5 transition-colors flex items-center gap-1"
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>Log</span>
                          </button>

                          {nextStage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(task._id, nextStage);
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
