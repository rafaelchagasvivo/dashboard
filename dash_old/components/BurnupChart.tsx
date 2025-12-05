import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { format, isAfter, isBefore, eachMonthOfInterval, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';

interface BurnupChartProps {
  data: ProjectData[];
  theme: Theme;
}

export const BurnupChart: React.FC<BurnupChartProps> = ({ data, theme }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Flatten all tasks
    const allTasks = data.flatMap(p => p.tasks || []);
    if (allTasks.length === 0) return [];

    // Find range
    const timestamps = allTasks
        .flatMap(t => [t.plannedEnd, t.actualEnd])
        .filter((t): t is number => t !== null && t > 0);

    if (timestamps.length === 0) return [];

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    const start = new Date(minTime);
    start.setDate(1); // Start of month
    
    // Add buffer for forecast
    const end = addMonths(new Date(maxTime), 3); 

    const months = eachMonthOfInterval({ start, end });
    const now = new Date();

    const totalScopeCount = allTasks.length;

    // Linear Regression Helpers for Forecast
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    let n = 0;

    const points = months.map((month, index) => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59);

      // Baseline: Count tasks where plannedEnd <= monthEnd
      const baseline = allTasks.filter(t => t.plannedEnd && t.plannedEnd <= monthEnd.getTime()).length;

      // Actual: Count tasks where actualEnd <= monthEnd AND progress ~100%
      const isPastOrCurrent = isBefore(month, now) || month.getMonth() === now.getMonth();
      
      let realized: number | null = null;
      
      if (isPastOrCurrent) {
        realized = allTasks.filter(t => t.actualEnd && t.actualEnd <= monthEnd.getTime() && t.progress >= 99).length;
        
        // Add to regression calc
        n++;
        sumX += index;
        sumY += realized;
        sumXY += index * realized;
        sumXX += index * index;
      }

      return {
        index,
        date: month.toISOString(),
        displayDate: format(month, 'MMM/yy', { locale: ptBR }),
        baseline,
        realized,
        total: totalScopeCount
      };
    });

    // Calculate Slope (m) and Intercept (b) for Forecast
    let slope = 0;
    let intercept = 0;
    if (n > 1) {
        slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        intercept = (sumY - slope * sumX) / n;
    }

    return points.map(p => {
        let forecast: number | null = null;
        if (p.realized === null && slope > 0) {
            forecast = Math.min(Math.round(slope * p.index + intercept), p.total);
            if (forecast < 0) forecast = 0;
        }
        return {
            ...p,
            forecast
        };
    });

  }, [data]);

  const isVivo = theme === 'vivo';
  const isDark = theme === 'dark' || theme === 'vivo';

  const gridColor = isVivo ? '#703385' : (isDark ? '#334155' : '#e2e8f0');
  const axisColor = isVivo ? '#BD4AFF' : (isDark ? '#94a3b8' : '#64748b');
  const tooltipBg = isVivo ? '#380054' : (isDark ? '#1e293b' : '#ffffff');
  const tooltipText = isVivo ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b');
  const tooltipBorder = isVivo ? '#BD4AFF' : gridColor;

  return (
    <div className={clsx(
        "p-6 rounded-xl shadow-sm border h-[400px] transition-colors",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className="flex justify-between items-center mb-6">
        <h3 className={clsx("text-lg font-bold", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>Burnup de Entregas (Tarefas)</h3>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12, fill: axisColor }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: axisColor }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBg,
              color: tooltipText,
              borderRadius: '8px', 
              border: `1px solid ${tooltipBorder}`,
            }}
            itemStyle={{ color: tooltipText }}
            labelStyle={{ color: axisColor }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          <Line 
            name="Plano Base"
            type="monotone" 
            dataKey="baseline" 
            stroke={isVivo ? "#BD4AFF" : (isDark ? "#94a3b8" : "#64748b")} 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Line 
            name="Realizado"
            type="monotone" 
            dataKey="realized" 
            stroke={isVivo ? "#B2D682" : "#10b981"} 
            strokeWidth={3} 
            dot={{ r: 4 }}
          />

          <Line 
            name="Previsão"
            type="monotone" 
            dataKey="forecast" 
            stroke={isVivo ? "#FF9900" : "#f59e0b"} 
            strokeDasharray="5 5"
            strokeWidth={2} 
            dot={false}
          />
          
          <ReferenceLine y={chartData[0]?.total} label="" stroke={gridColor} strokeDasharray="3 3" />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};