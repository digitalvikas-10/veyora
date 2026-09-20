import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { workspace: authWorkspace, user, switchWorkspace: authSwitchWorkspace } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(authWorkspace);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceStats, setWorkspaceStats] = useState({
    clientCount: 0,
    projectCount: 0,
    activeTasks: 0,
    monthlyRevenue: 0,
  });

  // Sync with AuthContext workspace changes
  useEffect(() => {
    setCurrentWorkspace(authWorkspace || null);
  }, [authWorkspace]);

  // Fetch all accessible workspaces
  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await api.get('/workspaces/my-workspaces');
      if (res?.data?.workspaces) {
        const normalized = res.data.workspaces.map((item) => {
          if (item?.workspace) {
            return {
              ...item.workspace,
              role: item.role,
              isOwner: item.isOwner,
              isActiveTenant: item.isActiveTenant,
            };
          }
          return item;
        });
        setWorkspaces(normalized);
      }
    } catch (err) {
      console.warn('Failed to fetch workspaces:', err);
    }
  }, []);

  // Fetch members for active workspace
  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace?._id) return;

    try {
      const res = await api.get('/workspaces/members');
      if (res?.data?.members) {
        setMembers(res.data.members);
      }
    } catch {
      // Fallback if endpoint error
      setMembers([]);
    }
  }, [currentWorkspace?._id]);

  // Fetch quick metrics for active workspace
  const fetchWorkspaceStats = useCallback(async () => {
    if (!currentWorkspace?._id) return;
    try {
      const [clientsRes, projectsRes, tasksRes, invoicesRes] = await Promise.allSettled([
        api.get('/clients?limit=1'),
        api.get('/projects?limit=1'),
        api.get('/tasks?status=in_progress&limit=1'),
        api.get('/invoices?limit=1'),
      ]);

      setWorkspaceStats({
        clientCount: clientsRes.status === 'fulfilled' ? clientsRes.value?.data?.total || 0 : 0,
        projectCount: projectsRes.status === 'fulfilled' ? projectsRes.value?.data?.total || 0 : 0,
        activeTasks: tasksRes.status === 'fulfilled' ? tasksRes.value?.data?.total || 0 : 0,
        monthlyRevenue: invoicesRes.status === 'fulfilled' ? invoicesRes.value?.data?.billingSummary?.totalRevenue || 0 : 0,
      });
    } catch {
      // Non-blocking
    }
  }, [currentWorkspace?._id]);

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setMembers([]);
      setWorkspaceStats({ clientCount: 0, projectCount: 0, activeTasks: 0, monthlyRevenue: 0 });
    }
  }, [user, fetchWorkspaces]);

  useEffect(() => {
    if (currentWorkspace?._id && user) {
      fetchMembers();
      fetchWorkspaceStats();
    } else {
      setMembers([]);
      setWorkspaceStats({ clientCount: 0, projectCount: 0, activeTasks: 0, monthlyRevenue: 0 });
    }
  }, [currentWorkspace?._id, user, fetchMembers, fetchWorkspaceStats]);

  // Switch workspace
  const changeWorkspace = async (workspaceId) => {
    if (!workspaceId || workspaceId === currentWorkspace?._id) return;
    setIsLoading(true);
    try {
      const res = await authSwitchWorkspace(workspaceId);
      if (res?.workspace) {
        setCurrentWorkspace(res.workspace);
      }
      await Promise.allSettled([fetchWorkspaces(), fetchMembers(), fetchWorkspaceStats()]);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  // Invite member to current workspace
  const inviteMember = async ({ name, email, role = 'member', password }) => {
    if (!currentWorkspace?._id) throw new Error('No active workspace selected');

    const res = await api.post('/workspaces/members/invite', { name, email, role, password });
    await fetchMembers();
    return res;
  };

  // Update current workspace settings
  const updateWorkspaceSettings = async (settings) => {
    const wsId = currentWorkspace?._id;
    if (!wsId) throw new Error('No active workspace selected');

    const res = await api.patch(`/workspaces/${wsId}`, settings);
    if (res?.data?.workspace) {
      setCurrentWorkspace(res.data.workspace);
    }
    await fetchWorkspaces();
    return res;
  };

  const value = {
    currentWorkspace,
    workspaces,
    members,
    workspaceStats,
    isLoading,
    changeWorkspace,
    fetchWorkspaces,
    fetchMembers,
    fetchWorkspaceStats,
    inviteMember,
    updateWorkspaceSettings,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
