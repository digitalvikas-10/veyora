import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Avatar } from '../ui';
import { Activity, Clock, RefreshCw } from 'lucide-react';

export const RecentActivityFeed = ({ activities = [], loading = false, onRefresh }) => {
  const getActionBadgeVariant = (action = '') => {
    if (action.includes('PAID') || action.includes('APPROVED')) return 'success';
    if (action.includes('CREATED') || action.includes('INVITED')) return 'primary';
    if (action.includes('UPDATED') || action.includes('MODIFIED')) return 'info';
    if (action.includes('DELETED') || action.includes('FAILED')) return 'danger';
    return 'outline';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const diffMin = Math.floor((new Date() - date) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-recent-activity-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-neutral-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            Workspace Activity Audit
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400 mt-0.5">
            Real-time compliance telemetry and user mutation logs
          </CardDescription>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-2.5 items-start animate-pulse">
                <div className="w-6 h-6 rounded-full bg-neutral-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-neutral-800 rounded" />
                  <div className="h-2 w-1/3 bg-neutral-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No workspace activity recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((act, index) => {
              const actorName = act.userId?.name || act.actorName || 'System Service';
              const actorRole = act.userId?.role || act.actorRole || 'system';
              return (
                <div key={act._id || index} className="flex items-start gap-2.5 text-xs">
                  <Avatar name={actorName} size="xs" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-neutral-200 truncate">
                        {actorName}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimestamp(act.createdAt)}
                      </span>
                    </div>

                    <div className="mt-0.5 text-neutral-400 text-[11px] leading-relaxed line-clamp-2">
                      {act.details || act.action}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5">
                      <Badge variant={getActionBadgeVariant(act.action)} size="xs">
                        {act.action?.replace('_', ' ') || 'ACTION'}
                      </Badge>
                      <span className="text-[10px] text-neutral-500 uppercase font-mono">
                        {actorRole}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
