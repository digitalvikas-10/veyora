import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink, 
  Eye, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  FolderKanban, 
  FileText, 
  MapPin,
  Clock
} from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../ui';

export const ClientGrid = ({
  clients = [],
  projects = [],
  invoices = [],
  onSelectClient,
  onEditClient,
  onDeleteClient,
  loading = false,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">Active</Badge>;
      case 'lead':
        return <Badge variant="warning" size="sm">Lead</Badge>;
      case 'inactive':
        return <Badge variant="neutral" size="sm">Inactive</Badge>;
      case 'archived':
        return <Badge variant="error" size="sm">Archived</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const formatCurrency = (val, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-5 animate-pulse bg-neutral-900/40 border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="space-y-1.5 flex-1">
                <div className="w-24 h-3 bg-neutral-800 rounded-sm" />
                <div className="w-32 h-2.5 bg-neutral-800 rounded-sm" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2">
              <div className="w-full h-3 bg-neutral-800 rounded-sm" />
              <div className="w-2/3 h-3 bg-neutral-800 rounded-sm" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <Card className="p-12 text-center bg-neutral-900/40 border-neutral-800 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-700">
          <Building2 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-neutral-200">No client accounts found</h4>
        <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
          No clients match your filter criteria. Try clearing search filters or add your first client account.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {clients.map((client) => {
        const clientProjects = projects.filter((p) => p.clientId === client._id || p.clientId?._id === client._id);
        const clientInvoices = invoices.filter((inv) => inv.clientId === client._id || inv.clientId?._id === client._id);
        const totalBilled = client.totalBilled || clientInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
        const totalPaid = client.totalPaid || clientInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
        const balanceDue = Math.max(0, totalBilled - totalPaid);

        return (
          <Card
            key={client._id}
            className="p-5 flex flex-col justify-between hover:border-neutral-700 transition cursor-pointer group bg-neutral-900/80"
            onClick={() => onSelectClient(client)}
          >
            <div>
              {/* Header: Avatar, Name, Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={client.company || client.name}
                    src={client.avatar}
                    size="lg"
                    className="bg-neutral-800 text-indigo-400 border border-neutral-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-100 group-hover:text-indigo-300 transition truncate">
                      {client.name}
                    </h4>
                    {client.company && (
                      <p className="text-xs text-neutral-400 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-neutral-500 shrink-0" />
                        {client.company}
                      </p>
                    )}
                  </div>
                </div>
                <div>{getStatusBadge(client.status)}</div>
              </div>

              {/* Contact rows */}
              <div className="mt-4 space-y-1.5 text-xs text-neutral-400">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address?.city && (
                  <div className="flex items-center gap-2 truncate text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {client.address.city}, {client.address.state || client.address.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {client.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded-md text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700/60"
                    >
                      #{tag}
                    </span>
                  ))}
                  {client.tags.length > 3 && (
                    <span className="text-[10px] text-neutral-500 self-center">
                      +{client.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer metrics & actions */}
            <div className="mt-4 pt-3.5 border-t border-neutral-800">
              {/* Financial & Project summary */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 block uppercase">Billed</span>
                  <span className="font-semibold text-neutral-200">
                    {formatCurrency(totalBilled, client.currency)}
                  </span>
                </div>
                <div className="bg-neutral-950/60 p-2 rounded-lg border border-neutral-800/60">
                  <span className="text-[10px] text-neutral-500 block uppercase">Balance</span>
                  <span className={`font-semibold ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {balanceDue > 0 ? formatCurrency(balanceDue, client.currency) : 'Settled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <FolderKanban className="w-3.5 h-3.5 text-neutral-500" />
                    {clientProjects.length} Projects
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectClient(client)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-1 rounded-md text-neutral-400 hover:text-indigo-300 hover:bg-neutral-800 transition"
                    title="Edit Client"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteClient(client)}
                    className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                    title="Delete Client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
