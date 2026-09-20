import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  RotateCw,
  GitBranch,
  ShieldAlert,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ScenarioWorkflowRunner = ({ onRunScenario, scenarioResults }) => {
  const [activeScenario, setActiveScenario] = useState('client_billing_lifecycle');
  const [isRunning, setIsRunning] = useState(false);

  const scenarioPresets = [
    {
      id: 'client_billing_lifecycle',
      name: 'Full Client Onboarding to Payment Settlement',
      description:
        'Registers an enterprise client, drafts a SOW proposal, captures digital e-signature, auto-converts to an active project, tracks milestone tasks, issues tax-calculated invoice, and reconciles paid transaction ledger.',
      icon: FileCheck2,
      badge: 'Revenue & Lifecycle',
      stepsCount: 8,
    },
    {
      id: 'tenant_security_breach_prevention',
      name: 'Cross-Tenant Intrusion & Privilege Escalation Defense',
      description:
        'Simulates malicious token injection from a secondary tenant workspace, verifies strict contextual isolation, trips anti-brute-force rate limiters, and anchors high-severity security incidents.',
      icon: ShieldAlert,
      badge: 'Zero Trust Security',
      stepsCount: 6,
    },
    {
      id: 'compliance_audit_integrity',
      name: 'Immutable Audit Trail & SHA-256 Non-Repudiation Check',
      description:
        'Scans 50 recent administrative state mutations, verifies monotonic chronological sequencing, validates actor IP signatures, and packages SOC 2 Type II audit evidence.',
      icon: Layers,
      badge: 'Compliance & Governance',
      stepsCount: 4,
    },
  ];

  const handleExecute = async (scenarioId) => {
    try {
      setIsRunning(true);
      setActiveScenario(scenarioId);
      await onRunScenario(scenarioId);
    } finally {
      setIsRunning(false);
    }
  };

  const currentPreset = scenarioPresets.find((s) => s.id === activeScenario);
  const activeSteps = scenarioResults?.scenarioId?.toLowerCase().includes(activeScenario.replace(/_/g, '-')) || scenarioResults?.steps
    ? scenarioResults.steps
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          Synthetic End-to-End Scenario Workflows
        </h3>
        <p className="text-sm text-slate-400">
          Run realistic full-lifecycle automated simulations that cross all 20 architectural layers
          in a single orchestrated transaction chain.
        </p>
      </div>

      {/* Scenario Presets Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioPresets.map((preset) => {
          const Icon = preset.icon;
          const isSelected = activeScenario === preset.id;
          return (
            <div
              key={preset.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-500/20">
                    {preset.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">{preset.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[11px] font-mono text-slate-500">
                  {preset.stepsCount} Orchestrated Steps
                </span>
                <button
                  type="button"
                  onClick={() => handleExecute(preset.id)}
                  disabled={isRunning}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all"
                >
                  {isRunning && activeScenario === preset.id ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" /> Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Run Scenario
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario Execution Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Execution Trace: {scenarioResults?.name || currentPreset?.name}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Live step-by-step pipeline output and state machine verification
            </p>
          </div>

          {scenarioResults && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                COMPLETED ({scenarioResults.durationMs}ms)
              </span>
            </div>
          )}
        </div>

        {activeSteps.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            Select a scenario preset above and click &quot;Run Scenario&quot; to inspect the live execution trace.
          </div>
        ) : (
          <div className="space-y-3">
            {activeSteps.map((step) => (
              <div
                key={step.step}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5 sm:mt-0">
                    {step.step}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-white tracking-tight">{step.name}</h5>
                    <p className="text-slate-300 font-mono text-[11px]">{step.output}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-[11px] font-mono text-slate-500">
                    {step.durationMs}ms
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OK
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
