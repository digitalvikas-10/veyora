import React, { useState } from 'react';
import {
  KeyRound,
  UserPlus,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthTester() {
  const {
    user,
    workspace,
    accessToken,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    rotateSession,
    checkAuth,
  } = useAuth();

  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [rotationResult, setRotationResult] = useState(null);
  const [rotating, setRotating] = useState(false);

  // Form State
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState(`alex.${Math.floor(Math.random() * 1000)}@veyora.io`);
  const [password, setPassword] = useState('VeyoraSec#2026');
  const [workspaceName, setWorkspaceName] = useState('Rivera Studio');

  const fillDemoRegister = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setName('Jordan Vance');
    setEmail(`jordan.${randomSuffix}@hyperion.design`);
    setPassword('VeyoraSecure#2026');
    setWorkspaceName('Hyperion Labs');
    setErrorMessage(null);
  };

  const fillDemoLogin = () => {
    if (user?.email) {
      setEmail(user.email);
    }
    setPassword('VeyoraSecure#2026');
    setErrorMessage(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await register({ name, email, password, workspaceName });
      setSuccessMessage('Account registered and tenant workspace created successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Check password requirements.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await login({ email, password });
      setSuccessMessage('Logged in successfully. HTTP-Only cookies set.');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRotate = async () => {
    setRotating(true);
    setRotationResult(null);
    try {
      const res = await rotateSession();
      setRotationResult({
        success: true,
        data: res,
        timestamp: new Date().toLocaleTimeString(),
      });
      setSuccessMessage('Refresh token rotated and fresh access token issued!');
    } catch (err) {
      setRotationResult({
        success: false,
        error: err.message || 'Token rotation failed',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setRotating(false);
    }
  };

  return (
    <div id="phase-3-auth-section" className="space-y-6">
      {/* Phase 3 Header Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-100">
                  Phase 3: Authentication & Token Rotation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Operational
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Stateless JWT access tokens, HTTP-Only secure cookies, single-use refresh token rotation, and multi-tenant workspace initialization.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Session Active ({user?.role})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-950 text-neutral-400 border border-neutral-800">
                <Lock className="w-3 h-3 text-neutral-500" />
                Unauthenticated Guest
              </span>
            )}
          </div>
        </div>

        {/* Security Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              HTTP-Only Cookies
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Defends against XSS token harvesting</p>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Token Rotation
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Revokes reuse & detects token theft</p>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Dual-Token Lifecycles
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">15m Access Token / 7d Refresh Token</p>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
              <Building2 className="w-3.5 h-3.5 text-violet-400" />
              Auto-Tenant Bootstrap
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Initializes workspace on registration</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authenticated State OR Registration/Login Forms */}
        <div className="lg:col-span-7 space-y-4">
          {isAuthenticated ? (
            /* Active User Session Panel */
            <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-100">{user?.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  Sign Out
                </button>
              </div>

              {/* Workspace Details Card */}
              <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-4 h-4 text-violet-400" />
                    Active Tenant Workspace
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                    Plan: {workspace?.plan || 'Starter'}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100">
                      {workspace?.name || 'Primary Workspace'}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      slug: {workspace?.slug || 'workspace-slug'}
                    </p>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    ID: {workspace?._id?.substring(0, 10)}...
                  </span>
                </div>
              </div>

              {/* Token Rotation Control */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-neutral-200">
                    Live Session Management & Token Rotation
                  </h4>
                  <button
                    onClick={checkAuth}
                    disabled={loading}
                    className="text-xs text-neutral-400 hover:text-neutral-200 transition inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Verify /me
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRotate}
                    disabled={rotating}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
                    {rotating ? 'Rotating Tokens...' : 'Trigger Token Rotation (/refresh-token)'}
                  </button>
                </div>

                {rotationResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                      rotationResult.success
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'bg-red-950/40 border-red-800 text-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1.5">
                        {rotationResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        {rotationResult.success
                          ? 'Token Rotation Succeeded — New Pair Issued'
                          : 'Rotation Error'}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {rotationResult.timestamp}
                      </span>
                    </div>
                    <pre className="text-[11px] text-neutral-300 overflow-x-auto pt-1">
                      {JSON.stringify(rotationResult.data || rotationResult.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Auth Form (Register / Login Tabs) */
            <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
              {/* Tab Selector */}
              <div className="flex p-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
                    mode === 'register'
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register & Create Workspace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In to Existing Account
                </button>
              </div>

              {/* Form Body */}
              <form
                onSubmit={mode === 'register' ? handleRegister : handleLogin}
                className="space-y-3.5 pt-1"
              >
                {mode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                    Password (8+ chars, upper, lower, number)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                      Organization / Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Apex Digital Agency"
                      className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMessage && (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50 shadow-sm"
                  >
                    {mode === 'register' ? (
                      <UserPlus className="w-3.5 h-3.5" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    {submitting
                      ? 'Processing...'
                      : mode === 'register'
                      ? 'Create Account & Tenant'
                      : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={mode === 'register' ? fillDemoRegister : fillDemoLogin}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Fill Demo
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Live Diagnostic & Token Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Session & Token Telemetry
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                JWT State
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1">
                <div className="text-neutral-400 font-medium">Access Token Storage:</div>
                <div className="font-mono text-[11px] text-neutral-200 break-all bg-neutral-900/80 p-2 rounded border border-neutral-800">
                  {accessToken ? (
                    <>
                      <span className="text-emerald-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                      <span className="text-neutral-500">[{accessToken.substring(accessToken.length - 12)}]</span>
                    </>
                  ) : (
                    <span className="text-neutral-500 italic">No in-memory access token loaded</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1">
                <div className="text-neutral-400 font-medium">HTTP-Only Cookie Status:</div>
                <div className="font-mono text-[11px] text-neutral-300 flex items-center justify-between">
                  <span>refreshToken (7 days)</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    HttpOnly, SameSite=Lax
                  </span>
                </div>
                <div className="font-mono text-[11px] text-neutral-300 flex items-center justify-between pt-1">
                  <span>accessToken (15 mins)</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    HttpOnly & In-Memory
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 space-y-1">
                <div className="text-neutral-400 font-medium">Multi-Tenant Header:</div>
                <div className="font-mono text-[11px] text-neutral-300 flex items-center justify-between">
                  <span>X-Workspace-Id:</span>
                  <span className="text-violet-400 font-semibold">
                    {workspace?._id || user?.workspaceId || 'None assigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
