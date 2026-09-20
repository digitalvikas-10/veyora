import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '../ui';
import { useData } from '../../context/DataContext';

export const QuickActionModals = ({
  activeModal, // 'invoice' | 'project' | 'task' | null
  onClose,
  onSuccess,
}) => {
  const { clients, projects, createInvoice, createProject, createTask } = useData();

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Form states - Invoice
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    projectId: '',
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    amount: '4500',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Standard Net 14 service delivery milestone.',
  });

  // Form states - Project
  const [projectForm, setProjectForm] = useState({
    clientId: '',
    name: '',
    projectCode: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
    budget: '15000',
    status: 'in_progress',
    description: 'Strategic engagement deliverable and technical sprint.',
  });

  // Form states - Task
  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    priority: 'high',
    estimatedHours: '8',
    description: 'Critical sprint review item.',
  });

  const clientOptions = clients.map((c) => ({
    value: c._id,
    label: `${c.name} (${c.company || 'Direct'})`,
  }));

  const projectOptions = projects.map((p) => ({
    value: p._id,
    label: `${p.name} [${p.projectCode || 'CODE'}]`,
  }));

  // Handle Quick Invoice Submit
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    if (!invoiceForm.clientId) return;
    setSubmitting(true);
    try {
      const amountVal = parseFloat(invoiceForm.amount) || 0;
      await createInvoice({
        clientId: invoiceForm.clientId,
        projectId: invoiceForm.projectId || undefined,
        invoiceNumber: invoiceForm.invoiceNumber,
        lineItems: [
          {
            description: 'Professional Services & Consulting',
            quantity: 1,
            unitPrice: amountVal,
            amount: amountVal,
          },
        ],
        subtotal: amountVal,
        totalAmount: amountVal,
        balanceDue: amountVal,
        amountPaid: 0,
        currency: 'USD',
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes,
      });
      if (onSuccess) onSuccess('invoice');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Project Submit
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.clientId || !projectForm.name) return;
    setSubmitting(true);
    try {
      await createProject({
        clientId: projectForm.clientId,
        name: projectForm.name,
        projectCode: projectForm.projectCode,
        budget: parseFloat(projectForm.budget) || 10000,
        status: projectForm.status,
        description: projectForm.description,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      if (onSuccess) onSuccess('project');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Quick Task Submit
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.projectId || !taskForm.title) return;
    setSubmitting(true);
    try {
      await createTask({
        projectId: taskForm.projectId,
        title: taskForm.title,
        priority: taskForm.priority,
        estimatedHours: parseFloat(taskForm.estimatedHours) || 4,
        description: taskForm.description,
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      });
      if (onSuccess) onSuccess('task');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Quick Invoice Modal */}
      <Modal
        isOpen={activeModal === 'invoice'}
        onClose={onClose}
        title="Issue Quick Invoice"
        description="Generate an accounts receivable invoice for immediate client payment."
        size="md"
      >
        <form onSubmit={handleInvoiceSubmit} className="space-y-3.5">
          <Select
            label="Client Account"
            value={invoiceForm.clientId}
            onChange={(val) => setInvoiceForm({ ...invoiceForm, clientId: val })}
            options={clientOptions}
            placeholder="Select billed client"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Invoice Number"
              value={invoiceForm.invoiceNumber}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
              required
            />
            <Input
              label="Amount ($ USD)"
              type="number"
              value={invoiceForm.amount}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Associated Project (Optional)"
              value={invoiceForm.projectId}
              onChange={(val) => setInvoiceForm({ ...invoiceForm, projectId: val })}
              options={[{ value: '', label: 'None / General Retainer' }, ...projectOptions]}
            />
            <Input
              label="Due Date"
              type="date"
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Invoice Memo / Notes"
            value={invoiceForm.notes}
            onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
            rows={2}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Generate & Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Quick Project Modal */}
      <Modal
        isOpen={activeModal === 'project'}
        onClose={onClose}
        title="Initialize New Project"
        description="Establish an operational sprint board for client milestones."
        size="md"
      >
        <form onSubmit={handleProjectSubmit} className="space-y-3.5">
          <Select
            label="Client"
            value={projectForm.clientId}
            onChange={(val) => setProjectForm({ ...projectForm, clientId: val })}
            options={clientOptions}
            placeholder="Select client owner"
            required
          />

          <Input
            label="Project Title"
            placeholder="e.g. NextGen Web Experience"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Project Code"
              value={projectForm.projectCode}
              onChange={(e) => setProjectForm({ ...projectForm, projectCode: e.target.value })}
              required
            />
            <Input
              label="Budget Allocation ($)"
              type="number"
              value={projectForm.budget}
              onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
              required
            />
          </div>

          <Textarea
            label="Scope Brief"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            rows={2}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Create Sprint
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Quick Task Modal */}
      <Modal
        isOpen={activeModal === 'task'}
        onClose={onClose}
        title="Dispatch Work Item"
        description="Add a prioritized ticket to an active project board."
        size="md"
      >
        <form onSubmit={handleTaskSubmit} className="space-y-3.5">
          <Select
            label="Target Project"
            value={taskForm.projectId}
            onChange={(val) => setTaskForm({ ...taskForm, projectId: val })}
            options={projectOptions}
            placeholder="Select project sprint"
            required
          />

          <Input
            label="Task Title"
            placeholder="e.g. Implement Webhook Re-delivery Queue"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={taskForm.priority}
              onChange={(val) => setTaskForm({ ...taskForm, priority: val })}
              options={[
                { value: 'urgent', label: 'Urgent (Blocker)' },
                { value: 'high', label: 'High Priority' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
            <Input
              label="Estimated Hours"
              type="number"
              value={taskForm.estimatedHours}
              onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Dispatch Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
