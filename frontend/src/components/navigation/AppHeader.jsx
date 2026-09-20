import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useUI } from '../../context/UIContext';
import { useData } from '../../context/DataContext';
import {
  Building2,
  ChevronDown,
  Search,
  Bell,
  Shield,
  Check,
  Plus,
  Command,
  User,
  Sparkles,
  ExternalLink,
  LogIn,
  LogOut,
  UserPlus,
  KeyRound,
} from 'lucide-react';

const PERSONAS = [
  { role: 'owner', name: 'Olivia Vance', label: 'Owner', weight: 80, badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { role: 'admin', name: 'Arthur Sterling', label: 'Admin', weight: 60, badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { role: 'member', name: 'Maya Lin', label: 'Member', weight: 40, badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { role: 'client', name: 'Claire Dupont', label: 'Client', weight: 20, badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { role: 'viewer', name: 'Victor Reed', label: 'Viewer', weight: 10, badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
];

export default function AppHeader() {
  const { user, switchPersona, logout } = useAuth();
  const { currentWorkspace, workspaces, changeWorkspace } = useWorkspace();
  const { toggleCommandPalette, openModal, addToast } = useUI();
  const { notifications, unreadNotificationsCount, markAllNotificationsRead } = useData();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const wsMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const personaMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wsMenuRef.current && !wsMenuRef.current.contains(e.target)) {
        setWorkspaceMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
      if (personaMenuRef.current && !personaMenuRef.current.contains(e.target)) {
        setPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPersona = PERSONAS.find((p) => p.role === user?.role) || PERSONAS[0];

  const handleSelectWorkspace = async (wsId) => {
    setWorkspaceMenuOpen(false);
    try {
      await changeWorkspace(wsId);
      addToast({
        type: 'success',
        title: 'Workspace Switched',
        message: 'Active workspace context updated.',
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Switch Failed',
        message: err.message,
      });
    }
  };

  const handleSelectPersona = async (role) => {
    setPersonaMenuOpen(false);
    try {
      await switchPersona(role);
      addToast({
        type: 'info',
        title: 'Persona Changed',
        message: `Now acting with ${role.toUpperCase()} permissions.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Persona Switch Error',
        message: err.message,
      });
    }
  };

  return (
    <header className="h-16 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Brand & Workspace Switcher */}
      <div className="flex items-center gap-3">
        {/* Workspace Dropdown */}
        <div className="relative" ref={wsMenuRef}>
          <button
            onClick={() => setWorkspaceMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition text-left text-xs text-neutral-200"
          >
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 max-w-[140px] sm:max-w-[200px]">
              <span className="font-semibold block truncate">
                {currentWorkspace?.name || 'VEYORA HQ'}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono block">
                {currentWorkspace?.plan?.toUpperCase() || 'ENTERPRISE'} PLAN
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Workspaces ({workspaces.length})
              </div>
              {workspaces.map((wsItem, idx) => {
                const ws = wsItem?.workspace || wsItem;
                const wsId = ws?._id || ws?.id || wsItem?._id || wsItem?.id || `ws-${idx}`;
                const wsName = ws?.name || wsItem?.name || 'Workspace';
                const wsSlug = ws?.slug || wsItem?.slug || 'workspace';
                const wsPlan = ws?.plan || wsItem?.plan || 'ENTERPRISE';
                const isSelected = wsId === (currentWorkspace?._id || currentWorkspace?.id);
                return (
                  <button
                    key={wsId}
                    onClick={() => handleSelectWorkspace(wsId)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition text-left ${
                      isSelected
                        ? 'bg-indigo-600/15 text-indigo-300 font-medium border border-indigo-500/30'
                        : 'text-neutral-300 hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="truncate">
                      <span className="block truncate">{wsName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {wsSlug} • {wsPlan}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-auto">
        <button
          onClick={toggleCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-400 transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span>Search clients, projects, tasks, invoices...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 text-neutral-400">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Controls: Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Fast Role Switcher Popover - Only when authenticated */}
        {user && (
          <div className="relative" ref={personaMenuRef}>
            <button
              onClick={() => setPersonaMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${currentPersona.badge}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{user?.name || currentPersona.name}</span>
              <span className="text-[10px] opacity-80 uppercase font-mono">
                ({user?.role || currentPersona.label})
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 space-y-1 z-50">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                  Active User Role
                </div>
                <div className="px-2.5 py-2 text-xs text-neutral-300">
                  <span className="block font-semibold">{user.name}</span>
                  <span className="text-[10px] text-neutral-500 font-mono">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Bell - Only when authenticated */}
        {user && (
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setNotifMenuOpen((prev) => !prev)}
              className="relative p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-neutral-100 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-neutral-900 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 space-y-2 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-200">
                    <Bell className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Workspace Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 text-xs">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-neutral-500">
                      No active notifications in workspace feed.
                    </p>
                  ) : (
                    notifications.slice(0, 6).map((n, idx) => (
                      <div
                        key={n._id || n.id || `notif-${idx}`}
                        className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 text-neutral-300 text-xs"
                      >
                        <div className="font-bold text-neutral-200">{n.title}</div>
                        <span className="block text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{n.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign In & Sign Out Action Buttons */}
        <div className="flex items-center gap-1.5 border-l border-neutral-800 pl-2 sm:pl-3">
          {!user ? (
            <button
              onClick={() => openModal('auth', { initialTab: 'login' })}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-indigo-600/20"
              title="Sign In to VEYORA"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  await logout();
                  addToast({
                    type: 'info',
                    title: 'Signed Out',
                    message: 'You have been signed out.',
                  });
                } catch (err) {
                  addToast({
                    type: 'error',
                    title: 'Sign Out Error',
                    message: err.message,
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
              title="Sign Out of Active Workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
