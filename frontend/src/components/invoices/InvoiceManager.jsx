import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import InvoiceMetrics from './InvoiceMetrics';
import InvoiceFilterBar from './InvoiceFilterBar';
import InvoiceCard from './InvoiceCard';
import InvoiceTable from './InvoiceTable';
import InvoiceFormModal from './InvoiceFormModal';
import InvoicePreviewModal from './InvoicePreviewModal';
import InvoicePaymentModal from './InvoicePaymentModal';
import InvoiceSendModal from './InvoiceSendModal';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Sparkles,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function InvoiceManager() {
  const {
    invoices = [],
    clients = [],
    projects = [],
    proposals = [],
    billingSummary = null,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    sendInvoice,
    recordInvoicePayment,
    deleteInvoice,
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
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);

  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendInvoiceTarget, setSendInvoiceTarget] = useState(null);

  const isLoading = loadingStates?.invoices;

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'overdue') {
            const isDuePast = inv.dueDate && new Date(inv.dueDate) < new Date() && (inv.balanceDue || 0) > 0 && inv.status !== 'draft';
            if (inv.status !== 'overdue' && !isDuePast) return false;
          } else if (inv.status !== statusFilter) {
            return false;
          }
        }

        // Client filter
        if (clientFilter !== 'all') {
          const invClientId = inv.clientId?._id || inv.clientId;
          if (invClientId !== clientFilter) return false;
        }

        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const numMatch = inv.invoiceNumber?.toLowerCase().includes(q);
          const notesMatch = inv.notes?.toLowerCase().includes(q);
          const clientMatch =
            inv.clientId?.name?.toLowerCase().includes(q) ||
            inv.clientId?.company?.toLowerCase().includes(q);
          const lineItemsMatch = inv.lineItems?.some((item) =>
            item.description?.toLowerCase().includes(q)
          );
          if (!numMatch && !notesMatch && !clientMatch && !lineItemsMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || b.issueDate || 0) - new Date(a.createdAt || a.issueDate || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || a.issueDate || 0) - new Date(b.createdAt || b.issueDate || 0);
        }
        if (sortBy === 'due-soon') {
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        }
        if (sortBy === 'amount-high') {
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        }
        if (sortBy === 'amount-low') {
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        }
        return 0;
      });
  }, [invoices, statusFilter, clientFilter, search, sortBy]);

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInvoice(inv);
    setIsFormOpen(true);
  };

  const handleOpenPreview = (inv) => {
    setPreviewInvoice(inv);
    setIsPreviewOpen(true);
  };

  const handleOpenPayment = (inv) => {
    setPaymentInvoice(inv);
    setIsPaymentOpen(true);
  };

  const handleOpenSend = (inv) => {
    setSendInvoiceTarget(inv);
    setIsSendOpen(true);
  };

  const handleFormSubmit = async (data) => {
    if (editingInvoice) {
      await updateInvoice(editingInvoice._id, data);
    } else {
      await createInvoice(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  // Sample Invoice Generator Helper
  const handleCreateSampleInvoice = async () => {
    if (!clients.length) return;
    const sampleClient = clients[0];
    const sampleProject =
      projects.find((p) => (p.clientId?._id || p.clientId) === sampleClient._id) ||
      projects[0];

    const due = new Date();
    due.setDate(due.getDate() + 14);

    const sample = {
      clientId: sampleClient._id,
      projectId: sampleProject?._id || undefined,
      status: 'sent',
      currency: 'USD',
      issueDate: new Date().toISOString(),
      dueDate: due.toISOString(),
      paymentMethod: 'stripe',
      lineItems: [
        { description: 'Full-Stack Architecture & Microservices Implementation', quantity: 1, unitPrice: 3800 },
        { description: 'Enterprise UI Components & Responsive Theme Delivery', quantity: 1, unitPrice: 2400 },
        { description: 'Automated CI/CD Deployment Pipeline & Security Audit', quantity: 1, unitPrice: 1200 },
      ],
      discount: 400,
      taxRate: 5,
      notes: 'Net 14 settlement terms. Remittance instructions: remit payment to VEYORA Operations account or via Stripe card checkout.',
    };

    await createInvoice(sample);
  };

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-100">
                Invoice & Billing Operations
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Generate itemized customer invoices, calculate taxes and discounts, dispatch billing notices, record multi-gateway payment settlements, and monitor overdue receivables.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={() => fetchInvoices()}
              disabled={isLoading}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
              title="Refresh Invoices"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics & Billing KPIs */}
      <InvoiceMetrics invoices={invoices} billingSummary={billingSummary} />

      {/* Filter & Search Bar */}
      <InvoiceFilterBar
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

      {/* Main Invoice List Content */}
      {isLoading && invoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 text-sm flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Loading workspace invoices & receivables...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mx-auto text-neutral-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-200">
              {search || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'No matching invoices found'
                : 'No invoices issued yet'}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              {search || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'Try adjusting your search criteria, clearing active filters, or changing the selected status.'
                : 'Create your first invoice to bill clients, itemize deliverables, and collect payments.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue First Invoice</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onSend={handleOpenSend}
              onRecordPayment={handleOpenPayment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <InvoiceTable
          invoices={filteredInvoices}
          onPreview={handleOpenPreview}
          onEdit={handleOpenEdit}
          onSend={handleOpenSend}
          onRecordPayment={handleOpenPayment}
          onDelete={handleDelete}
        />
      )}

      {/* Modals & Dialogs */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingInvoice}
        clients={clients}
        projects={projects}
        proposals={proposals}
      />

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewInvoice(null);
        }}
        invoice={previewInvoice}
        onSend={handleOpenSend}
        onRecordPayment={handleOpenPayment}
      />

      <InvoicePaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setPaymentInvoice(null);
        }}
        invoice={paymentInvoice}
        onRecordPayment={recordInvoicePayment}
      />

      <InvoiceSendModal
        isOpen={isSendOpen}
        onClose={() => {
          setIsSendOpen(false);
          setSendInvoiceTarget(null);
        }}
        invoice={sendInvoiceTarget}
        onSend={sendInvoice}
      />
    </div>
  );
}
