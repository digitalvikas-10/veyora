import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  DollarSign, 
  FolderKanban, 
  FileText, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  Plus, 
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Modal, Button, Badge, Avatar, Card } from '../ui';

export const ClientDetailModal = ({
  isOpen,
  onClose,
  client,
  projects = [],
  invoices = [],
  onEdit,
  onDelete,
  onCreateProject,
  onCreateInvoice,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !client) return null;

  const clientProjects = projects.filter(
    (p) => p.clientId === client._id || p.clientId?._id === client._id
  );
  const clientInvoices = invoices.filter(
    (inv) => inv.clientId === client._id || inv.clientId?._id === client._id
  );

  const totalBilled = client.totalBilled || clientInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalPaid = client.totalPaid || clientInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const balanceDue = Math.max(0, totalBilled - totalPaid);

  const formatCurrency = (val, currency = client.currency || 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active Retainer</Badge>;
      case 'lead':
        return <Badge variant="warning">Lead Pipeline</Badge>;
      case 'inactive':
        return <Badge variant="neutral">Inactive Account</Badge>;
      case 'archived':
        return <Badge variant="error">Archived</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const TABS = [
    { id: 'overview', label: 'Client Overview' },
    { id: 'projects', label: `Projects (${clientProjects.length})` },
    { id: 'invoices', label: `Invoices (${clientInvoices.length})` },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={null}
      size="xl"
      className="p-0 overflow-hidden bg-neutral-900 border border-neutral-800"
    >
      {/* Modal Custom Header */}
      <div className="p-6 border-b border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={client.company || client.name}
            src={client.avatar}
            size="xl"
            className="bg-neutral-800 text-indigo-400 border border-neutral-700 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl font-bold text-neutral-100">{client.name}</h3>
              {getStatusBadge(client.status)}
              {client.portalAccess && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Portal Enabled
                </span>
              )}
            </div>
            {client.company && (
              <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-medium text-neutral-300">{client.company}</span>
              </p>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onEdit(client);
            }}
            className="text-xs flex items-center gap-1 border-neutral-700"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onDelete(client);
            }}
            className="text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-neutral-800 px-6 bg-neutral-900">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-medium border-b-2 transition ${
                isSelected
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Modal Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Lifetime Billed
                </span>
                <span className="text-lg font-bold text-neutral-100 mt-1 block">
                  {formatCurrency(totalBilled, client.currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Settled Collections
                </span>
                <span className="text-lg font-bold text-emerald-400 mt-1 block">
                  {formatCurrency(totalPaid, client.currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800">
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                  Outstanding Balance
                </span>
                <span className={`text-lg font-bold mt-1 block ${balanceDue > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                  {balanceDue > 0 ? formatCurrency(balanceDue, client.currency) : 'None ($0)'}
                </span>
              </div>
            </div>

            {/* Contact & Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
                    <a href={`mailto:${client.email}`} className="text-indigo-400 hover:underline">
                      {client.email}
                    </a>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                      <a href={`tel:${client.phone}`} className="text-neutral-300 hover:underline">
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-neutral-500 shrink-0" />
                      <a
                        href={client.website.startsWith('http') ? client.website : `https://${client.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-300 hover:text-indigo-400 flex items-center gap-1 truncate"
                      >
                        {client.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="text-neutral-300">
                      Billing Currency: <span className="font-mono font-semibold">{client.currency || 'USD'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Billing & Physical Address
                </h4>
                <div className="text-xs text-neutral-300 space-y-1">
                  {client.address?.street ? (
                    <>
                      <p>{client.address.street}</p>
                      <p>
                        {[client.address.city, client.address.state, client.address.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-neutral-400">{client.address.country || 'USA'}</p>
                    </>
                  ) : (
                    <p className="text-neutral-500 italic">No address on file.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tags & Internal Notes */}
            <div className="space-y-3">
              {client.tags && client.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-2">
                    Client Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {client.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-xs bg-neutral-800 text-neutral-300 border border-neutral-700"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800">
                  <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider mb-1.5">
                    Internal Account Notes
                  </h4>
                  <p className="text-xs text-neutral-400 whitespace-pre-wrap leading-relaxed">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Fast Trigger Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateProject(client)}
                className="text-xs flex items-center gap-1.5 border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create Project for {client.name}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateInvoice(client)}
                className="text-xs flex items-center gap-1.5 border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Issue Invoice to {client.name}</span>
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-neutral-300">
                Active & Archived Deliverables ({clientProjects.length})
              </h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreateProject(client)}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Button>
            </div>

            {clientProjects.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-neutral-950/40 border border-neutral-800">
                <FolderKanban className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">No projects currently linked to this client.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientProjects.map((p) => (
                  <div
                    key={p._id}
                    className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-100 text-xs">{p.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400">
                          {p.projectCode || 'PROJ'}
                        </span>
                        <Badge variant={p.status === 'active' ? 'success' : 'neutral'} size="sm">
                          {p.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-3">
                        <span>Budget: {formatCurrency(p.budget?.totalBudget || p.budget)}</span>
                        <span>Priority: {p.priority}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-48">
                      <div className="flex-1 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${p.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-neutral-300 shrink-0">
                        {p.progressPercent || 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVOICES */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-neutral-300">
                Billing Invoices ({clientInvoices.length})
              </h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onCreateInvoice(client)}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Invoice</span>
              </Button>
            </div>

            {clientInvoices.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-neutral-950/40 border border-neutral-800">
                <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">No invoices issued for this client yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv._id}
                    className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-100 font-mono">
                          {inv.invoiceNumber}
                        </span>
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'success'
                              : inv.status === 'overdue'
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        Due Date: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-neutral-100">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Paid: <span className="text-emerald-400">{formatCurrency(inv.amountPaid, inv.currency)}</span>
                        {inv.balanceDue > 0 && (
                          <span className="text-amber-400 ml-1">
                            (Due: {formatCurrency(inv.balanceDue, inv.currency)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex justify-end">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Close Profile
        </Button>
      </div>
    </Modal>
  );
};
