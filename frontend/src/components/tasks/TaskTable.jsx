import React from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  Briefcase,
  User,
  Edit2,
  Trash2,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, Badge } from '../ui';

export const TaskTable = ({
  tasks = [],
  projects = [],
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onLogTime,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="warning" className="bg-amber-950/60 text-amber-300 border-amber-800/60">In Progress</Badge>;
      case 'in-review':
        return <Badge variant="info" className="bg-cyan-950/60 text-cyan-300 border-cyan-800/60">In Review</Badge>;
      case 'done':
        return <Badge variant="success">Done</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'todo':
      default:
        return <Badge variant="outline">To Do</Badge>;
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
      <Card className="p-6 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading backlog work items...</p>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-8 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-500 flex items-center justify-center mx-auto">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-200">No Sprint Tasks Found</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          No tasks match your current filter parameters or no sprint tasks have been initialized yet.
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
              <th className="py-3 px-4">Task & Description</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Checklist</th>
              <th className="py-3 px-4">Hours (Logged/Est)</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {tasks.map((task) => {
              const overdue = isOverdue(task);
              const projectObj = task.projectId;
              const checklistDone = (task.checklist || []).filter((c) => c.completed).length;
              const checklistTotal = (task.checklist || []).length;

              const logged = Number(task.loggedHours) || 0;
              const est = Number(task.estimatedHours) || 0;
              const hoursPercent = est > 0 ? Math.min(100, Math.round((logged / est) * 100)) : 0;

              return (
                <tr
                  key={task._id}
                  className="hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectTask(task)}
                >
                  {/* 1. Title & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                          task.status === 'done'
                            ? 'bg-emerald-950/40 border border-emerald-800/30 text-emerald-400'
                            : task.status === 'in-progress'
                            ? 'bg-amber-950/40 border border-amber-800/30 text-amber-400'
                            : 'bg-indigo-950/40 border border-indigo-800/30 text-indigo-400'
                        }`}
                      >
                        {task.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <CheckSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`font-semibold text-neutral-100 hover:text-indigo-400 transition-colors ${
                            task.status === 'done' ? 'line-through text-neutral-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 2. Project */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {projectObj ? (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <div>
                          <div className="font-medium text-neutral-200 truncate max-w-[140px]">
                            {projectObj.name}
                          </div>
                          {projectObj.code && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              {projectObj.code}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-neutral-500 italic">No project</span>
                    )}
                  </td>

                  {/* 3. Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </td>

                  {/* 4. Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>

                  {/* 5. Checklist */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {checklistTotal > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${
                          checklistDone === checklistTotal
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                        }`}
                      >
                        <CheckSquare className="w-3 h-3" />
                        {checklistDone}/{checklistTotal}
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-[11px]">—</span>
                    )}
                  </td>

                  {/* 6. Hours Tracked */}
                  <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-neutral-300 font-semibold">{logged.toFixed(1)}h</span>
                        <span className="text-neutral-500">
                          {est > 0 ? `${est.toFixed(1)}h` : 'No est.'}
                        </span>
                      </div>
                      {est > 0 && (
                        <div className="w-full bg-neutral-800 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              hoursPercent >= 100
                                ? 'bg-amber-500'
                                : hoursPercent >= 50
                                ? 'bg-indigo-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${hoursPercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 7. Due Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                      <span
                        className={`${
                          overdue ? 'text-rose-400 font-semibold' : 'text-neutral-300'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                      {overdue && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          LATE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 8. Actions */}
                  <td
                    className="py-3.5 px-4 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onLogTime(task)}
                        title="Log Work Session"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        title="Edit Task"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task)}
                        title="Delete Task"
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
