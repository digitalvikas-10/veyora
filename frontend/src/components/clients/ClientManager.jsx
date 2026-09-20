import React, { useState, useMemo } from 'react';
import { Building2, Users, Plus, RefreshCw, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUI } from '../../context/UIContext';
import { ClientMetrics } from './ClientMetrics';
import { ClientFilters } from './ClientFilters';
import { ClientTable } from './ClientTable';
import { ClientGrid } from './ClientGrid';
import { ClientDetailModal } from './ClientDetailModal';
import { ClientFormModal } from './ClientFormModal';
import { ClientDeleteConfirmModal } from './ClientDeleteConfirmModal';
import { Button } from '../ui';

export default function ClientManager() {
  const {
    clients = [],
    projects = [],
    invoices = [],
    loadingStates = {},
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    createProject,
    createInvoice,
  } = useData();

  const { currentWorkspace } = useWorkspace();
  const { addToast } = useUI();

  // View & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt_desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal States
  const [selectedClient, setSelectedClient] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Extract all distinct tags across current clients
  const availableTags = useMemo(() => {
    const set = new Set();
    clients.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [clients]);

  // Filtered & Sorted Clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        // Status filter
        if (statusFilter !== 'all' && client.status !== statusFilter) {
          return false;
        }

        // Tag filter
        if (tagFilter !== 'all') {
          if (!Array.isArray(client.tags) || !client.tags.includes(tagFilter)) {
            return false;
          }
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = client.name?.toLowerCase().includes(q);
          const matchCompany = client.company?.toLowerCase().includes(q);
          const matchEmail = client.email?.toLowerCase().includes(q);
          const matchPhone = client.phone?.toLowerCase().includes(q);
          return matchName || matchCompany || matchEmail || matchPhone;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'billed_desc':
            return (b.totalBilled || 0) - (a.totalBilled || 0);
          case 'paid_desc':
            return (b.totalPaid || 0) - (a.totalPaid || 0);
          case 'createdAt_desc':
          default:
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
      });
  }, [clients, searchQuery, statusFilter, tagFilter, sortBy]);

  // Handlers
  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (clientToEdit) {
        await updateClient(clientToEdit._id, formData);
        // If editing the currently viewed detail client, update selectedClient
        if (selectedClient && selectedClient._id === clientToEdit._id) {
          setSelectedClient((prev) => ({ ...prev, ...formData }));
        }
      } else {
        await createClient(formData);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async (clientId) => {
    setActionLoading(true);
    try {
      await deleteClient(clientId);
      setClientToDelete(null);
      if (selectedClient && selectedClient._id === clientId) {
        setSelectedClient(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (clients.length === 0) {
      addToast({
        type: 'warning',
        title: 'Export Empty',
        message: 'No client records available to export.',
      });
      return;
    }

    const headers = [
      'Name',
      'Company',
      'Email',
      'Phone',
      'Website',
      'Status',
      'Currency',
      'Total Billed',
      'Total Paid',
      'Portal Access',
      'Tags',
      'Created At',
    ];

    const rows = filteredClients.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.website || '').replace(/"/g, '""')}"`,
      `"${c.status || 'active'}"`,
      `"${c.currency || 'USD'}"`,
      c.totalBilled || 0,
      c.totalPaid || 0,
      c.portalAccess ? 'Yes' : 'No',
      `"${(c.tags || []).join(';')}"`,
      `"${c.createdAt ? new Date(c.createdAt).toISOString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clients-${currentWorkspace?.slug || 'workspace'}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Generated',
      message: `Exported ${filteredClients.length} clients to CSV.`,
    });
  };

  const handleCreateProjectForClient = (client) => {
    addToast({
      type: 'info',
      title: 'Project Builder',
      message: `Navigating to project initialization for ${client.name}.`,
    });
  };

  const handleCreateInvoiceForClient = (client) => {
    addToast({
      type: 'info',
      title: 'Invoice Generator',
      message: `Drafting invoice for ${client.name} (${client.company || 'Direct'}).`,
    });
  };

  const clientProjectsCount = clientToDelete
    ? projects.filter((p) => p.clientId === clientToDelete._id || p.clientId?._id === clientToDelete._id).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Title & Workspace Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Management Module</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 tracking-tight">
            Client Accounts & Relationships
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Isolated multi-tenant client accounts, accounts receivable tracking, contact directory, and portal access control for{' '}
            <span className="font-semibold text-neutral-200">{currentWorkspace?.name || 'Current Workspace'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchClients()}
            disabled={loadingStates.clients}
            className="text-xs flex items-center gap-1.5 border-neutral-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStates.clients ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <ClientMetrics clients={clients} />

      {/* Filters, Search & View Switcher */}
      <ClientFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        tagFilter={tagFilter}
        onTagChange={setTagFilter}
        availableTags={availableTags}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewClient={handleOpenCreate}
        onExportCSV={handleExportCSV}
        totalCount={clients.length}
        filteredCount={filteredClients.length}
      />

      {/* Client List (Table or Grid) */}
      {viewMode === 'table' ? (
        <ClientTable
          clients={filteredClients}
          projects={projects}
          invoices={invoices}
          onSelectClient={(c) => setSelectedClient(c)}
          onEditClient={(c) => handleOpenEdit(c)}
          onDeleteClient={(c) => setClientToDelete(c)}
          onCreateProjectForClient={handleCreateProjectForClient}
          onCreateInvoiceForClient={handleCreateInvoiceForClient}
          loading={loadingStates.clients}
        />
      ) : (
        <ClientGrid
          clients={filteredClients}
          projects={projects}
          invoices={invoices}
          onSelectClient={(c) => setSelectedClient(c)}
          onEditClient={(c) => handleOpenEdit(c)}
          onDeleteClient={(c) => setClientToDelete(c)}
          loading={loadingStates.clients}
        />
      )}

      {/* Detail Slideover / Modal */}
      <ClientDetailModal
        isOpen={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
        client={selectedClient}
        projects={projects}
        invoices={invoices}
        onEdit={(c) => {
          setSelectedClient(null);
          handleOpenEdit(c);
        }}
        onDelete={(c) => {
          setSelectedClient(null);
          setClientToDelete(c);
        }}
        onCreateProject={handleCreateProjectForClient}
        onCreateInvoice={handleCreateInvoiceForClient}
      />

      {/* Create / Edit Client Modal */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setClientToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        client={clientToEdit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ClientDeleteConfirmModal
        isOpen={Boolean(clientToDelete)}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDeleteConfirm}
        client={clientToDelete}
        projectsCount={clientProjectsCount}
        loading={actionLoading}
      />
    </div>
  );
}
