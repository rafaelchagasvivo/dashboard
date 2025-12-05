import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';

interface AverageDurationChartProps {
  data: ProjectData[];
  theme: Theme;
}

export const AverageDurationChart: React.FC<AverageDurationChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const durationSums: Record<string, number> = {};
    const durationCounts: Record<string, number> = {};

    // Standard order of stages
    const standardStages = ['Discovery', 'Desenvolvimento', 'Homologação', 'Implantação', 'Delivery'];

    data.forEach(project => {
      Object.entries(project.stageDurations).forEach(([stage, val]) => {
        const days = val as number;
        if (days > 0) {
            durationSums[stage] = (durationSums[stage] || 0) + days;
            durationCounts[stage] = (durationCounts[stage] || 0) + 1;
        }
      });
    });

    // Calculate Averages
    const result = Object.keys(durationSums).map(stage => ({
      stage,
      avgDays: Math.round(durationSums[stage] / durationCounts[stage])
    }));

    // Sort by standard workflow order
    result.sort((a, b) => {
        const idxA = standardStages.indexOf(a.stage);
        const idxB = standardStages.indexOf(b.stage);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return result;
  }, [data]);

  const isVivo = theme === 'vivo';
  const isDark = theme === 'dark' || theme === 'vivo';

  const gridColor = isVivo ? '#703385' : (isDark ? '#334155' : '#e2e8f0');
  const axisColor = isVivo ? '#BD4AFF' : (isDark ? '#94a3b8' : '#64748b');
  const tooltipBg = isVivo ? '#380054' : (isDark ? '#1e293b' : '#ffffff');
  const tooltipText = isVivo ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b');
  const tooltipBorder = isVivo ? '#BD4AFF' : gridColor;
  
  // Color for the static labels inside/next to bars
  const labelColor = isVivo ? '#BD4AFF' : (isDark ? '#e2e8f0' : '#475569');

  return (
    <div className={clsx(
        "p-6 rounded-xl shadow-sm border h-[300px] transition-colors",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className="mb-4">
        <h3 className={clsx("text-lg font-bold", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>Duração Média por Etapa</h3>
        <p className={clsx("text-xs", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Média em dias calculada via cronograma.</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="stage" 
            type="category" 
            width={100} 
            tick={{ fontSize: 11, fill: axisColor }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: isVivo ? '#4a1d63' : (isDark ? '#334155' : '#f1f5f9') }}
            contentStyle={{ 
              backgroundColor: tooltipBg,
              color: tooltipText,
              borderRadius: '8px', 
              border: `1px solid ${tooltipBorder}`,
            }}
            itemStyle={{ color: tooltipText }}
            formatter={(value: number) => [`${value} dias`, 'Média']}
          />
          <Bar dataKey="avgDays" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={isVivo ? '#EB3C7D' : (isDark ? '#0ea5e9' : '#0284c7')} />
            ))}
            <LabelList 
                dataKey="avgDays" 
                position="right" 
                fill={labelColor} 
                fontSize={12} 
                fontWeight="bold"
                formatter={(val: number) => `${val} d`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};