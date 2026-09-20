import React from 'react';
import {
  ShieldAlert,
  KeyRound,
  GlobeLock,
  UserCheck,
  History,
  Terminal,
  Activity,
} from 'lucide-react';

export const SecurityEventFeed = ({ events = [] }) => {
  const getActionIcon = (action) => {
    if (action.includes('KEY') || action.includes('ROTATED')) {
      return <KeyRound className="w-4 h-4 text-amber-400" />;
    }
    if (action.includes('FIREWALL') || action.includes('IP')) {
      return <GlobeLock className="w-4 h-4 text-indigo-400" />;
    }
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return <UserCheck className="w-4 h-4 text-emerald-400" />;
    }
    return <Activity className="w-4 h-4 text-cyan-400" />;
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          Security Incident & Access Event Stream
        </h3>
        <p className="text-sm text-slate-400">
          Immutable ledger of security-related administrative mutations, credential rotations,
          firewall updates, and privileged access events.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No security events recorded in this session.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {events.map((event) => (
              <div
                key={event._id || event.id || Math.random()}
                className="p-4 hover:bg-slate-900/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 mt-0.5 sm:mt-0">
                    {getActionIcon(event.action)}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white font-mono">{event.action}</span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        by {event.actorName || event.actorEmail || 'System'}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      {event.details?.notes ||
                        event.details?.reason ||
                        'Security state mutation logged.'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>IP: {event.ipAddress || '127.0.0.1'}</span>
                      <span>Agent: {event.userAgent?.slice(0, 30) || 'API Client'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-slate-500 font-mono self-end sm:self-center">
                  {formatTimestamp(event.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
