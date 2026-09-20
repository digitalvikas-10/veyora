import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';
import { CheckCircle2, Zap, Flame, Clock } from 'lucide-react';

export const SprintVelocityChart = ({ taskPriorityData = [], kpis, loading = false }) => {
  const totalTasks = kpis?.totalTasks || 18;
  const completedRate = kpis?.completionRate || 68;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-sprint-velocity-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-100 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Sprint Velocity & Triage
          </CardTitle>
          <Badge variant="warning" size="sm">
            {completedRate}% Velocity
          </Badge>
        </div>
        <CardDescription className="text-xs text-neutral-400 mt-0.5">
          Workload throughput and ticket urgency breakdown
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {loading ? (
          <div className="h-44 w-full bg-neutral-900/40 border border-neutral-800 rounded-lg animate-pulse" />
        ) : (
          <>
            {/* Velocity Overview Progress */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-neutral-300 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Active Sprint Burndown
                </span>
                <span className="font-mono text-neutral-400">
                  {kpis?.openTasks || 7} open / {totalTasks} total
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completedRate}%` }} 
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500">
                <span>Kickoff</span>
                <span className="font-medium text-emerald-400">{completedRate}% target reached</span>
                <span>Release</span>
              </div>
            </div>

            {/* Priority Distribution Bars */}
            <div className="mt-3 space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Workload Priority Allocation
              </div>
              {taskPriorityData.map((item, idx) => {
                const percent = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.priority}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-neutral-300 font-medium">{item.count}</span>
                        <span className="text-neutral-500 w-7 text-right">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-800/80 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%`, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
