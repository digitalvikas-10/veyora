import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '../ui';
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-lg p-3 shadow-xl backdrop-blur-md text-xs">
        <div className="font-semibold text-neutral-200 mb-2 border-b border-neutral-800 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-neutral-400 font-normal">Monthly Financials</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}:
              </span>
              <span className="font-mono font-medium text-neutral-100">
                ${Number(entry.value).toLocaleString('en-US')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data = [], loading = false }) => {
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  const totalInvoicedPeriod = data.reduce((acc, curr) => acc + (curr.invoiced || 0), 0);
  const totalCollectedPeriod = data.reduce((acc, curr) => acc + (curr.collected || 0), 0);
  const collectionRate = totalInvoicedPeriod > 0 
    ? Math.round((totalCollectedPeriod / totalInvoicedPeriod) * 100) 
    : 78;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-revenue-chart-card">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-neutral-100">
              Revenue & Cashflow Trajectory
            </CardTitle>
            <Badge variant="success" size="sm" dot>
              {collectionRate}% Collection Rate
            </Badge>
          </div>
          <CardDescription className="text-xs text-neutral-400 mt-0.5">
            Comparative trajectory of gross billed contracts vs cash collected
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
          <Button
            size="xs"
            variant={chartType === 'area' ? 'secondary' : 'ghost'}
            onClick={() => setChartType('area')}
            className="h-7 px-2 text-xs"
            icon={<LineChartIcon className="w-3.5 h-3.5" />}
          >
            Area
          </Button>
          <Button
            size="xs"
            variant={chartType === 'bar' ? 'secondary' : 'ghost'}
            onClick={() => setChartType('bar')}
            className="h-7 px-2 text-xs"
            icon={<BarChart3 className="w-3.5 h-3.5" />}
          >
            Bars
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-end">
        {loading ? (
          <div className="h-64 w-full bg-neutral-900/40 border border-neutral-800 rounded-lg animate-pulse flex items-center justify-center text-neutral-600 text-xs">
            Loading telemetry metrics...
          </div>
        ) : (
          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#737373" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#737373" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invoiced" 
                    name="Gross Invoiced" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorInvoiced)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="collected" 
                    name="Collected Cash" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCollected)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#737373" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#737373" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }} 
                  />
                  <Bar dataKey="invoiced" name="Gross Invoiced" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="collected" name="Collected Cash" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
