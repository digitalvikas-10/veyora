import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../ui';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const CustomAgingTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-lg p-2.5 shadow-xl text-xs">
        <div className="font-semibold text-neutral-200 mb-1">{data.bucket}</div>
        <div className="flex items-center justify-between gap-4 text-neutral-400">
          <span>Unpaid Balance:</span>
          <span className="font-mono font-medium text-neutral-100">
            ${Number(data.amount).toLocaleString('en-US')}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-neutral-400 mt-0.5">
          <span>Invoices:</span>
          <span className="font-mono text-neutral-300">{data.count} items</span>
        </div>
      </div>
    );
  }
  return null;
};

export const AgingMatrixChart = ({ data = [], loading = false }) => {
  const totalReceivables = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const overdueBucket = data.find((b) => b.bucket.includes('90+')) || { amount: 0, count: 0 };
  const overduePercent = totalReceivables > 0 
    ? Math.round((overdueBucket.amount / totalReceivables) * 100) 
    : 0;

  return (
    <Card variant="glass" className="h-full flex flex-col justify-between" id="dashboard-aging-matrix-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-100">
            Accounts Receivable Aging
          </CardTitle>
          {overdueBucket.amount > 0 ? (
            <Badge variant="danger" size="sm" dot>
              ${Number(overdueBucket.amount).toLocaleString()} High Risk
            </Badge>
          ) : (
            <Badge variant="success" size="sm" dot>
              Zero Overdue Exposure
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-neutral-400 mt-0.5">
          Cashflow exposure partitioned by invoice due-date delinquency
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {loading ? (
          <div className="h-44 w-full bg-neutral-900/40 border border-neutral-800 rounded-lg animate-pulse" />
        ) : (
          <>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="bucket" 
                    stroke="#737373" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#737373" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
                  />
                  <Tooltip content={<CustomAgingTooltip />} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Aging Bracket Details */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {data.map((item, idx) => (
                <div key={idx} className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.bucket}</span>
                  </div>
                  <div className="mt-1 font-mono font-semibold text-neutral-200 text-xs">
                    ${Number(item.amount).toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {item.count} invoice{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
