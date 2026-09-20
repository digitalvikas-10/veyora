import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  GlobeLock,
  KeyRound,
  History,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SecurityScorecard } from './SecurityScorecard';
import { SecurityPostureMatrix } from './SecurityPostureMatrix';
import { SecurityScanner } from './SecurityScanner';
import { IpFirewallManager } from './IpFirewallManager';
import { SessionKeyTerminal } from './SessionKeyTerminal';
import { SecurityEventFeed } from './SecurityEventFeed';

export const SecurityManager = () => {
  const {
    securityPosture,
    securityScan,
    securityEvents,
    loadingStates,
    fetchSecurityPosture,
    runSecurityScan,
    applySecurityRemediation,
    rotateWorkspaceKeys,
    updateIpFirewall,
    fetchSecurityEvents,
  } = useData();

  const [activeTab, setActiveTab] = useState('posture');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchSecurityPosture();
    fetchSecurityEvents();
  }, [fetchSecurityPosture, fetchSecurityEvents]);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await runSecurityScan();
      setActiveTab('scanner');
    } finally {
      setIsScanning(false);
    }
  };

  const tabs = [
    {
      id: 'posture',
      label: 'Security Posture',
      icon: ShieldCheck,
      badge: `${securityPosture?.overallScore ?? 98}/100`,
    },
    {
      id: 'scanner',
      label: 'Vulnerability Scanner',
      icon: ShieldAlert,
      badge: securityScan?.summary?.totalFindings ? `${securityScan.summary.totalFindings} Findings` : null,
    },
    {
      id: 'firewall',
      label: 'IP Perimeter Firewall',
      icon: GlobeLock,
    },
    {
      id: 'keys',
      label: 'Session & Cryptography',
      icon: KeyRound,
    },
    {
      id: 'events',
      label: 'Security Incident Stream',
      icon: History,
      badge: securityEvents?.length ? `${securityEvents.length}` : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Security & Hardening
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Shield Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time defense monitoring, multi-tenant cryptographic isolation, NoSQL injection
            shield, and automated compliance auditing.
          </p>
        </div>

        <button
          onClick={() => {
            fetchSecurityPosture();
            fetchSecurityEvents();
          }}
          disabled={loadingStates.security}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStates.security ? 'animate-spin' : ''}`} />
          Refresh Defense Telemetry
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span
                  className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab View Content */}
      <div className="pt-2">
        {activeTab === 'posture' && (
          <div className="space-y-8">
            <SecurityScorecard
              posture={securityPosture}
              onRunScan={handleTriggerScan}
              onRotateKeys={rotateWorkspaceKeys}
              onOpenFirewall={() => setActiveTab('firewall')}
              isScanning={isScanning}
            />
            <SecurityPostureMatrix checks={securityPosture?.checks || []} />
          </div>
        )}

        {activeTab === 'scanner' && (
          <SecurityScanner
            scanResults={securityScan}
            onRunScan={handleTriggerScan}
            onRemediate={applySecurityRemediation}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'firewall' && (
          <IpFirewallManager
            firewall={securityPosture?.firewall}
            onUpdateFirewall={updateIpFirewall}
          />
        )}

        {activeTab === 'keys' && (
          <SessionKeyTerminal
            keyRotation={securityPosture?.keyRotation}
            onRotateKeys={rotateWorkspaceKeys}
          />
        )}

        {activeTab === 'events' && (
          <SecurityEventFeed events={securityEvents} />
        )}
      </div>
    </div>
  );
};
