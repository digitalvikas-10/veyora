import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import DocumentMetrics from './DocumentMetrics';
import DocumentFilterBar from './DocumentFilterBar';
import DocumentCard from './DocumentCard';
import DocumentTable from './DocumentTable';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentEditModal from './DocumentEditModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import {
  FolderArchive,
  Upload,
  Plus,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
} from 'lucide-react';

export default function DocumentManager() {
  const {
    documents = [],
    documentStats = null,
    clients = [],
    projects = [],
    fetchDocuments,
    fetchDocumentStats,
    createDocument,
    uploadDocumentFile,
    updateDocument,
    deleteDocument,
    loadingStates,
  } = useData();

  // Filters and views
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  const isLoading = loadingStates?.documents;

  // Filtered and Sorted Documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Category filter
        if (categoryFilter !== 'all' && doc.category !== categoryFilter) {
          return false;
        }

        // Client filter
        if (clientFilter !== 'all') {
          const docClientId = doc.clientId?._id || doc.clientId;
          if (docClientId !== clientFilter) return false;
        }

        // Project filter
        if (projectFilter !== 'all') {
          const docProjectId = doc.projectId?._id || doc.projectId;
          if (docProjectId !== projectFilter) return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const titleMatch = doc.title?.toLowerCase().includes(q);
          const nameMatch = doc.fileName?.toLowerCase().includes(q);
          const clientMatch =
            doc.clientId?.name?.toLowerCase().includes(q) ||
            doc.clientId?.company?.toLowerCase().includes(q);
          const projectMatch =
            doc.projectId?.name?.toLowerCase().includes(q) ||
            doc.projectId?.code?.toLowerCase().includes(q);

          if (!titleMatch && !nameMatch && !clientMatch && !projectMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'size-large') {
          return (b.fileSize || 0) - (a.fileSize || 0);
        }
        if (sortBy === 'size-small') {
          return (a.fileSize || 0) - (b.fileSize || 0);
        }
        if (sortBy === 'title-az') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [documents, categoryFilter, clientFilter, projectFilter, search, sortBy]);

  // Modal Handlers
  const handleOpenUpload = () => {
    setIsUploadOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDocument(doc);
    setIsEditOpen(true);
  };

  const handleOpenPreview = (doc) => {
    setPreviewDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this document asset?')) {
      await deleteDocument(id);
    }
  };

  // Sample Documents Generator Helper
  const handleCreateSampleDocuments = async () => {
    if (!clients.length) return;
    const client = clients[0];
    const project =
      projects.find((p) => (p.clientId?._id || p.clientId) === client._id) ||
      projects[0];

    const samples = [
      {
        title: 'Master Services Agreement & NDA (Signed)',
        fileName: 'MSA_Agreement_2026_Final.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 142850,
        mimeType: 'application/pdf',
        category: 'contract',
        clientId: client._id,
        projectId: project?._id,
      },
      {
        title: 'Figma Design System UI Component Kit',
        fileName: 'design-system-tokens-v3.fig',
        fileUrl: 'https://www.figma.com/@designsystem_veyora',
        fileSize: 4890000,
        mimeType: 'application/octet-stream',
        category: 'design',
        clientId: client._id,
        projectId: project?._id,
      },
      {
        title: 'Frontend Production Build & Asset Bundle',
        fileName: 'release_v1_dist.zip',
        fileUrl: 'https://github.com/veyora/client-releases',
        fileSize: 12450000,
        mimeType: 'application/zip',
        category: 'deliverable',
        clientId: client._id,
        projectId: project?._id,
      },
      {
        title: 'Technical Specification & Architecture Brief',
        fileName: 'Technical_Spec_Architecture.pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileSize: 840000,
        mimeType: 'application/pdf',
        category: 'brief',
        clientId: client._id,
        projectId: project?._id,
      },
    ];

    for (const sample of samples) {
      await createDocument(sample);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FolderArchive className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-100">
                Document & Asset Management
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Centralized repository for client deliverables, signed legal contracts, UI design assets, technical briefs, and external cloud resources with granular permission enforcement and storage tracking.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => {
                fetchDocuments();
                fetchDocumentStats();
              }}
              disabled={isLoading}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Refresh Assets"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenUpload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Storage & Category KPIs */}
      <DocumentMetrics documents={documents} stats={documentStats} />

      {/* Filter Bar */}
      <DocumentFilterBar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        clientFilter={clientFilter}
        setClientFilter={setClientFilter}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        clients={clients}
        projects={projects}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenUpload={handleOpenUpload}
      />

      {/* Document Library Content */}
      {isLoading && documents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-sm flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Loading workspace documents and asset vault...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-200">
              {search || categoryFilter !== 'all' || clientFilter !== 'all' || projectFilter !== 'all'
                ? 'No matching documents found'
                : 'No documents uploaded yet'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {search || categoryFilter !== 'all' || clientFilter !== 'all' || projectFilter !== 'all'
                ? 'Try adjusting your search keywords, category filter, or assigned client filters.'
                : 'Upload deliverables, contracts, design mockups, and resource links to keep your workspace organized.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenUpload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload First Document</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={filteredDocuments}
          onPreview={handleOpenPreview}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadFile={uploadDocumentFile}
        onCreateUrlDocument={createDocument}
        clients={clients}
        projects={projects}
      />

      <DocumentEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingDocument(null);
        }}
        document={editingDocument}
        onUpdate={updateDocument}
        clients={clients}
        projects={projects}
      />

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDocument(null);
        }}
        document={previewDocument}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
