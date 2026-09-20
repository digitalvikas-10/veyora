import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink, 
  Eye, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  FolderKanban, 
  FileText, 
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../ui';

export const ClientTable = ({
  clients = [],
  projects = [],
  invoices = [],
  onSelectClient,
  onEditClient,
  onDeleteClient,
  onCreateProjectForClient,
  onCreateInvoiceForClient,
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
      <Card className="p-8 text-center bg-neutral-900/60 border-neutral-800">
        <div className="w-8 h-8 mx-auto border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 mt-3">Loading tenant client accounts...</p>
      </Card>
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
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/80 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Client & Company</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Projects</th>
            <th className="py-3 px-4">Lifetime Billed</th>
            <th className="py-3 px-4">Paid / Balance</th>
            <th className="py-3 px-4">Portal Access</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {clients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client._id || p.clientId?._id === client._id);
            const clientInvoices = invoices.filter((inv) => inv.clientId === client._id || inv.clientId?._id === client._id);
            const totalBilled = client.totalBilled || clientInvoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
            const totalPaid = client.totalPaid || clientInvoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
            const balanceDue = Math.max(0, totalBilled - totalPaid);

            return (
              <tr
                key={client._id}
                className="hover:bg-neutral-800/40 transition group cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                {/* Client & Company */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={client.company || client.name}
                      src={client.avatar}
                      size="md"
                      className="bg-neutral-800 text-indigo-400 border border-neutral-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-100 group-hover:text-indigo-300 transition truncate">
                        <span>{client.name}</span>
                        {client.company && (
                          <span className="text-neutral-400 font-normal">
                            ({client.company})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 text-neutral-500 shrink-0" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="hidden sm:flex items-center gap-1 text-neutral-500">
                            • <Phone className="w-3 h-3 shrink-0" /> {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {getStatusBadge(client.status)}
                </td>

                {/* Projects */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <FolderKanban className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{clientProjects.length} active</span>
                  </div>
                </td>

                {/* Lifetime Billed */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="font-semibold text-neutral-200">
                    {formatCurrency(totalBilled, client.currency)}
                  </div>
                </td>

                {/* Paid / Balance */}
                <td className="py-3 px-4 whitespace-nowrap">
                  <div>
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(totalPaid, client.currency)}
                    </span>
                    {balanceDue > 0 ? (
                      <span className="text-[11px] text-amber-400 block font-mono">
                        Due: {formatCurrency(balanceDue, client.currency)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 block">Settled</span>
                    )}
                  </div>
                </td>

                {/* Portal Access */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {client.portalAccess ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Active Portal
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500">Disabled</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onSelectClient(client)}
                      title="View Details"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditClient(client)}
                      title="Edit Client"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-indigo-400 hover:bg-neutral-800 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(client)}
                      title="Delete Client"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
