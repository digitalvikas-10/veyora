import React, { useState, useMemo } from 'react';
import {
  Bell,
  RefreshCw,
  Sparkles,
  Inbox,
  Filter,
  CheckCheck,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import NotificationMetrics from './NotificationMetrics';
import NotificationFilterBar from './NotificationFilterBar';
import NotificationItem from './NotificationItem';
import NotificationDetailModal from './NotificationDetailModal';
import NotificationCreateModal from './NotificationCreateModal';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function NotificationManager() {
  const {
    notifications,
    unreadNotificationsCount,
    notificationStats,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
    createNotification,
    loadingStates,
  } = useData();

  const { user } = useAuth();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal States
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Status Filter
      if (statusFilter === 'unread' && notif.isRead) return false;
      if (statusFilter === 'read' && !notif.isRead) return false;

      // Type Filter
      if (typeFilter !== 'all' && notif.type !== typeFilter) return false;

      // Search Term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = notif.title?.toLowerCase().includes(query);
        const messageMatch = notif.message?.toLowerCase().includes(query);
        const senderMatch = notif.senderId?.name?.toLowerCase().includes(query);
        return titleMatch || messageMatch || senderMatch;
      }

      return true;
    });
  }, [notifications, statusFilter, typeFilter, searchTerm]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSeedSamples = async () => {
    try {
      await createNotification({
        type: 'invoice_paid',
        title: 'Payment Received: INV-2026-042 ($8,900.00)',
        message: 'Stripe webhook received: Apex Dynamics settled balance in full.',
        recipientId: user?._id || user?.id,
      });
      await createNotification({
        type: 'task_assigned',
        title: 'Sprint Assignment: API Security Audit',
        message: 'You have been assigned as lead reviewer for endpoint penetration tests.',
        recipientId: user?._id || user?.id,
      });
      await createNotification({
        type: 'proposal_signed',
        title: 'Proposal Signed: Mobile SDK Phase 2',
        message: 'Client digital e-signature verified and timestamped.',
        recipientId: user?._id || user?.id,
      });
    } catch (err) {
      console.warn('Failed to seed notifications:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header Card */}
      <Card className="p-6 relative overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
                  <span>In-App Notification Engine</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Real-time activity dispatch, multi-tenant alert routing, instant deep links, and lifecycle event broadcasts
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-neutral-800 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh Feed</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-1.5 font-medium shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dispatch Alert</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Real-time KPI Stats */}
      <NotificationMetrics
        notifications={notifications}
        unreadCount={unreadNotificationsCount}
        stats={notificationStats}
      />

      {/* Main Feed Container */}
      <Card className="p-5 space-y-4 border-neutral-800 bg-neutral-950/60">
        {/* Filters and Controls */}
        <NotificationFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onMarkAllRead={markAllNotificationsRead}
          onClearRead={clearReadNotifications}
          onOpenCreateModal={() => setCreateModalOpen(true)}
          unreadCount={unreadNotificationsCount}
          totalCount={notifications.length}
        />

        {/* Notification Feed List */}
        <div className="space-y-2.5 pt-2">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-700/60">
                <Inbox className="w-6 h-6 text-neutral-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-200">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'No matching notifications found'
                    : 'Your notification feed is empty'}
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try clearing your search criteria or changing category filters.'
                    : 'Activity across your tasks, proposals, and invoices will appear in this unified inbox.'}
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Dispatch Test Alert
                </Button>
                {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="text-xs"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredNotifications.map((notification, idx) => (
              <NotificationItem
                key={notification._id || notification.id || `notif-${idx}`}
                notification={notification}
                onMarkRead={markNotificationAsRead}
                onDelete={deleteNotification}
                onSelectDetail={(n) => setSelectedNotification(n)}
              />
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <NotificationDetailModal
        isOpen={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onMarkRead={markNotificationAsRead}
        onDelete={deleteNotification}
      />

      <NotificationCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={createNotification}
      />
    </div>
  );
}
