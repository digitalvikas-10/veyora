import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function PhaseTracker() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectResult, setReconnectResult] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setHealthError(null);
    try {
      const res = await api.get('/health');
      if (res?.data) {
        setHealthData(res.data);
      }
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('API health check notice:', err);
      setHealthError(err.message || 'Unable to connect to API server');
    } finally {
      setLoading(false);
    }
  };

  const handlePing = async () => {
    setPinging(true);
    const start = performance.now();
    try {
      const res = await api.get('/health/ping');
      const duration = Math.round(performance.now() - start);
      setPingResult({
        success: true,
        duration,
        timestamp: new Date().toLocaleTimeString(),
        data: res,
      });
    } catch (err) {
      setPingResult({
        success: false,
        error: err.message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setPinging(false);
    }
  };

  const handleReconnectDB = async () => {
    setReconnecting(true);
    setReconnectResult(null);
    try {
      const res = await api.post('/health/reconnect-db');
      setReconnectResult({
        success: res.data?.isConnected,
        message: res.message,
        data: res.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      await fetchHealth();
    } catch (err) {
      setReconnectResult({
        success: false,
        message: err.message || 'Failed to trigger database reconnection',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setReconnecting(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div id="phase-tracker" className="space-y-6">
      {/* Realtime Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Express Server Node */}
        <div id="card-server-status" className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">Express Backend</h4>
                <p className="text-xs text-neutral-400">Node.js + Express.js API</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
          <div className="text-xs text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
            <div className="flex justify-between">
              <span>Port / Protocol:</span>
              <span className="font-mono text-neutral-300">3000 / HTTP/1.1</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-mono text-neutral-300">
                {healthData ? `${healthData.uptimeSeconds}s` : 'Calculating...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base API Route:</span>
              <span className="font-mono text-indigo-400">/api/v1</span>
            </div>
          </div>
        </div>

        {/* MongoDB Status Node */}
        <div id="card-db-status" className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  healthData?.database?.status === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">MongoDB Database</h4>
                  <p className="text-xs text-neutral-400">Mongoose ODM Manager</p>
                </div>
              </div>
              {healthData?.database?.status === 'connected' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {healthData?.database?.status === 'pending_configuration' ? 'Action Required' : 'Offline / Setup'}
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
              <div className="flex justify-between">
                <span>Connection State:</span>
                <span className="font-mono text-neutral-300">
                  {healthData?.database?.status || 'Checking...'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed pt-1">
                {healthData?.database?.note || 'Provide MONGODB_URI in Settings to connect live database.'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2">
            <button
              id="btn-reconnect-db"
              onClick={handleReconnectDB}
              disabled={reconnecting}
              className="w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${reconnecting ? 'animate-spin text-amber-400' : ''}`} />
              {reconnecting ? 'Testing Connection...' : 'Test / Reconnect DB'}
            </button>
          </div>
        </div>

        {/* Frontend Vite Runtime Node */}
        <div id="card-frontend-status" className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-200">Vite React Frontend</h4>
                <p className="text-xs text-neutral-400">Tailwind + JavaScript</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>
          <div className="text-xs text-neutral-400 space-y-1 pt-2 border-t border-neutral-800">
            <div className="flex justify-between">
              <span>Stack:</span>
              <span className="text-neutral-300">React + Tailwind CSS</span>
            </div>
            <div className="flex justify-between">
              <span>Language:</span>
              <span className="text-neutral-300 font-mono">JavaScript (No TS)</span>
            </div>
            <div className="flex justify-between">
              <span>Last Health Sync:</span>
              <span className="text-neutral-300 font-mono">{lastChecked || 'Just now'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live API Tester & Response Explorer */}
      <div id="api-diagnostic-section" className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Live API Health Diagnostic
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Testing communication from the React frontend client through Axios to the Express backend API.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-refresh-health"
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 text-neutral-200 hover:bg-neutral-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Health
            </button>
            <button
              id="btn-test-ping"
              onClick={handlePing}
              disabled={pinging}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
            >
              <Terminal className="w-3.5 h-3.5" />
              {pinging ? 'Pinging...' : 'Ping /api/v1/health/ping'}
            </button>
          </div>
        </div>

        {healthError && (
          <div className="p-3.5 rounded-lg border border-red-800/80 bg-red-950/40 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Backend connection status: {healthError}</span>
            </div>
            <button
              onClick={fetchHealth}
              className="px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-100 rounded text-xs font-medium transition"
            >
              Retry
            </button>
          </div>
        )}

        {reconnectResult && (
          <div className={`p-3.5 rounded-lg border text-xs font-mono space-y-1 ${
            reconnectResult.success
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-amber-950/40 border-amber-800 text-amber-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                {reconnectResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {reconnectResult.message}
              </span>
              <span className="text-neutral-400">{reconnectResult.timestamp}</span>
            </div>
            {reconnectResult.data?.error && (
              <p className="text-[11px] text-red-300 mt-1">{reconnectResult.data.error}</p>
            )}
            {reconnectResult.data?.recommendation && (
              <p className="text-[11px] text-amber-200/90 mt-1 font-sans">{reconnectResult.data.recommendation}</p>
            )}
          </div>
        )}

        {/* MongoDB Atlas IP Whitelist Setup Guide Banner if not connected */}
        {healthData?.database?.status !== 'connected' && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              MongoDB Atlas IP Whitelist Requirement
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              If your database is hosted on MongoDB Atlas, cloud deployment containers have dynamic outbound IP addresses. Atlas blocks all connections by default unless whitelist access is enabled:
            </p>
            <ol className="text-xs text-neutral-300 list-decimal list-inside space-y-1 pl-1 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
              <li>Log in to your <span className="font-semibold text-white">MongoDB Atlas Console</span>.</li>
              <li>Under <span className="text-amber-300 font-semibold">Security</span> in the left sidebar, click <span className="font-semibold text-white">Network Access</span>.</li>
              <li>Click the green <span className="font-semibold text-white">Add IP Address</span> button.</li>
              <li>Click <span className="font-semibold text-emerald-400">Allow Access From Anywhere</span> (enters <code className="bg-neutral-800 px-1 py-0.5 rounded text-amber-300 font-mono">0.0.0.0/0</code>) and click Confirm.</li>
              <li>Return here and click the <span className="font-semibold text-indigo-400">"Test / Reconnect DB"</span> button to verify.</li>
            </ol>
          </div>
        )}

        {pingResult && (
          <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                ✓ HTTP 200 OK — Ping successful ({pingResult.duration}ms)
              </span>
              <span className="text-neutral-400">{pingResult.timestamp}</span>
            </div>
            <pre className="text-neutral-300 overflow-x-auto text-[11px] pt-1">
              {JSON.stringify(pingResult.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Live Raw Health Payload Display */}
        <div className="mt-4">
          <div className="text-xs font-medium text-neutral-400 mb-1.5 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            Payload Response: <span className="font-mono text-neutral-300">GET /api/v1/health</span>
          </div>
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono overflow-x-auto text-neutral-300">
            {healthData ? (
              <pre>{JSON.stringify(healthData, null, 2)}</pre>
            ) : (
              <span className="text-neutral-400">Loading system status...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
