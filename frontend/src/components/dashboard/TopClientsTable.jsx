import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Avatar } from '../ui';
import { ExternalLink, Building2, ShieldCheck } from 'lucide-react';

export const TopClientsTable = ({ clients = [], loading = false, onSelectClient }) => {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-top-clients-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-100 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Top Client Accounts
          </CardTitle>
          <Badge variant="outline" size="sm">
            Ranked by Lifetime Revenue
          </Badge>
        </div>
        <CardDescription className="text-xs text-neutral-400 mt-0.5">
          High-value contracts driving workspace revenue and operational capacity
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-900/40 border border-neutral-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No client accounts registered yet in this workspace.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] text-neutral-400 uppercase tracking-wider">
                  <th className="pb-2 font-medium">Client / Organization</th>
                  <th className="pb-2 font-medium">Tier</th>
                  <th className="pb-2 font-medium text-center">Projects</th>
                  <th className="pb-2 font-medium text-right">Total Billed</th>
                  <th className="pb-2 font-medium text-right">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {clients.map((client) => (
                  <tr 
                    key={client.id}
                    className="hover:bg-neutral-800/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectClient && onSelectClient(client)}
                  >
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={client.name} size="sm" />
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-200 truncate group-hover:text-indigo-400 transition-colors">
                            {client.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate">
                            {client.company}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-2">
                      <Badge 
                        variant={client.tier === 'Enterprise' ? 'primary' : 'outline'} 
                        size="xs"
                      >
                        {client.tier || 'Standard'}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono text-neutral-300">
                      {client.activeProjectsCount}
                    </td>

                    <td className="py-2.5 px-2 text-right font-mono font-medium text-neutral-100">
                      {formatCurrency(client.totalBilled)}
                    </td>

                    <td className="py-2.5 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-emerald-400">
                          {client.healthScore || 95}%
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
