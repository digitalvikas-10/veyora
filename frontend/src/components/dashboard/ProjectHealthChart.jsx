import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';
import { FolderKanban } from 'lucide-react';

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 shadow-xl text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span>{data.name}</span>
        </div>
        <div className="mt-1 text-neutral-400">
          Count: <span className="font-mono text-neutral-100 font-semibold">{data.count} projects</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ProjectHealthChart = ({ data = [], loading = false }) => {
  const totalProjects = data.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const activeCount = (data.find((d) => d.name === 'In Progress')?.count || 0) +
                      (data.find((d) => d.name === 'Review')?.count || 0);

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-project-health-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-100">
            Project Stage Distribution
          </CardTitle>
          <Badge variant="primary" size="sm">
            {totalProjects} Total Sprints
          </Badge>
        </div>
        <CardDescription className="text-xs text-neutral-400 mt-0.5">
          Workload lifecycle status across client contracts
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {loading ? (
          <div className="h-44 w-full bg-neutral-900/40 border border-neutral-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="h-36 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={3}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#171717" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-neutral-100 font-mono leading-none">
                  {activeCount}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium mt-0.5">
                  Active
                </span>
              </div>
            </div>

            {/* Custom Horizontal Legend */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-1.5 text-xs">
              {data.map((item, idx) => {
                const percent = totalProjects > 0 ? Math.round((item.count / totalProjects) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-400 text-[11px]">{item.count}</span>
                      <span className="text-[10px] text-neutral-500 w-7 text-right font-mono">
                        {percent}%
                      </span>
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
