import React from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { Card } from '../ui';

export const TaskMetrics = ({ tasks = [] }) => {
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress' || t.status === 'in-review').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  const totalEstimated = tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);
  const totalLogged = tasks.reduce((sum, t) => sum + (Number(t.loggedHours) || 0), 0);

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const overdueCount = tasks.filter((t) => {
    if (t.status === 'done' || t.status === 'cancelled') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < now;
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Sprints & Backlog */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Total Work Items</span>
          <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100">
            {totalTasks}
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">tasks</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span>{todoTasks} in queue / ready to sprint</span>
        </div>
      </Card>

      {/* 2. Active Development Velocity */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Active In Flight</span>
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
            <PlayCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-400">
            {inProgressTasks}
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">active / review</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Flame className="w-3 h-3 text-amber-400" />
          <span>Under development or QA review</span>
        </div>
      </Card>

      {/* 3. Hours Recorded vs Estimated */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Logged Hours</span>
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
            {totalLogged.toFixed(1)}
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            / {totalEstimated.toFixed(1)} est. hrs
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
          <TrendingUp className="w-3 h-3 text-cyan-400" />
          <span>
            {totalEstimated > 0
              ? `${Math.round((totalLogged / totalEstimated) * 100)}% burn of budgeted hours`
              : 'Continuous time logging'}
          </span>
        </div>
      </Card>

      {/* 4. Sprint Completion Velocity */}
      <Card className="p-4 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Sprint Completion</span>
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-neutral-100 font-mono">
            {completionRate}%
          </span>
          <span className="text-[11px] text-neutral-500 font-mono">
            ({doneTasks} closed)
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {overdueCount > 0 ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overdueCount} task(s) past due
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All sprint milestones on time
            </span>
          )}
        </div>
      </Card>
    </div>
  );
};
