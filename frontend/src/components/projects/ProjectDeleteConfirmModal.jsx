import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '../ui';

export const ProjectDeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  project,
  tasksCount = 0,
  loading = false,
}) => {
  if (!isOpen || !project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Project Deliverable"
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
              Confirm Project Removal
            </h4>
            <p className="text-rose-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">{project.name}</strong>
              {project.code ? ` (${project.code})` : ''}?
            </p>
          </div>
        </div>

        {tasksCount > 0 && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300">
            <strong>Cascade Warning:</strong> This project currently has <strong>{tasksCount}</strong> linked sprint task(s).
            Deleting this project will permanently remove all associated tasks and work logs.
          </div>
        )}

        <p className="text-neutral-400">
          This operation is irreversible and will be logged in the immutable workspace audit trail.
        </p>

        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(project._id)}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Delete Project'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
