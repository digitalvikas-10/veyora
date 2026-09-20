import React from 'react';
import {
  Bell,
  Clock,
  User,
  Check,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getNotificationConfig } from './NotificationItem';
import { useUI } from '../../context/UIContext';

export default function NotificationDetailModal({
  isOpen,
  onClose,
  notification,
  onMarkRead,
  onDelete,
}) {
  const { setActiveTab } = useUI();

  if (!notification) return null;

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const formattedDate = (() => {
    try {
      if (!notification.createdAt) return 'Recent';
      const d = new Date(notification.createdAt);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return 'Recent';
    }
  })();

  const handleNavigate = () => {
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
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Details"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Header Banner */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className={`p-2.5 rounded-xl border shrink-0 ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${config.badge}`}>
                {config.label}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                notification.isRead
                  ? 'bg-neutral-800 text-neutral-400'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-neutral-100">
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Message Content Body */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
            Payload Message
          </span>
          <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {notification.message}
          </p>
        </div>

        {/* Meta Attributes */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Timestamp
            </span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-1">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
              Sender Context
            </span>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span className="truncate">
                {notification.senderId?.name || 'System Auto-Trigger'}
              </span>
            </div>
          </div>
        </div>

        {/* Deep Link Information if present */}
        {notification.link && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-medium">Deep Link: {notification.link}</span>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDelete(notification._id || notification.id);
              onClose();
            }}
            className="border-neutral-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </Button>

          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onMarkRead(notification._id || notification.id);
                }}
                className="border-neutral-800 text-emerald-400 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Read</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNavigate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5"
            >
              <span>Jump to Section</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
