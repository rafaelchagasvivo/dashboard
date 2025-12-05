
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';

interface GanttChartProps {
  data: ProjectData[];
  theme: Theme;
  singleProjectMode: boolean; // Se true, mostra tarefas. Se false, mostra projetos.
}

export const GanttChart: React.FC<GanttChartProps> = ({ data, theme, singleProjectMode }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    let rawItems = [];

    if (singleProjectMode && data.length === 1) {
        // Modo Detalhado: Tarefas do Projeto
        const project = data[0];
        rawItems = project.tasks
            .filter(t => t.startDate && t.plannedEnd)
            .map(t => ({
                name: t.name,
                subtitle: '',
                start: t.startDate!,
                end: t.plannedEnd!,
                duration: t.duration,
                progress: t.progress,
                status: t.progress === 100 ? 'Concluído' : 'Pendente'
            }));
    } else {
        // Modo Global: Lista de Projetos
        rawItems = data
            .filter(p => p.startDate && p.baselineDate)
            .map(p => {
                // Montar subtítulo completo
                const parts = [];
                if (p.squad) parts.push(p.squad);
                if (p.factory) parts.push(p.factory);
                if (p.developer) parts.push(`Dev: ${p.developer.split(' ')[0]}`); // Primeiro nome
                if (p.analyst) parts.push(`AF: ${p.analyst.split(' ')[0]}`);
                if (p.architect) parts.push(`Arq: ${p.architect.split(' ')[0]}`);
                
                return {
                    name: p.name,
                    subtitle: parts.join(' • '), // Ex: Squad A • Dev: João • AF: Maria
                    start: p.startDate!.getTime(),
                    end: p.baselineDate!.getTime(),
                    duration: 0,
                    progress: p.status === 'Concluído' ? 100 : 0,
                    status: p.status
                };
            });
    }

    if (rawItems.length === 0) return [];

    const minTime = Math.min(...rawItems.map(i => i.start));
    
    return rawItems.map(item => ({
        ...item,
        placeholder: item.start - minTime, 
        barSize: item.end - item.start,
        displayStart: format(new Date(item.start), 'dd/MM/yy'),
        displayEnd: format(new Date(item.end), 'dd/MM/yy')
    })).sort((a, b) => a.start - b.start);

  }, [data, singleProjectMode]);

  const isVivo = theme === 'vivo';
  const isDark = theme === 'dark' || theme === 'vivo';

  const gridColor = isVivo ? '#703385' : (isDark ? '#334155' : '#e2e8f0');
  const axisColor = isVivo ? '#BD4AFF' : (isDark ? '#94a3b8' : '#64748b');
  const subTextColor = isVivo ? '#BD4AFF' : (isDark ? '#64748b' : '#94a3b8'); // Cor mais fraca para o subtítulo
  const tooltipBg = isVivo ? '#380054' : (isDark ? '#1e293b' : '#ffffff');
  const tooltipText = isVivo ? '#ffffff' : (isDark ? '#f1f5f9' : '#1e293b');
  const tooltipBorder = isVivo ? '#BD4AFF' : gridColor;

  const getBarColor = (status: string, progress: number) => {
    if (isVivo) {
        if (status === 'Concluído' || progress === 100) return '#B2D682'; // Menta
        if (status === 'Atrasado') return '#FF9900'; // Laranja
        return '#BD4AFF'; // Lilas
    }
    if (status === 'Concluído' || progress === 100) return '#10b981'; // Emerald
    if (status === 'Atrasado') return '#ef4444'; // Red
    return '#3b82f6'; // Blue
  };

  const currentMinTime = useMemo(() => {
     if (chartData.length === 0) return 0;
     return Math.min(...chartData.map(c => c.start));
  }, [chartData]);

  // Componente customizado para o Eixo Y
  const CustomYAxisTick = ({ x, y, payload }: any) => {
      // payload.index nos dá o índice no array de dados atual do gráfico
      const item = chartData[payload.index];
      const hasSubtitle = item && item.subtitle;

      return (
          <g transform={`translate(${x},${y})`}>
              <text 
                x={0} 
                y={0} 
                dy={hasSubtitle ? -5 : 4} // Sobe um pouco se tiver subtítulo
                textAnchor="end" 
                fill={axisColor} 
                fontSize={11} 
                fontWeight={500}
              >
                  {payload.value.length > 20 ? payload.value.substring(0, 20) + '...' : payload.value}
              </text>
              {hasSubtitle && (
                  <text 
                    x={0} 
                    y={0} 
                    dy={8} // Linha de baixo
                    textAnchor="end" 
                    fill={subTextColor} 
                    fontSize={9}
                    opacity={0.8}
                  >
                      {item.subtitle.length > 30 ? item.subtitle.substring(0, 30) + '...' : item.subtitle}
                  </text>
              )}
          </g>
      );
  };

  if (chartData.length === 0) {
      return (
        <div className={clsx(
            "p-6 rounded-xl shadow-sm border h-[400px] flex items-center justify-center transition-colors",
            isVivo ? "bg-vivo-roxo border-vivo-lilas/20 text-white/50" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
        )}>
            Sem dados de cronograma disponíveis para visualização.
        </div>
      );
  }

  return (
    <div className={clsx(
        "p-6 rounded-xl shadow-sm border h-[500px] flex flex-col transition-colors",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className={clsx("text-lg font-bold", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>
                {singleProjectMode ? `Cronograma Detalhado: ${data[0].name}` : "Cronograma Macro Consolidado"}
            </h3>
            <p className={clsx("text-xs", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>
                {singleProjectMode ? "Visualização de tarefas e etapas" : "Visualização macro e equipe"}
            </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={chartData}
            layout="vertical"
            barSize={20}
            margin={{ top: 0, right: 30, left: 10, bottom: 20 }}
        >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            
            <XAxis 
                type="number" 
                hide={false}
                tickFormatter={(val) => {
                    const date = new Date(val + currentMinTime);
                    return format(date, 'dd/MM');
                }}
                domain={[0, 'auto']}
                tick={{ fontSize: 11, fill: axisColor }}
                axisLine={false}
                tickLine={false}
            />

            <YAxis 
                type="category" 
                dataKey="name" 
                width={160} // Aumentado um pouco para caber nomes
                tick={<CustomYAxisTick />} // Usando renderizador customizado
                interval={0}
            />

            <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[1]?.payload || payload[0]?.payload; 
                        if (!data) return null;
                        return (
                            <div style={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '8px', padding: '10px' }}>
                                <p style={{ color: tooltipText, fontWeight: 'bold', marginBottom: '4px' }}>{data.name}</p>
                                {data.subtitle && (
                                    <p style={{ color: tooltipText, fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>{data.subtitle}</p>
                                )}
                                <p style={{ color: tooltipText, fontSize: '12px' }}>Início: {data.displayStart}</p>
                                <p style={{ color: tooltipText, fontSize: '12px' }}>Fim: {data.displayEnd}</p>
                                <p style={{ color: tooltipText, fontSize: '12px' }}>Status: {data.status}</p>
                            </div>
                        );
                    }
                    return null;
                }}
            />

            <Bar dataKey="placeholder" stackId="a" fill="transparent" />

            <Bar dataKey="barSize" stackId="a" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status, entry.progress)} />
                ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
