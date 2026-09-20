import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '../ui';

export const ClientDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  client,
  projectsCount = 0,
  loading = false,
}) => {
  if (!isOpen || !client) return null;

  const hasActiveProjects = projectsCount > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Client Account"
      size="sm"
      className="bg-neutral-900 border border-neutral-800"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-200 text-sm">
              Confirm Account Removal
            </h4>
            <p className="text-rose-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{client.name}</strong>
              {client.company ? ` (${client.company})` : ''}?
            </p>
          </div>
        </div>

        {hasActiveProjects ? (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
            <strong>Warning:</strong> This client has <strong>{projectsCount}</strong> associated project(s).
            The server prohibits deleting clients with active projects. Please archive or reassign projects first.
          </div>
        ) : (
          <p className="text-neutral-400">
            This action will delete the client profile from the current workspace. Audit logs will record this operation.
          </p>
        )}

        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(client._id)}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Delete Client'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
