import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import ProposalMetrics from './ProposalMetrics';
import ProposalFilterBar from './ProposalFilterBar';
import ProposalCard from './ProposalCard';
import ProposalTable from './ProposalTable';
import ProposalFormModal from './ProposalFormModal';
import ProposalPreviewModal from './ProposalPreviewModal';
import ProposalSignModal from './ProposalSignModal';
import ProposalSendModal from './ProposalSendModal';
import {
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ProposalManager() {
  const {
    proposals = [],
    clients = [],
    projects = [],
    fetchProposals,
    createProposal,
    updateProposal,
    sendProposal,
    signProposal,
    deleteProposal,
    loadingStates,
  } = useData();

  // Filters and views
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState(null);

  const [isSignOpen, setIsSignOpen] = useState(false);
  const [signTarget, setSignTarget] = useState(null);

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState(null);

  const isLoading = loadingStates?.proposals;

  // Filtered & Sorted proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((prop) => {
      // Status filter
      if (statusFilter !== 'all' && prop.status !== statusFilter) {
        return false;
      }

      // Client filter
      if (clientFilter !== 'all') {
        const propClientId = prop.clientId?._id || prop.clientId;
        if (propClientId !== clientFilter) return false;
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase();
        const numMatch = prop.proposalNumber?.toLowerCase().includes(q);
        const titleMatch = prop.title?.toLowerCase().includes(q);
        const clientMatch = prop.clientId?.name?.toLowerCase().includes(q) ||
          prop.clientId?.company?.toLowerCase().includes(q);
        if (!numMatch && !titleMatch && !clientMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.issueDate || 0) - new Date(a.createdAt || a.issueDate || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.issueDate || 0) - new Date(b.createdAt || b.issueDate || 0);
      }
      if (sortBy === 'amount-high') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      if (sortBy === 'amount-low') {
        return (a.totalAmount || 0) - (b.totalAmount || 0);
      }
      return 0;
    });
  }, [proposals, statusFilter, clientFilter, search, sortBy]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingProposal(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prop) => {
    setEditingProposal(prop);
    setIsFormOpen(true);
  };

  const handleOpenPreview = (prop) => {
    setPreviewProposal(prop);
    setIsPreviewOpen(true);
  };

  const handleOpenSign = (prop) => {
    setSignTarget(prop);
    setIsSignOpen(true);
  };

  const handleOpenSend = (prop) => {
    setSendTarget(prop);
    setIsSendOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (editingProposal) {
      await updateProposal(editingProposal._id, data);
    } else {
      await createProposal(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this proposal?')) {
      await deleteProposal(id);
    }
  };

  // Seed initial sample proposal helper
  const handleCreateSampleProposal = async () => {
    if (!clients.length) return;
    const sampleClient = clients[0];
    const sampleProject = projects.find((p) => (p.clientId?._id || p.clientId) === sampleClient._id) || projects[0];

    const sample = {
      clientId: sampleClient._id,
      projectId: sampleProject?._id || undefined,
      title: 'Global Cloud Architecture & React UI Deliverable',
      status: 'draft',
      currency: 'USD',
      lineItems: [
        { description: 'Multi-Tenant Backend Architecture & Microservices', quantity: 1, unitPrice: 4500 },
        { description: 'Tailwind React Frontend Design System Implementation', quantity: 1, unitPrice: 3800 },
        { description: 'E-Signature Legal Flow & Automated PDF Generation Engine', quantity: 1, unitPrice: 1700 },
      ],
      discount: 500,
      taxRate: 5,
      notes: 'Deliverables include production-ready Docker containers, comprehensive API documentation, and sprint milestone delivery.',
      terms: 'Payment terms: 50% upon contract signing, 50% upon final release.',
    };

    await createProposal(sample);
  };

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-100">
                Proposal & Contract Management
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Create statements of work, itemized deliverable quotes, live financial recalculations, client dispatch links, and legally binding digital e-signature acceptance workflows.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => fetchProposals()}
              disabled={isLoading}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Refresh Proposals"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Proposal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial & Lifecycle Metrics */}
      <ProposalMetrics proposals={proposals} />

      {/* Search & Filter Toolbar */}
      <ProposalFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        clients={clients}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenCreate={handleOpenCreate}
      />

      {/* Main Proposal Content Listing */}
      {isLoading && proposals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-sm flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Loading workspace proposals...</span>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-200">
              {search || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'No matching proposals found'
                : 'No proposals drafted yet'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {search || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'Try adjusting your search filters or status selection to view other contracts.'
                : 'Formulate deliverable scopes, calculate line items, and generate signed contracts for your clients.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft First Proposal</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={proposal}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onSend={handleOpenSend}
              onSign={handleOpenSign}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <ProposalTable
          proposals={filteredProposals}
          onPreview={handleOpenPreview}
          onEdit={handleOpenEdit}
          onSend={handleOpenSend}
          onSign={handleOpenSign}
          onDelete={handleDelete}
        />
      )}

      {/* Modals & Portals */}
      <ProposalFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProposal(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProposal}
        clients={clients}
        projects={projects}
      />

      <ProposalPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewProposal(null);
        }}
        proposal={previewProposal}
        onSend={handleOpenSend}
        onSign={handleOpenSign}
      />

      <ProposalSignModal
        isOpen={isSignOpen}
        onClose={() => {
          setIsSignOpen(false);
          setSignTarget(null);
        }}
        proposal={signTarget}
        onSign={signProposal}
      />

      <ProposalSendModal
        isOpen={isSendOpen}
        onClose={() => {
          setIsSendOpen(false);
          setSendTarget(null);
        }}
        proposal={sendTarget}
        onSend={sendProposal}
      />
    </div>
  );
}
