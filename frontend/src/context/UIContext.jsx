import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  // Toasts
  const [toasts, setToasts] = useState([]);

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Navigation & View
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Global Modal Manager
  const [activeModal, setActiveModal] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);

  // Quick Global Search Filter
  const [globalSearch, setGlobalSearch] = useState('');

  // Toast functions
  const addToast = useCallback(({ title, message, type = 'info', duration = 4500 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, title, message, type, duration, createdAt: Date.now() };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Modal helpers
  const openModal = useCallback((modalName, payload = null) => {
    setActiveModal(modalName);
    setModalPayload(payload);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalPayload(null);
  }, []);

  // Command Palette toggle
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut listener: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette]);

  const value = {
    // Toast system
    toasts,
    addToast,
    removeToast,
    clearToasts,
    // Command Palette
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    toggleCommandPalette,
    // Layout & Navigation
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
    mobileDrawerOpen,
    setMobileDrawerOpen,
    // Modal Manager
    activeModal,
    modalPayload,
    openModal,
    closeModal,
    // Global search
    globalSearch,
    setGlobalSearch,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
