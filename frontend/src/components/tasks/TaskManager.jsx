import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUI } from '../../context/UIContext';
import { TaskMetrics } from './TaskMetrics';
import { TaskFilters } from './TaskFilters';
import { TaskTable } from './TaskTable';
import { TaskBoard } from './TaskBoard';
import { TaskGrid } from './TaskGrid';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskFormModal } from './TaskFormModal';
import { TaskTimeLogModal } from './TaskTimeLogModal';
import { TaskDeleteConfirmModal } from './TaskDeleteConfirmModal';
import { Button } from '../ui';

export default function TaskManager() {
  const {
    tasks = [],
    projects = [],
    loadingStates = {},
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    logTaskTime,
    toggleTaskChecklist,
  } = useData();

  const { currentWorkspace } = useWorkspace();
  const { addToast } = useUI();

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table' | 'grid'

  // Modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToLogTime, setTaskToLogTime] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }

        // Project filter
        if (projectFilter !== 'all') {
          const pId = task.projectId?._id || task.projectId;
          if (pId !== projectFilter) {
            return false;
          }
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title?.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchProject = task.projectId?.name?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchProject;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'priority_desc': {
            const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
            return (weights[b.priority] || 0) - (weights[a.priority] || 0);
          }
          case 'dueDate_asc':
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          case 'loggedHours_desc':
            return (Number(b.loggedHours) || 0) - (Number(a.loggedHours) || 0);
          case 'createdAt_desc':
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  }, [tasks, searchQuery, statusFilter, projectFilter, priorityFilter, sortBy]);

  // Handlers
  const handleOpenCreate = () => {
    if (projects.length === 0) {
      addToast({
        type: 'warning',
        title: 'Project Required',
        message: 'Please initialize at least one project deliverable before creating tasks.',
      });
    }
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit._id, formData);
        if (selectedTask && selectedTask._id === taskToEdit._id) {
          setSelectedTask((prev) => ({ ...prev, ...formData }));
        }
      } else {
        await createTask(formData);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, nextStatus) => {
    try {
      await updateTaskStatus(taskId, nextStatus);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleToggleChecklist = async (taskId, itemId) => {
    try {
      const updatedChecklist = await toggleTaskChecklist(taskId, itemId);
      if (selectedTask && selectedTask._id === taskId && updatedChecklist) {
        setSelectedTask((prev) => ({ ...prev, checklist: updatedChecklist }));
      }
    } catch (err) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  const handleLogTimeSubmit = async (taskId, hours, note) => {
    setActionLoading(true);
    try {
      await logTaskTime(taskId, hours, note);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          loggedHours: (prev.loggedHours || 0) + Number(hours),
          timeLogs: [
            ...(prev.timeLogs || []),
            { hours: Number(hours), note, loggedAt: new Date() },
          ],
        }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async (taskId) => {
    setActionLoading(true);
    try {
      await deleteTask(taskId);
      setTaskToDelete(null);
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      addToast({
        type: 'warning',
        title: 'Export Empty',
        message: 'No task records available to export.',
      });
      return;
    }

    const headers = [
      'Task Title',
      'Parent Project',
      'Status',
      'Priority',
      'Estimated Hours',
      'Logged Hours',
      'Due Date',
      'Checklist Total',
      'Checklist Completed',
      'Created At',
    ];

    const rows = filteredTasks.map((t) => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.projectId?.name || '').replace(/"/g, '""')}"`,
      `"${t.status || 'todo'}"`,
      `"${t.priority || 'medium'}"`,
      Number(t.estimatedHours) || 0,
      Number(t.loggedHours) || 0,
      `"${t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : ''}"`,
      (t.checklist || []).length,
      (t.checklist || []).filter((c) => c.completed).length,
      `"${t.createdAt ? new Date(t.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks-${currentWorkspace?.slug || 'workspace'}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: `Exported ${filteredTasks.length} tasks to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Task Management Module</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
            Sprint Workflows & Task Execution
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Agile backlog management, interactive Kanban boards, subtask checklists, and session time tracking for{' '}
            <span className="font-semibold text-neutral-200">{currentWorkspace?.name || 'Current Workspace'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTasks()}
            disabled={loadingStates.tasks}
            className="text-xs flex items-center gap-1.5 border-neutral-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStates.tasks ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <TaskMetrics tasks={tasks} />

      {/* Filters & View Switcher */}
      <TaskFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        projectFilter={projectFilter}
        onProjectChange={setProjectFilter}
        projects={projects}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewTask={handleOpenCreate}
        onExportCSV={handleExportCSV}
        totalCount={tasks.length}
        filteredCount={filteredTasks.length}
      />

      {/* Main Views: Board, Table, Grid */}
      {viewMode === 'board' && (
        <TaskBoard
          tasks={filteredTasks}
          projects={projects}
          onSelectTask={(t) => setSelectedTask(t)}
          onEditTask={(t) => handleOpenEdit(t)}
          onUpdateStatus={handleUpdateStatus}
          onLogTime={(t) => setTaskToLogTime(t)}
          loading={loadingStates.tasks}
        />
      )}

      {viewMode === 'table' && (
        <TaskTable
          tasks={filteredTasks}
          projects={projects}
          onSelectTask={(t) => setSelectedTask(t)}
          onEditTask={(t) => handleOpenEdit(t)}
          onDeleteTask={(t) => setTaskToDelete(t)}
          onLogTime={(t) => setTaskToLogTime(t)}
          loading={loadingStates.tasks}
        />
      )}

      {viewMode === 'grid' && (
        <TaskGrid
          tasks={filteredTasks}
          projects={projects}
          onSelectTask={(t) => setSelectedTask(t)}
          onEditTask={(t) => handleOpenEdit(t)}
          onDeleteTask={(t) => setTaskToDelete(t)}
          onLogTime={(t) => setTaskToLogTime(t)}
          loading={loadingStates.tasks}
        />
      )}

      {/* Modals */}
      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projects={projects}
        onEdit={(t) => {
          setSelectedTask(null);
          handleOpenEdit(t);
        }}
        onDelete={(t) => {
          setSelectedTask(null);
          setTaskToDelete(t);
        }}
        onUpdateStatus={handleUpdateStatus}
        onToggleChecklist={handleToggleChecklist}
        onLogTime={handleLogTimeSubmit}
      />

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        task={taskToEdit}
        projects={projects}
        loading={actionLoading}
      />

      <TaskTimeLogModal
        isOpen={Boolean(taskToLogTime)}
        onClose={() => setTaskToLogTime(null)}
        onSubmit={handleLogTimeSubmit}
        task={taskToLogTime}
        loading={actionLoading}
      />

      <TaskDeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        task={taskToDelete}
        loading={actionLoading}
      />
    </div>
  );
}
