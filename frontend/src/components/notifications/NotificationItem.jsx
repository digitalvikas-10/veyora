import React from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Check,
  Layers,
  CreditCard,
  FileCheck,
  Briefcase,
  AlertCircle,
  Info,
  User as UserIcon,
  ChevronRight,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';

export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Just now';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

export const getNotificationConfig = (type) => {
  switch (type) {
    case 'task_assigned':
      return {
        label: 'Task Assignment',
        icon: Layers,
        color: 'text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/20',
        badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        targetModule: 'tasks',
        targetAnchor: 'phase-13-task-management',
      };
    case 'invoice_paid':
      return {
        label: 'Invoice & Payment',
        icon: CreditCard,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        targetModule: 'invoices',
        targetAnchor: 'phase-15-invoice-management',
      };
    case 'proposal_signed':
      return {
        label: 'Proposal Signed',
        icon: FileCheck,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10 border-purple-500/20',
        badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        targetModule: 'proposals',
        targetAnchor: 'phase-14-proposal-management',
      };
    case 'project_update':
      return {
        label: 'Project Update',
        icon: Briefcase,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20',
        badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        targetModule: 'projects',
        targetAnchor: 'phase-12-project-management',
      };
    case 'system':
      return {
        label: 'System Alert',
        icon: AlertCircle,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10 border-rose-500/20',
        badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        targetModule: 'dashboard',
        targetAnchor: 'phase-10-dashboard-analytics',
      };
    case 'info':
    default:
      return {
        label: 'Workspace Notice',
        icon: Info,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/20',
        badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        targetModule: 'dashboard',
        targetAnchor: 'phase-10-dashboard-analytics',
      };
  }
};

export default function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onSelectDetail,
}) {
  const { setActiveTab } = useUI();
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const formattedTime = formatTimeAgo(notification.createdAt);

  const handleNavigate = (e) => {
    e.stopPropagation();
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification._id || notification.id);
    }
    if (config.targetModule) {
      setActiveTab(config.targetModule);
    }
    if (config.targetAnchor) {
      const el = document.getElementById(config.targetAnchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isUnread = !notification.isRead;

  return (
    <div
      onClick={() => onSelectDetail(notification)}
      className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isUnread
          ? 'bg-neutral-900/90 border-indigo-500/30 shadow-md shadow-indigo-500/5 hover:border-indigo-500/50'
          : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/70 hover:border-neutral-700'
      }`}
    >
      {/* Unread Indicator Glow Bar */}
      {isUnread && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r" />
      )}

      {/* Left: Icon + Content */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1 pl-1">
        {/* Type Icon */}
        <div className={`p-2.5 rounded-xl border shrink-0 ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold truncate ${
                isUnread ? 'text-neutral-100' : 'text-neutral-300'
              }`}
            >
              {notification.title}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${config.badge}`}
            >
              {config.label}
            </span>
            {isUnread && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                New
              </span>
            )}
          </div>

          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
            </div>
            {notification.senderId && (
              <div className="flex items-center gap-1 font-medium text-neutral-400">
                <UserIcon className="w-3 h-3 text-neutral-500" />
                <span>{notification.senderId?.name || 'Workspace User'}</span>
              </div>
            )}
            {notification.readAt && (
              <span className="text-neutral-500 font-mono text-[10px]">
                • Read
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick Interactive Actions */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/60 w-full sm:w-auto justify-end">
        {/* Deep Link Action */}
        <button
          onClick={handleNavigate}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-indigo-600 hover:text-white text-neutral-300 text-xs font-medium border border-neutral-700/60 transition shadow-sm"
          title={`Jump to ${config.label}`}
        >
          <span>Jump to Module</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Toggle Read */}
        {isUnread ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification._id || notification.id);
            }}
            className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-emerald-500/20 hover:text-emerald-300 text-neutral-400 border border-neutral-800 hover:border-emerald-500/30 transition"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="p-1.5 text-neutral-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/40" />
          </span>
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id || notification.id);
          }}
          className="p-1.5 rounded-lg bg-neutral-800/60 hover:bg-rose-500/20 hover:text-rose-300 text-neutral-400 border border-neutral-800 hover:border-rose-500/30 transition"
          title="Delete notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSelectDetail(notification)}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
