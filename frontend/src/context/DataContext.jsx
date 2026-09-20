import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useWorkspace } from './WorkspaceContext';
import { useUI } from './UIContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { addToast } = useUI();

  // State slices
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [billingSummary, setBillingSummary] = useState({ totalRevenue: 0, totalOutstanding: 0, totalInvoiced: 0 });
  const [documents, setDocuments] = useState([]);
  const [documentStats, setDocumentStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationStats, setNotificationStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogStats, setAuditLogStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [securityPosture, setSecurityPosture] = useState(null);
  const [securityScan, setSecurityScan] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [scenarioResults, setScenarioResults] = useState(null);

  // Loading states per domain
  const [loadingStates, setLoadingStates] = useState({
    clients: false,
    projects: false,
    tasks: false,
    proposals: false,
    invoices: false,
    documents: false,
    notifications: false,
    auditLogs: false,
    analytics: false,
    security: false,
    testing: false,
  });

  const setDomainLoading = (domain, isLoading) => {
    setLoadingStates((prev) => ({ ...prev, [domain]: isLoading }));
  };

  // ===================== CLIENTS =====================
  const fetchClients = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('clients', true);
    try {
      const res = await api.get('/clients', { params });
      const clientList = res?.data?.clients || [];
      setClients(clientList);
      return clientList;
    } catch (err) {
      console.warn('Error fetching clients:', err);
      return [];
    } finally {
      setDomainLoading('clients', false);
    }
  }, [currentWorkspace?._id]);

  const createClient = async (clientData) => {
    try {
      const res = await api.post('/clients', clientData);
      const newClient = res?.data?.client;
      if (newClient) {
        setClients((prev) => [newClient, ...prev]);
        addToast({
          type: 'success',
          title: 'Client Created',
          message: `${newClient.name} was registered successfully.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Client Creation Failed',
        message: err.message || 'Could not create client record.',
      });
      throw err;
    }
  };

  const updateClient = async (id, updateData) => {
    try {
      const res = await api.patch(`/clients/${id}`, updateData);
      const updated = res?.data?.client;
      if (updated) {
        setClients((prev) => prev.map((c) => (c._id === id ? updated : c)));
        addToast({
          type: 'success',
          title: 'Client Updated',
          message: `${updated.name} records saved.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update client.',
      });
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      setClients((prev) => prev.filter((c) => c._id !== id));
      addToast({
        type: 'success',
        title: 'Client Deleted',
        message: 'Client removed from current workspace.',
      });
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete client.',
      });
      throw err;
    }
  };

  const getClientDetails = async (id) => {
    try {
      const res = await api.get(`/clients/${id}`);
      return res?.data;
    } catch (err) {
      console.warn('Error fetching client details:', err);
      throw err;
    }
  };

  // ===================== PROJECTS =====================
  const fetchProjects = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('projects', true);
    try {
      const res = await api.get('/projects', { params });
      const projectList = res?.data?.projects || [];
      setProjects(projectList);
      return projectList;
    } catch (err) {
      console.warn('Error fetching projects:', err);
      return [];
    } finally {
      setDomainLoading('projects', false);
    }
  }, [currentWorkspace?._id]);

  const createProject = async (projectData) => {
    try {
      const res = await api.post('/projects', projectData);
      const newProj = res?.data?.project;
      if (newProj) {
        setProjects((prev) => [newProj, ...prev]);
        addToast({
          type: 'success',
          title: 'Project Initialized',
          message: `${newProj.name} (${newProj.code || newProj.projectCode || ''}) created.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Project Creation Failed',
        message: err.message || 'Could not create project.',
      });
      throw err;
    }
  };

  const updateProject = async (id, updateData) => {
    try {
      const res = await api.patch(`/projects/${id}`, updateData);
      const updated = res?.data?.project;
      if (updated) {
        setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
        addToast({
          type: 'success',
          title: 'Project Updated',
          message: `${updated.name} updated successfully.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Project Update Failed',
        message: err.message || 'Could not update project.',
      });
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setTasks((prev) => prev.filter((t) => t.projectId !== id && t.projectId?._id !== id));
      addToast({
        type: 'success',
        title: 'Project Deleted',
        message: 'Project and associated tasks removed.',
      });
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Project Deletion Failed',
        message: err.message || 'Could not delete project.',
      });
      throw err;
    }
  };

  const getProjectDetails = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      return res?.data;
    } catch (err) {
      console.warn('Error fetching project details:', err);
      throw err;
    }
  };

  // ===================== TASKS =====================
  const fetchTasks = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('tasks', true);
    try {
      const res = await api.get('/tasks', { params });
      const taskList = res?.data?.tasks || [];
      setTasks(taskList);
      return taskList;
    } catch (err) {
      console.warn('Error fetching tasks:', err);
      return [];
    } finally {
      setDomainLoading('tasks', false);
    }
  }, [currentWorkspace?._id]);

  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      const newTask = res?.data?.task;
      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        addToast({
          type: 'success',
          title: 'Task Added',
          message: newTask.title,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Task Creation Failed',
        message: err.message || 'Could not add task.',
      });
      throw err;
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const res = await api.patch(`/tasks/${id}`, { status });
      const updated = res?.data?.task;
      if (updated) {
        setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message || 'Could not update task status.',
      });
      throw err;
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await api.patch(`/tasks/${id}`, data);
      const updated = res?.data?.task;
      if (updated) {
        setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
        addToast({
          type: 'success',
          title: 'Task Updated',
          message: updated.title,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Task Update Failed',
        message: err.message || 'Could not update task.',
      });
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      addToast({
        type: 'success',
        title: 'Task Deleted',
        message: 'Sprint task was permanently removed.',
      });
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Task Deletion Failed',
        message: err.message || 'Could not delete task.',
      });
      throw err;
    }
  };

  const logTaskTime = async (taskId, hours, note) => {
    try {
      const res = await api.post(`/tasks/${taskId}/time-logs`, { hours: Number(hours), note });
      const { loggedHours, timeLogs } = res?.data || {};
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                loggedHours: loggedHours !== undefined ? loggedHours : (t.loggedHours || 0) + Number(hours),
                timeLogs: timeLogs || t.timeLogs,
              }
            : t
        )
      );
      addToast({
        type: 'success',
        title: 'Time Logged',
        message: `${hours} hour(s) logged successfully.`,
      });
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Time Logging Failed',
        message: err.message || 'Could not log work session.',
      });
      throw err;
    }
  };

  const toggleTaskChecklist = async (taskId, itemId) => {
    try {
      const res = await api.patch(`/tasks/${taskId}/checklist/${itemId}/toggle`);
      const checklist = res?.data?.checklist;
      if (checklist) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, checklist } : t))
        );
      }
      return checklist;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Checklist Toggle Failed',
        message: err.message || 'Could not toggle checklist item.',
      });
      throw err;
    }
  };

  const getTaskDetails = async (id) => {
    try {
      const res = await api.get(`/tasks/${id}`);
      return res?.data?.task;
    } catch (err) {
      console.warn('Error fetching task details:', err);
      return null;
    }
  };

  // ===================== PROPOSALS =====================
  const fetchProposals = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('proposals', true);
    try {
      const res = await api.get('/proposals', { params });
      const proposalList = res?.data?.proposals || [];
      setProposals(proposalList);
      return proposalList;
    } catch (err) {
      console.warn('Error fetching proposals:', err);
      return [];
    } finally {
      setDomainLoading('proposals', false);
    }
  }, [currentWorkspace?._id]);

  const getProposalDetails = async (id) => {
    try {
      const res = await api.get(`/proposals/${id}`);
      return res?.data?.proposal;
    } catch (err) {
      console.warn('Error fetching proposal details:', err);
      return null;
    }
  };

  const createProposal = async (proposalData) => {
    try {
      const res = await api.post('/proposals', proposalData);
      const newProp = res?.data?.proposal;
      if (newProp) {
        setProposals((prev) => [newProp, ...prev]);
        addToast({
          type: 'success',
          title: 'Proposal Drafted',
          message: `${newProp.title} (${newProp.proposalNumber})`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Proposal Creation Failed',
        message: err.message || 'Could not draft proposal.',
      });
      throw err;
    }
  };

  const updateProposal = async (id, proposalData) => {
    try {
      const res = await api.patch(`/proposals/${id}`, proposalData);
      const updatedProp = res?.data?.proposal;
      if (updatedProp) {
        setProposals((prev) =>
          prev.map((p) => (p._id === id ? updatedProp : p))
        );
        addToast({
          type: 'success',
          title: 'Proposal Updated',
          message: `Saved changes to ${updatedProp.proposalNumber || 'proposal'}.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Proposal Update Failed',
        message: err.message || 'Could not update proposal.',
      });
      throw err;
    }
  };

  const sendProposal = async (id) => {
    try {
      const res = await api.post(`/proposals/${id}/send`);
      const updatedProp = res?.data?.proposal;
      if (updatedProp) {
        setProposals((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: 'sent' } : p))
        );
        addToast({
          type: 'success',
          title: 'Proposal Dispatched',
          message: `Proposal ${updatedProp.proposalNumber || ''} sent to client.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Send Failed',
        message: err.message || 'Could not dispatch proposal.',
      });
      throw err;
    }
  };

  const signProposal = async (id, { signedBy, signedEmail }) => {
    try {
      const res = await api.post(`/proposals/${id}/sign`, { signedBy, signedEmail });
      const updatedProp = res?.data?.proposal;
      if (updatedProp) {
        setProposals((prev) =>
          prev.map((p) => (p._id === id ? updatedProp : p))
        );
        addToast({
          type: 'success',
          title: 'Proposal Accepted & Signed',
          message: `Contract ratified by ${signedBy}.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Signature Failed',
        message: err.message || 'Could not ratify proposal signature.',
      });
      throw err;
    }
  };

  const deleteProposal = async (id) => {
    try {
      await api.delete(`/proposals/${id}`);
      setProposals((prev) => prev.filter((p) => p._id !== id));
      addToast({
        type: 'success',
        title: 'Proposal Removed',
        message: 'The proposal document has been permanently deleted.',
      });
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete proposal.',
      });
      throw err;
    }
  };

  // ===================== INVOICES =====================
  const fetchInvoices = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('invoices', true);
    try {
      const res = await api.get('/invoices', { params });
      const invoiceList = res?.data?.invoices || [];
      setInvoices(invoiceList);
      if (res?.data?.billingSummary) {
        setBillingSummary(res.data.billingSummary);
      }
      return invoiceList;
    } catch (err) {
      console.warn('Error fetching invoices:', err);
      return [];
    } finally {
      setDomainLoading('invoices', false);
    }
  }, [currentWorkspace?._id]);

  const createInvoice = async (invoiceData) => {
    try {
      const res = await api.post('/invoices', invoiceData);
      const newInv = res?.data?.invoice;
      if (newInv) {
        setInvoices((prev) => [newInv, ...prev]);
        addToast({
          type: 'success',
          title: 'Invoice Issued',
          message: `${newInv.invoiceNumber} for $${Number(newInv.totalAmount || 0).toLocaleString()} USD`,
        });
        await fetchInvoices();
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Invoice Creation Failed',
        message: err.message || 'Could not generate invoice.',
      });
      throw err;
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    try {
      const res = await api.patch(`/invoices/${id}`, invoiceData);
      const updated = res?.data?.invoice;
      if (updated) {
        setInvoices((prev) => prev.map((inv) => (inv._id === id ? updated : inv)));
        addToast({
          type: 'success',
          title: 'Invoice Updated',
          message: `Invoice ${updated.invoiceNumber} updated successfully.`,
        });
        await fetchInvoices();
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update invoice.',
      });
      throw err;
    }
  };

  const sendInvoice = async (id) => {
    try {
      const res = await api.post(`/invoices/${id}/send`);
      const updated = res?.data?.invoice;
      if (updated) {
        setInvoices((prev) => prev.map((inv) => (inv._id === id ? updated : inv)));
        addToast({
          type: 'success',
          title: 'Invoice Dispatched',
          message: `Invoice ${updated.invoiceNumber} sent to client.`,
        });
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message || 'Could not send invoice.',
      });
      throw err;
    }
  };

  const recordInvoicePayment = async (invoiceId, paymentData) => {
    try {
      const res = await api.post(`/invoices/${invoiceId}/payments`, paymentData);
      const updated = res?.data?.invoice;
      if (updated) {
        setInvoices((prev) => prev.map((inv) => (inv._id === invoiceId ? updated : inv)));
        addToast({
          type: 'success',
          title: 'Payment Recorded',
          message: `$${Number(paymentData.amount).toLocaleString()} applied to ${updated.invoiceNumber}.`,
        });
      }
      await fetchInvoices();
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Payment Processing Failed',
        message: err.message || 'Could not record payment.',
      });
      throw err;
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      addToast({
        type: 'success',
        title: 'Invoice Removed',
        message: 'The invoice has been deleted.',
      });
      await fetchInvoices();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete invoice.',
      });
      throw err;
    }
  };

  const getInvoiceDetails = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}`);
      return res?.data?.invoice;
    } catch (err) {
      console.warn('Error fetching invoice details:', err);
      return null;
    }
  };

  // ===================== DOCUMENTS & ASSETS =====================
  const fetchDocuments = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('documents', true);
    try {
      const res = await api.get('/documents', { params });
      const docList = res?.data?.documents || [];
      setDocuments(docList);
      return docList;
    } catch (err) {
      console.warn('Error fetching documents:', err);
      return [];
    } finally {
      setDomainLoading('documents', false);
    }
  }, [currentWorkspace?._id]);

  const fetchDocumentStats = useCallback(async () => {
    if (!currentWorkspace?._id) return null;
    try {
      const res = await api.get('/documents/stats');
      const stats = res?.data || null;
      setDocumentStats(stats);
      return stats;
    } catch (err) {
      console.warn('Error fetching document stats:', err);
      return null;
    }
  }, [currentWorkspace?._id]);

  const createDocument = async (docData) => {
    try {
      const res = await api.post('/documents', docData);
      const newDoc = res?.data?.document;
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev]);
        addToast({
          type: 'success',
          title: 'Document Registered',
          message: `${newDoc.title} added to workspace library.`,
        });
        fetchDocumentStats();
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Could not register document.',
      });
      throw err;
    }
  };

  const uploadDocumentFile = async (formData) => {
    try {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newDoc = res?.data?.document;
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev]);
        addToast({
          type: 'success',
          title: 'File Uploaded',
          message: `${newDoc.fileName} (${((newDoc.fileSize || 0) / 1024).toFixed(1)} KB) saved.`,
        });
        fetchDocumentStats();
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Could not upload file.',
      });
      throw err;
    }
  };

  const updateDocument = async (id, updateData) => {
    try {
      const res = await api.patch(`/documents/${id}`, updateData);
      const updated = res?.data?.document;
      if (updated) {
        setDocuments((prev) => prev.map((d) => (d._id === id ? updated : d)));
        addToast({
          type: 'success',
          title: 'Document Updated',
          message: `Saved changes to ${updated.title}.`,
        });
        fetchDocumentStats();
      }
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update document metadata.',
      });
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      addToast({
        type: 'success',
        title: 'Document Removed',
        message: 'The file asset was deleted from storage.',
      });
      fetchDocumentStats();
      return true;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete document.',
      });
      throw err;
    }
  };

  const getDocumentDetails = async (id) => {
    try {
      const res = await api.get(`/documents/${id}`);
      return res?.data?.document;
    } catch (err) {
      console.warn('Error fetching document details:', err);
      return null;
    }
  };

  // ===================== NOTIFICATIONS =====================
  const fetchNotifications = useCallback(async (params = { limit: 50 }) => {
    if (!user) return [];
    setDomainLoading('notifications', true);
    try {
      const res = await api.get('/notifications', { params });
      const notifs = res?.data?.notifications || [];
      setNotifications(notifs);
      setUnreadNotificationsCount(res?.data?.unreadCount || 0);
      return notifs;
    } catch (err) {
      console.warn('Error fetching notifications:', err);
      return [];
    } finally {
      setDomainLoading('notifications', false);
    }
  }, [user]);

  const fetchNotificationStats = useCallback(async () => {
    if (!user) return null;
    try {
      const res = await api.get('/notifications/stats');
      const stats = res?.data || null;
      setNotificationStats(stats);
      return stats;
    } catch (err) {
      console.warn('Error fetching notification stats:', err);
      return null;
    }
  }, [user]);

  const markNotificationAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      fetchNotificationStats();
      return res?.data?.notification;
    } catch (err) {
      console.warn('Failed to mark notification as read:', err);
      return null;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadNotificationsCount(0);
      fetchNotificationStats();
      addToast({
        type: 'info',
        title: 'Notifications Cleared',
        message: 'All notifications marked as read.',
      });
    } catch (err) {
      console.warn('Failed to mark notifications read:', err);
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err?.response?.data?.message || 'Could not mark all notifications as read',
      });
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.isRead) {
          setUnreadNotificationsCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
      fetchNotificationStats();
      addToast({
        type: 'info',
        title: 'Notification Removed',
        message: 'Notification removed from your feed.',
      });
      return true;
    } catch (err) {
      console.warn('Failed to delete notification:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err?.response?.data?.message || 'Could not delete notification',
      });
      return false;
    }
  };

  const clearReadNotifications = async () => {
    try {
      const res = await api.delete('/notifications/clear-read');
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      fetchNotificationStats();
      addToast({
        type: 'info',
        title: 'Read Alerts Cleared',
        message: `${res?.data?.deletedCount || 'Read'} notifications removed.`,
      });
      return true;
    } catch (err) {
      console.warn('Failed to clear read notifications:', err);
      addToast({
        type: 'error',
        title: 'Clear Failed',
        message: err?.response?.data?.message || 'Could not clear read notifications',
      });
      return false;
    }
  };

  const createNotification = async (data) => {
    try {
      const res = await api.post('/notifications', data);
      const newNotif = res?.data?.notification;
      if (newNotif) {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadNotificationsCount((prev) => prev + 1);
        fetchNotificationStats();
        addToast({
          type: 'success',
          title: 'Alert Dispatched',
          message: `Notification "${newNotif.title}" sent successfully.`,
        });
      }
      return newNotif;
    } catch (err) {
      console.warn('Failed to dispatch notification:', err);
      addToast({
        type: 'error',
        title: 'Dispatch Failed',
        message: err?.response?.data?.message || 'Could not dispatch notification',
      });
      throw err;
    }
  };

  // ===================== AUDIT LOGS =====================
  const fetchAuditLogs = useCallback(async (params = { limit: 50 }) => {
    if (!currentWorkspace?._id) return [];
    setDomainLoading('auditLogs', true);
    try {
      const res = await api.get('/audit-logs', { params });
      const logs = res?.data?.logs || [];
      setAuditLogs(logs);
      return logs;
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
      return [];
    } finally {
      setDomainLoading('auditLogs', false);
    }
  }, [currentWorkspace?._id]);

  const fetchAuditLogStats = useCallback(async () => {
    if (!currentWorkspace?._id) return null;
    try {
      const res = await api.get('/audit-logs/stats');
      const stats = res?.data || null;
      setAuditLogStats(stats);
      return stats;
    } catch (err) {
      console.warn('Error fetching audit log stats:', err);
      return null;
    }
  }, [currentWorkspace?._id]);

  const recordAuditCheckpoint = async (data) => {
    try {
      const res = await api.post('/audit-logs/manual-event', data);
      const newLog = res?.data?.log;
      if (newLog) {
        setAuditLogs((prev) => [newLog, ...prev]);
        fetchAuditLogStats();
        addToast({
          type: 'success',
          title: 'Compliance Checkpoint Logged',
          message: `Action "${newLog.action}" recorded in immutable audit trail.`,
        });
      }
      return newLog;
    } catch (err) {
      console.warn('Failed to record compliance checkpoint:', err);
      addToast({
        type: 'error',
        title: 'Logging Failed',
        message: err?.response?.data?.message || 'Could not record compliance checkpoint',
      });
      throw err;
    }
  };

  const exportAuditLogs = async (format = 'json') => {
    try {
      if (format === 'csv') {
        const res = await api.get('/audit-logs/export', {
          params: { format: 'csv' },
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `compliance-audit-trail-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        addToast({
          type: 'info',
          title: 'Audit Trail Exported',
          message: 'CSV compliance export downloaded successfully.',
        });
        return true;
      } else {
        const res = await api.get('/audit-logs/export', { params: { format: 'json' } });
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute('href', dataStr);
        dlAnchorElem.setAttribute('download', `compliance-audit-trail-${Date.now()}.json`);
        dlAnchorElem.click();
        dlAnchorElem.remove();
        addToast({
          type: 'info',
          title: 'Audit Trail Exported',
          message: 'JSON compliance report downloaded successfully.',
        });
        return res?.data;
      }
    } catch (err) {
      console.warn('Failed to export audit logs:', err);
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err?.response?.data?.message || 'Could not export audit trail',
      });
      return null;
    }
  };

  // ===================== ANALYTICS =====================
  const fetchAnalytics = useCallback(async (timeframe = '6m') => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('analytics', true);
    try {
      const res = await api.get('/analytics/dashboard', { params: { timeframe } });
      const data = res?.data || null;
      setAnalytics(data);
      return data;
    } catch (err) {
      console.warn('Error fetching analytics:', err);
      return null;
    } finally {
      setDomainLoading('analytics', false);
    }
  }, [currentWorkspace?._id]);

  // ===================== SECURITY HARDENING (PHASE 19) =====================
  const fetchSecurityPosture = useCallback(async () => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('security', true);
    try {
      const res = await api.get('/security/posture');
      const data = res?.data || null;
      setSecurityPosture(data);
      return data;
    } catch (err) {
      console.warn('Error fetching security posture:', err);
      return null;
    } finally {
      setDomainLoading('security', false);
    }
  }, [currentWorkspace?._id]);

  const runSecurityScan = async () => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('security', true);
    try {
      const res = await api.post('/security/scan');
      const data = res?.data || null;
      setSecurityScan(data);
      addToast({
        type: 'success',
        title: 'Security Scan Complete',
        message: `Discovered ${data?.summary?.totalFindings || 0} policy evaluations across workspace infrastructure.`,
      });
      await fetchSecurityPosture();
      return data;
    } catch (err) {
      console.warn('Error running security scan:', err);
      addToast({
        type: 'error',
        title: 'Security Scan Failed',
        message: err?.response?.data?.message || 'Could not complete vulnerability scan',
      });
      return null;
    } finally {
      setDomainLoading('security', false);
    }
  };

  const applySecurityRemediation = async (action) => {
    try {
      const res = await api.post('/security/remediate', { action });
      addToast({
        type: 'success',
        title: 'Remediation Enforced',
        message: res?.data?.message || 'Security control remediated successfully.',
      });
      await Promise.allSettled([fetchSecurityPosture(), fetchSecurityEvents()]);
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Remediation Failed',
        message: err?.response?.data?.message || 'Failed to enforce security remediation',
      });
      throw err;
    }
  };

  const rotateWorkspaceKeys = async () => {
    try {
      const res = await api.post('/security/rotate-keys');
      addToast({
        type: 'success',
        title: 'Keys Rotated',
        message: 'Workspace cryptographic session salts and invalidation timestamps rotated.',
      });
      await Promise.allSettled([fetchSecurityPosture(), fetchSecurityEvents()]);
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Key Rotation Failed',
        message: err?.response?.data?.message || 'Failed to rotate workspace signing keys',
      });
      throw err;
    }
  };

  const updateIpFirewall = async (firewallData) => {
    try {
      const res = await api.put('/security/ip-firewall', firewallData);
      addToast({
        type: 'success',
        title: 'IP Firewall Updated',
        message: `Firewall mode updated to "${firewallData.mode}". Rules synchronized.`,
      });
      await Promise.allSettled([fetchSecurityPosture(), fetchSecurityEvents()]);
      return res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Firewall Update Failed',
        message: err?.response?.data?.message || 'Failed to update IP firewall rules',
      });
      throw err;
    }
  };

  const fetchSecurityEvents = useCallback(async (limit = 20) => {
    if (!currentWorkspace?._id) return [];
    try {
      const res = await api.get('/security/events', { params: { limit } });
      const events = res?.data || [];
      setSecurityEvents(events);
      return events;
    } catch (err) {
      console.warn('Error fetching security events:', err);
      return [];
    }
  }, [currentWorkspace?._id]);

  // ===================== INTEGRATION TESTING & VERIFICATION (PHASE 20) =====================
  const runIntegrationTests = useCallback(async () => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('testing', true);
    try {
      const res = await api.post('/testing/run');
      const results = res?.data?.data || res?.data;
      setTestResults(results);
      addToast({
        type: results?.summary?.status === 'ALL_PASSED' ? 'success' : 'warning',
        title: 'Integration Test Suite Completed',
        message: `${results?.summary?.passed || 0}/${results?.summary?.total || 0} assertions passed in ${results?.totalDurationMs || 0}ms.`,
      });
      return results;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Integration Tests Failed',
        message: err.message || 'Could not complete automated test execution.',
      });
      throw err;
    } finally {
      setDomainLoading('testing', false);
    }
  }, [currentWorkspace?._id, addToast]);

  const runBenchmarkTests = useCallback(async () => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('testing', true);
    try {
      const res = await api.get('/testing/benchmarks');
      const benchmarks = res?.data?.data || res?.data;
      setBenchmarkResults(benchmarks);
      addToast({
        type: 'success',
        title: 'Benchmarks Recorded',
        message: `P50 Latency: ${benchmarks?.latencyMs?.p50 || 0}ms | Est. RPS: ${benchmarks?.throughput?.estimatedRps || 0}`,
      });
      return benchmarks;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Benchmark Run Failed',
        message: err.message || 'Could not record benchmark telemetry.',
      });
      throw err;
    } finally {
      setDomainLoading('testing', false);
    }
  }, [currentWorkspace?._id, addToast]);

  const runScenarioSimulation = useCallback(async (scenarioType = 'client_billing_lifecycle') => {
    if (!currentWorkspace?._id) return null;
    setDomainLoading('testing', true);
    try {
      const res = await api.post('/testing/scenario', { scenarioType });
      const scenario = res?.data?.data || res?.data;
      setScenarioResults(scenario);
      addToast({
        type: 'success',
        title: 'Scenario Simulation Completed',
        message: `Executed "${scenario?.name}" (${scenario?.totalSteps} steps in ${scenario?.durationMs}ms)`,
      });
      return scenario;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Scenario Run Failed',
        message: err.message || 'Scenario execution encountered an error.',
      });
      throw err;
    } finally {
      setDomainLoading('testing', false);
    }
  }, [currentWorkspace?._id, addToast]);

  const exportTestReport = useCallback(async (format = 'json') => {
    try {
      const res = await api.post('/testing/export', { format, testResults });
      return res?.data?.data || res?.data;
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.message || 'Failed to export verification certificate.',
      });
      throw err;
    }
  }, [testResults, addToast]);

  // Clear all in-memory data on signout
  const resetAllData = useCallback(() => {
    setClients([]);
    setProjects([]);
    setTasks([]);
    setProposals([]);
    setInvoices([]);
    setBillingSummary({ totalRevenue: 0, totalOutstanding: 0, totalInvoiced: 0 });
    setDocuments([]);
    setDocumentStats(null);
    setNotifications([]);
    setUnreadNotificationsCount(0);
    setNotificationStats(null);
    setAuditLogs([]);
    setAuditLogStats(null);
    setAnalytics(null);
    setSecurityPosture(null);
    setSecurityScan(null);
    setSecurityEvents([]);
    setTestResults(null);
    setBenchmarkResults(null);
    setScenarioResults(null);
  }, []);

  // Master refresh for active tenant
  const refreshAllData = useCallback(async () => {
    if (!currentWorkspace?._id) return;
    await Promise.allSettled([
      fetchClients(),
      fetchProjects(),
      fetchTasks(),
      fetchProposals(),
      fetchInvoices(),
      fetchDocuments(),
      fetchDocumentStats(),
      fetchNotifications(),
      fetchAuditLogs(),
      fetchAnalytics(),
      fetchSecurityPosture(),
      fetchSecurityEvents(),
    ]);
  }, [
    currentWorkspace?._id,
    fetchClients,
    fetchProjects,
    fetchTasks,
    fetchProposals,
    fetchInvoices,
    fetchDocuments,
    fetchDocumentStats,
    fetchNotifications,
    fetchAuditLogs,
    fetchAnalytics,
    fetchSecurityPosture,
    fetchSecurityEvents,
  ]);

  // Auto-reload data when workspace changes or user logs in; reset when logged out
  useEffect(() => {
    if (currentWorkspace?._id && user) {
      refreshAllData();
    } else {
      resetAllData();
    }
  }, [currentWorkspace?._id, user, refreshAllData, resetAllData]);

  const value = {
    // Entities
    clients,
    projects,
    tasks,
    proposals,
    invoices,
    billingSummary,
    documents,
    documentStats,
    notifications,
    unreadNotificationsCount,
    notificationStats,
    auditLogs,
    auditLogStats,
    analytics,
    securityPosture,
    securityScan,
    securityEvents,
    testResults,
    benchmarkResults,
    scenarioResults,
    loadingStates,
    // Methods
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    getClientDetails,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectDetails,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    logTaskTime,
    toggleTaskChecklist,
    getTaskDetails,
    fetchProposals,
    createProposal,
    updateProposal,
    sendProposal,
    signProposal,
    deleteProposal,
    getProposalDetails,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    sendInvoice,
    recordInvoicePayment,
    deleteInvoice,
    getInvoiceDetails,
    fetchDocuments,
    fetchDocumentStats,
    createDocument,
    uploadDocumentFile,
    updateDocument,
    deleteDocument,
    getDocumentDetails,
    fetchNotifications,
    fetchNotificationStats,
    markNotificationAsRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
    createNotification,
    fetchAuditLogs,
    fetchAuditLogStats,
    recordAuditCheckpoint,
    exportAuditLogs,
    fetchAnalytics,
    fetchSecurityPosture,
    runSecurityScan,
    applySecurityRemediation,
    rotateWorkspaceKeys,
    updateIpFirewall,
    fetchSecurityEvents,
    runIntegrationTests,
    runBenchmarkTests,
    runScenarioSimulation,
    exportTestReport,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
