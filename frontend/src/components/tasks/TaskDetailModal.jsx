import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  Briefcase,
  Building2,
  User,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  History,
  FileText,
} from 'lucide-react';
import { Modal, Button, Badge } from '../ui';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  projects = [],
  onEdit,
  onDelete,
  onUpdateStatus,
  onToggleChecklist,
  onLogTime,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'checklist' | 'time'
  const [logHours, setLogHours] = useState('1');
  const [logNote, setLogNote] = useState('');
  const [loggingTime, setLoggingTime] = useState(false);

  if (!isOpen || !task) return null;

  const projectObj = task.projectId;
  const checklist = task.checklist || [];
  const checklistDone = checklist.filter((c) => c.completed).length;
  const timeLogs = task.timeLogs || [];

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
    task.status !== 'done' &&
    task.status !== 'cancelled' &&
    task.dueDate &&
    new Date(task.dueDate) < new Date();

  const handleQuickTimeLog = async (e) => {
    e.preventDefault();
    if (!logHours || Number(logHours) <= 0) return;
    setLoggingTime(true);
    try {
      await onLogTime(task._id, Number(logHours), logNote);
      setLogHours('1');
      setLogNote('');
    } finally {
      setLoggingTime(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{task.title}</span>
        </div>
      }
      size="lg"
      className="bg-neutral-900 border border-neutral-800"
    >
      <div className="space-y-4 text-xs">
        {/* Header Badges, Quick Status Select & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => onUpdateStatus(task._id, e.target.value)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-neutral-950 border border-neutral-800 text-indigo-400 focus:outline-none focus:border-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="in-review">In Review / QA</option>
              <option value="done">Done / Verified</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                task.priority === 'urgent'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : task.priority === 'high'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : task.priority === 'medium'
                  ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              Priority: {task.priority}
            </span>

            {isOverdue && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Past Due Date
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="text-xs flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(task)}
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
            <FileText className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'text-indigo-400 border-indigo-500'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist ({checklistDone}/{checklist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`pb-2 px-1 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
              activeTab === 'time'
                ? 'text-indigo-400 border-indigo-500'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Logs ({task.loggedHours || 0}h)</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Parent Project & Due Date Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Parent Project
                </span>
                {projectObj ? (
                  <div>
                    <div className="font-semibold text-sm text-neutral-100 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{projectObj.name}</span>
                    </div>
                    {projectObj.code && (
                      <span className="text-[11px] font-mono text-neutral-400 block mt-0.5">
                        Code: {projectObj.code}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-500 italic">No parent project linked</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                  Target Deadline
                </span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span
                    className={`font-mono text-sm ${
                      isOverdue ? 'text-rose-400 font-bold' : 'text-neutral-200'
                    }`}
                  >
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                {task.createdAt && (
                  <span className="text-[11px] text-neutral-500 block">
                    Created on {formatDate(task.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Task Scope & Acceptance Criteria
              </span>
              {task.description ? (
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                  {task.description}
                </p>
              ) : (
                <p className="text-neutral-500 italic">No scope description provided.</p>
              )}
            </div>

            {/* Hours Summary Gauge */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300">Sprint Hours Burn</span>
                <span className="font-mono text-sm font-bold text-neutral-100">
                  {task.loggedHours || 0} / {task.estimatedHours || 0} hrs
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{
                    width: `${
                      task.estimatedHours > 0
                        ? Math.min(100, Math.round(((task.loggedHours || 0) / task.estimatedHours) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-xs">
                Checklist completion: {checklistDone} of {checklist.length} items checked
              </span>
            </div>

            {checklist.length === 0 ? (
              <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                <CheckSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-neutral-400">No checklist items defined for this sprint task.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="text-xs border-neutral-800"
                >
                  Edit Task to Add Checklist
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onToggleChecklist(task._id, item._id)}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // Handled by parent click
                      className="w-4 h-4 rounded border-neutral-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-neutral-900 cursor-pointer"
                    />
                    <span
                      className={`text-xs transition-colors flex-1 ${
                        item.completed
                          ? 'line-through text-neutral-500'
                          : 'text-neutral-200 group-hover:text-indigo-400'
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.completed && (
                      <span className="text-[10px] text-emerald-400 font-mono">Done</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TIME TRACKER */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            {/* Quick Log Form */}
            <form
              onSubmit={handleQuickTimeLog}
              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300 block">
                Record Work Session
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-400 text-[11px] mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-[11px] mb-1">Work Note / Deliverable</label>
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="e.g. Completed API endpoint unit tests and staging verification"
                    className="w-full px-3 py-1.5 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={loggingTime}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{loggingTime ? 'Logging...' : 'Record Session'}</span>
                </Button>
              </div>
            </form>

            {/* Time Logs History */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Session Audit History ({timeLogs.length})
              </span>
              {timeLogs.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-neutral-500">
                  No work sessions recorded yet for this task.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {timeLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/90 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-neutral-200">
                          {log.note || 'Work session recorded'}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                          <span>{formatDate(log.loggedAt)}</span>
                          {log.userId?.name && (
                            <span>• By {log.userId.name}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                        {log.hours}h
                      </span>
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
