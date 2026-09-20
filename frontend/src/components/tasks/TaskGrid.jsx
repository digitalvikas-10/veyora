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
  CheckCircle2,
} from 'lucide-react';
import { Card, Badge } from '../ui';

export const TaskGrid = ({
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

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
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
      <Card className="p-8 bg-neutral-900 border-neutral-800 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Loading task cards...</p>
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
          No tasks match your current filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const overdue = isOverdue(task);
        const projectObj = task.projectId;
        const checklistDone = (task.checklist || []).filter((c) => c.completed).length;
        const checklistTotal = (task.checklist || []).length;

        return (
          <Card
            key={task._id}
            onClick={() => onSelectTask(task)}
            className="p-4 bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer flex flex-col justify-between group space-y-3"
          >
            {/* Top Row: Project badge, Status, Priority */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {projectObj ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 truncate max-w-[130px]">
                    {projectObj.code || projectObj.name}
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-500">Workspace</span>
                )}
                {getStatusBadge(task.status)}
              </div>

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
              <h3
                className={`font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors line-clamp-2 text-sm ${
                  task.status === 'done' ? 'line-through text-neutral-400' : ''
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mt-1">
                  {task.description}
                </p>
              )}
            </div>

            {/* Checklist & Hours Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 text-xs">
              <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                {checklistTotal > 0 && (
                  <span className="flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-neutral-500" />
                    {checklistDone}/{checklistTotal}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {task.loggedHours || 0}h
                  {task.estimatedHours ? `/${task.estimatedHours}h` : ''}
                </span>
              </div>

              {task.dueDate && (
                <span
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    overdue ? 'text-rose-400 font-bold' : 'text-neutral-400'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {/* Actions Bar */}
            <div
              className="pt-2 border-t border-neutral-800/80 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onLogTime(task)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Clock className="w-3 h-3" />
                <span>Log Time</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditTask(task)}
                  title="Edit Task"
                  className="p-1 rounded text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTask(task)}
                  title="Delete Task"
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
