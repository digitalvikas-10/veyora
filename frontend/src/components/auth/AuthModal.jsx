import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  LogIn,
  UserPlus,
  LogOut,
  Building2,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function AuthModal() {
  const { user, workspace, accessToken, login, register, logout } = useAuth();
  const { activeModal, modalPayload, closeModal, addToast } = useUI();
  const { currentWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'session'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regWorkspaceName, setRegWorkspaceName] = useState('');

  useEffect(() => {
    if (modalPayload?.initialTab) {
      setActiveTab(modalPayload.initialTab);
    } else if (user) {
      setActiveTab('login');
    }
  }, [modalPayload, user]);

  if (activeModal !== 'auth') return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await login({ email: loginEmail, password: loginPassword });
      setSuccessMsg('Logged in successfully! Workspace session loaded.');
      addToast({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome back, ${loginEmail}!`,
      });
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        workspaceName: regWorkspaceName,
      });
      setSuccessMsg('Account registered & multi-tenant workspace provisioned successfully!');
      addToast({
        type: 'success',
        title: 'Account Registered',
        message: `Workspace "${regWorkspaceName}" created!`,
      });
      setTimeout(() => closeModal(), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    setSubmitting(true);
    try {
      await logout();
      addToast({
        type: 'info',
        title: 'Signed Out',
        message: 'Your active workspace session has been terminated.',
      });
      setActiveTab('login');
      setSuccessMsg('You have been signed out.');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Sign Out Error',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                VEYORA Identity & Auth
              </h3>
              <p className="text-xs text-neutral-400">
                Sign in to your tenant workspace or register a new account
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-neutral-400 hover:text-neutral-200 text-sm font-bold p-1 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register
          </button>

          {user && (
            <button
              onClick={() => {
                setActiveTab('session');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'session'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Active Session
            </button>
          )}
        </div>

        {/* TAB 1: SIGN IN */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-indigo-400 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                {submitting ? 'Authenticating Session...' : 'Sign In to Workspace'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Work Email Address *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@agency.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                New Tenant Workspace Name *
              </label>
              <input
                type="text"
                required
                value={regWorkspaceName}
                onChange={(e) => setRegWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Operations Agency"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-3"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Creating Workspace...' : 'Register & Provision Workspace'}
            </button>
          </form>
        )}

        {/* TAB 3: ACTIVE SESSION & SIGN OUT */}
        {(activeTab === 'session' || (user && activeTab === 'session')) && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-sm flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-100">{user?.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">{user?.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {user?.role || 'owner'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Active Workspace</span>
                  <span className="font-semibold text-neutral-200 truncate block">{currentWorkspace?.name || 'VEYORA HQ'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Plan Tier</span>
                  <span className="font-mono text-neutral-200 block uppercase">{currentWorkspace?.plan || 'Enterprise'}</span>
                </div>
              </div>
            </div>

            {/* Explicit Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {submitting ? 'Signing Out...' : 'Sign Out of Active Session'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
