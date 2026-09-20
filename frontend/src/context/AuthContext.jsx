import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [userWorkspaces, setUserWorkspaces] = useState([]);
  const [accessToken, setAccessTokenState] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const setSession = (userData, workspaceData, token) => {
    setUser(userData);
    setWorkspace(workspaceData);
    if (token) {
      setAccessTokenState(token);
      setAuthToken(token);
    }
    const wsId = workspaceData?._id || userData?.workspaceId;
    if (wsId) {
      sessionStorage.setItem('veyora_active_workspace_id', wsId);
    }
  };

  const clearSession = () => {
    setUser(null);
    setWorkspace(null);
    setUserWorkspaces([]);
    setAccessTokenState(null);
    setUserPermissions([]);
    setAuthToken(null);
    sessionStorage.removeItem('veyora_active_workspace_id');
  };

  // Fetch permissions for currently active user
  const fetchMyPermissions = useCallback(async () => {
    try {
      const res = await api.get('/rbac/my-permissions');
      if (res?.data?.permissions) {
        setUserPermissions(res.data.permissions);
      }
    } catch {
      setUserPermissions([]);
    }
  }, []);

  // Fetch list of all workspaces the user has access to
  const fetchMyWorkspaces = useCallback(async () => {
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
        setUserWorkspaces(normalized);
      }
    } catch {
      setUserWorkspaces([]);
    }
  }, []);

  // Check current session on mount via /auth/me
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setSession(res.data.user, res.data.workspace, null);
        await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
        return;
      }
    } catch (err) {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [fetchMyPermissions, fetchMyWorkspaces]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async ({ name, email, password, workspaceName }) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        workspaceName,
      });
      const { user: newUser, workspace: newWorkspace, accessToken: token } = res.data || {};
      setSession(newUser, newWorkspace, token);
      await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
      return { success: true, user: newUser, workspace: newWorkspace };
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, workspace: userWorkspace, accessToken: token } = res.data || {};
      setSession(loggedInUser, userWorkspace, token);
      await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
      return { success: true, user: loggedInUser, workspace: userWorkspace };
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      clearSession();
    }
  };

  const rotateSession = async () => {
    try {
      const res = await api.post('/auth/refresh-token');
      const newToken = res.data?.accessToken;
      if (newToken) {
        setAccessTokenState(newToken);
        setAuthToken(newToken);
      }
      return res.data;
    } catch (err) {
      clearSession();
      throw err;
    }
  };

  // Instant Persona Switcher for Evaluation & Testing (Phase 4 RBAC)
  const switchPersona = async (targetRole) => {
    setAuthError(null);
    try {
      const res = await api.post('/rbac/switch-persona', { targetRole });
      const { user: newUser, workspace: newWorkspace, accessToken: token } = res.data || {};
      setSession(newUser, newWorkspace, token);
      await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
      return res.data;
    } catch (err) {
      setAuthError(err.message || 'Failed to switch persona');
      throw err;
    }
  };

  // Switch active tenant workspace (Phase 5 Multi-Tenancy)
  const switchWorkspace = async (workspaceId) => {
    setAuthError(null);
    try {
      const res = await api.post('/workspaces/switch', { workspaceId });
      const { workspace: targetWs, accessToken: token, roleInWorkspace } = res.data || {};
      if (targetWs) {
        setWorkspace(targetWs);
        sessionStorage.setItem('veyora_active_workspace_id', targetWs._id);
      }
      if (token) {
        setAccessTokenState(token);
        setAuthToken(token);
      }
      if (user && roleInWorkspace) {
        setUser((prev) => ({ ...prev, role: roleInWorkspace, workspaceId: targetWs._id }));
      }
      await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
      return res.data;
    } catch (err) {
      setAuthError(err.message || 'Failed to switch workspace');
      throw err;
    }
  };

  // Create additional tenant workspace (Phase 5 Multi-Tenancy)
  const createNewWorkspace = async ({ name, plan, currency }) => {
    setAuthError(null);
    try {
      const res = await api.post('/workspaces', { name, plan, currency });
      const { workspace: newWs, accessToken: token } = res.data || {};
      if (newWs) {
        setWorkspace(newWs);
        sessionStorage.setItem('veyora_active_workspace_id', newWs._id);
      }
      if (token) {
        setAccessTokenState(token);
        setAuthToken(token);
      }
      await Promise.allSettled([fetchMyPermissions(), fetchMyWorkspaces()]);
      return res.data;
    } catch (err) {
      setAuthError(err.message || 'Failed to create workspace');
      throw err;
    }
  };

  // Role & Permission Inspection Helpers
  const hasRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  const value = {
    user,
    workspace,
    userWorkspaces,
    accessToken,
    userPermissions,
    loading,
    authError,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    rotateSession,
    switchPersona,
    switchWorkspace,
    createNewWorkspace,
    fetchMyWorkspaces,
    hasRole,
    hasPermission,
    checkAuth,
    refreshPermissions: fetchMyPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
