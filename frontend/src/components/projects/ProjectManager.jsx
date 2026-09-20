import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUI } from '../../context/UIContext';
import { ProjectMetrics } from './ProjectMetrics';
import { ProjectFilters } from './ProjectFilters';
import { ProjectTable } from './ProjectTable';
import { ProjectBoard } from './ProjectBoard';
import { ProjectGrid } from './ProjectGrid';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectDeleteConfirmModal } from './ProjectDeleteConfirmModal';
import { Button } from '../ui';

export default function ProjectManager() {
  const {
    projects = [],
    clients = [],
    tasks = [],
    invoices = [],
    loadingStates = {},
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    createTask,
  } = useData();

  const { currentWorkspace } = useWorkspace();
  const { addToast } = useUI();

  // View & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'table' | 'grid'

  // Modal States
  const [selectedProject, setSelectedProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Status filter
        if (statusFilter !== 'all' && project.status !== statusFilter) {
          return false;
        }

        // Client filter
        if (clientFilter !== 'all') {
          const cId = project.clientId?._id || project.clientId;
          if (cId !== clientFilter) {
            return false;
          }
        }

        // Priority filter
        if (priorityFilter !== 'all' && project.priority !== priorityFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = project.name?.toLowerCase().includes(q);
          const matchCode = project.code?.toLowerCase().includes(q);
          const matchDesc = project.description?.toLowerCase().includes(q);
          const matchClient = project.clientId?.name?.toLowerCase().includes(q) ||
            project.clientId?.company?.toLowerCase().includes(q);
          return matchName || matchCode || matchDesc || matchClient;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'budget_desc':
            return (Number(b.budget) || 0) - (Number(a.budget) || 0);
          case 'progress_desc':
            return (Number(b.progressPercent) || 0) - (Number(a.progressPercent) || 0);
          case 'targetDate_asc':
            if (!a.targetDate) return 1;
            if (!b.targetDate) return -1;
            return new Date(a.targetDate) - new Date(b.targetDate);
          case 'createdAt_desc':
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  }, [projects, searchQuery, statusFilter, clientFilter, priorityFilter, sortBy]);

  // Handlers
  const handleOpenCreate = () => {
    if (clients.length === 0) {
      addToast({
        type: 'warning',
        title: 'Client Required',
        message: 'Please register at least one client before initializing projects.',
      });
    }
    setProjectToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project) => {
    setProjectToEdit(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (projectToEdit) {
        await updateProject(projectToEdit._id, formData);
        if (selectedProject && selectedProject._id === projectToEdit._id) {
          setSelectedProject((prev) => ({ ...prev, ...formData }));
        }
      } else {
        await createProject(formData);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAdvance = async (projectId, nextStatus) => {
    try {
      await updateProject(projectId, { status: nextStatus });
    } catch (err) {
      console.error('Failed to advance project status:', err);
    }
  };

  const handleDeleteConfirm = async (projectId) => {
    setActionLoading(true);
    try {
      await deleteProject(projectId);
      setProjectToDelete(null);
      if (selectedProject && selectedProject._id === projectId) {
        setSelectedProject(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTaskForProject = async (project) => {
    const taskTitle = prompt(`Enter new sprint task title for "${project.name}":`);
    if (!taskTitle || !taskTitle.trim()) return;

    try {
      await createTask({
        projectId: project._id,
        title: taskTitle.trim(),
        status: 'todo',
        priority: 'medium',
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleExportCSV = () => {
    if (projects.length === 0) {
      addToast({
        type: 'warning',
        title: 'Export Empty',
        message: 'No project records available to export.',
      });
      return;
    }

    const headers = [
      'Project Code',
      'Project Name',
      'Client Name',
      'Client Company',
      'Status',
      'Priority',
      'Budget',
      'Currency',
      'Progress %',
      'Start Date',
      'Target Date',
      'Tags',
      'Created At',
    ];

    const rows = filteredProjects.map((p) => [
      `"${(p.code || '').replace(/"/g, '""')}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.clientId?.name || '').replace(/"/g, '""')}"`,
      `"${(p.clientId?.company || '').replace(/"/g, '""')}"`,
      `"${p.status || 'planning'}"`,
      `"${p.priority || 'medium'}"`,
      Number(p.budget) || 0,
      `"${p.currency || 'USD'}"`,
      Number(p.progressPercent) || 0,
      `"${p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : ''}"`,
      `"${p.targetDate ? new Date(p.targetDate).toISOString().slice(0, 10) : ''}"`,
      `"${(p.tags || []).join(';')}"`,
      `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `projects-${currentWorkspace?.slug || 'workspace'}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: `Exported ${filteredProjects.length} projects to CSV.`,
    });
  };

  const projectTasksCount = projectToDelete
    ? tasks.filter((t) => t.projectId === projectToDelete._id || t.projectId?._id === projectToDelete._id).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Project Management Module</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
            Project Deliverables & Sprint Delivery
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            End-to-end client projects, milestone scheduling, committed budgets, sprint workflow tracking, and cascade safeguards for{' '}
            <span className="font-semibold text-neutral-200">{currentWorkspace?.name || 'Current Workspace'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchProjects()}
            disabled={loadingStates.projects}
            className="text-xs flex items-center gap-1.5 border-neutral-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStates.projects ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <ProjectMetrics projects={projects} />

      {/* Filters, Search & View Switcher */}
      <ProjectFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        clientFilter={clientFilter}
        onClientChange={setClientFilter}
        clients={clients}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewProject={handleOpenCreate}
        onExportCSV={handleExportCSV}
        totalCount={projects.length}
        filteredCount={filteredProjects.length}
      />

      {/* Main View: Board, Table, or Grid */}
      {viewMode === 'board' && (
        <ProjectBoard
          projects={filteredProjects}
          tasks={tasks}
          onSelectProject={(p) => setSelectedProject(p)}
          onEditProject={(p) => handleOpenEdit(p)}
          onUpdateStatus={handleStatusAdvance}
          loading={loadingStates.projects}
        />
      )}

      {viewMode === 'table' && (
        <ProjectTable
          projects={filteredProjects}
          tasks={tasks}
          onSelectProject={(p) => setSelectedProject(p)}
          onEditProject={(p) => handleOpenEdit(p)}
          onDeleteProject={(p) => setProjectToDelete(p)}
          onCreateTaskForProject={handleCreateTaskForProject}
          loading={loadingStates.projects}
        />
      )}

      {viewMode === 'grid' && (
        <ProjectGrid
          projects={filteredProjects}
          tasks={tasks}
          onSelectProject={(p) => setSelectedProject(p)}
          onEditProject={(p) => handleOpenEdit(p)}
          onDeleteProject={(p) => setProjectToDelete(p)}
          onCreateTaskForProject={handleCreateTaskForProject}
          loading={loadingStates.projects}
        />
      )}

      {/* Modals */}
      <ProjectDetailModal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        project={selectedProject}
        tasks={tasks}
        invoices={invoices}
        onEdit={(p) => {
          setSelectedProject(null);
          handleOpenEdit(p);
        }}
        onDelete={(p) => {
          setSelectedProject(null);
          setProjectToDelete(p);
        }}
        onCreateTask={handleCreateTaskForProject}
      />

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        project={projectToEdit}
        clients={clients}
        loading={actionLoading}
      />

      <ProjectDeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        project={projectToDelete}
        tasksCount={projectTasksCount}
        loading={actionLoading}
      />
    </div>
  );
}
