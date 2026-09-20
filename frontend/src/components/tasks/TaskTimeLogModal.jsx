import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Modal, Button } from '../ui';

export const TaskTimeLogModal = ({
  isOpen,
  onClose,
  onSubmit,
  task = null,
  loading = false,
}) => {
  const [hours, setHours] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setHours('1');
      setNote('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(hours);
    if (!parsed || parsed <= 0) {
      setError('Logged hours must be greater than 0');
      return;
    }

    try {
      await onSubmit(task._id, parsed, note.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log time');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Log Work Session</span>
        </div>
      }
      size="sm"
      className="bg-neutral-900 border border-neutral-800"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
            Target Task
          </span>
          <h4 className="font-semibold text-neutral-100 text-sm">{task.title}</h4>
          {task.projectId?.name && (
            <p className="text-[11px] text-neutral-400">Project: {task.projectId.name}</p>
          )}
        </div>

        <div>
          <label className="block text-neutral-300 font-medium mb-1">
            Hours Spent <span className="text-rose-400">*</span>
          </label>
          <input
            type="number"
            step="0.25"
            min="0.1"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setError('');
            }}
            required
            className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-neutral-300 font-medium mb-1">Session Work Note</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what was accomplished or delivered in this sprint work session..."
            className="w-full p-2.5 rounded-lg text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{loading ? 'Logging...' : 'Save Session'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
