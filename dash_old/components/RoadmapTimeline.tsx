import React from 'react';
import { format } from 'date-fns';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';
import { ptBR } from 'date-fns/locale';

interface RoadmapTimelineProps {
  data: ProjectData[];
  theme: Theme;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ data, theme }) => {
  const sortedData = [...data].sort((a, b) => {
    const dateA = a.actualDate || a.baselineDate || new Date(2099, 0, 1);
    const dateB = b.actualDate || b.baselineDate || new Date(2099, 0, 1);
    return dateA.getTime() - dateB.getTime();
  });

  const displayData = sortedData.slice(0, 15);

  const isVivo = theme === 'vivo';

  const getStatusColor = (status: string) => {
    if (isVivo) {
        switch (status) {
            case 'Concluído': return 'bg-vivo-menta';
            case 'Em Andamento': return 'bg-vivo-lilas';
            case 'Atrasado': return 'bg-vivo-laranja';
            default: return 'bg-white/30';
        }
    }
    switch (status) {
      case 'Concluído': return 'bg-emerald-500';
      case 'Em Andamento': return 'bg-blue-500';
      case 'Atrasado': return 'bg-red-500';
      default: return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  const getBadgeColor = (status: string) => {
    if (isVivo) {
        switch(status) {
            case 'Concluído': return 'bg-vivo-menta/20 text-vivo-menta';
            case 'Atrasado': return 'bg-vivo-laranja/20 text-vivo-laranja';
            case 'Em Andamento': return 'bg-vivo-lilas/20 text-vivo-lilas';
            default: return 'bg-white/10 text-white';
        }
    }
    switch(status) {
        case 'Concluído': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400';
        case 'Atrasado': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
        case 'Em Andamento': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className={clsx(
        "p-6 rounded-xl shadow-sm border h-[400px] overflow-hidden flex flex-col transition-colors",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={clsx("text-lg font-bold", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>Roadmap Executivo</h3>
        <span className={clsx("text-xs", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Próximos entregáveis (Top 15)</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {displayData.map((project) => (
            <div key={project.id} className="flex items-center gap-4 group">
              {/* Date Badge */}
              <div className={clsx(
                "w-16 flex flex-col items-center justify-center rounded-lg p-2 shrink-0 border",
                isVivo ? "bg-white/5 border-vivo-lilas/20" : "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700"
              )}>
                <span className={clsx("text-xs font-bold uppercase", isVivo ? "text-vivo-lilas" : "text-slate-400 dark:text-slate-500")}>
                  {project.baselineDate ? format(project.baselineDate, 'MMM', { locale: ptBR }) : '-'}
                </span>
                <span className={clsx("text-lg font-bold leading-none", isVivo ? "text-white" : "text-slate-700 dark:text-slate-200")}>
                  {project.baselineDate ? format(project.baselineDate, 'dd') : '-'}
                </span>
              </div>

              {/* Timeline Bar */}
              <div className="flex-1 relative">
                <div className="flex justify-between items-baseline mb-1">
                  <span className={clsx("font-semibold text-sm truncate max-w-[200px] md:max-w-xs", isVivo ? "text-white" : "text-slate-800 dark:text-slate-200")} title={project.name}>
                    {project.name}
                  </span>
                  <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide", getBadgeColor(project.status))}>
                    {project.status}
                  </span>
                </div>
                
                {/* Progress Visual */}
                <div className={clsx("h-2 w-full rounded-full overflow-hidden", isVivo ? "bg-white/10" : "bg-slate-100 dark:bg-slate-700")}>
                   <div 
                     className={clsx("h-full rounded-full", getStatusColor(project.status))}
                     style={{ width: project.status === 'Concluído' ? '100%' : '50%' }}
                   ></div>
                </div>
                
                <div className="flex justify-between mt-1">
                   <span className={clsx("text-[10px]", isVivo ? "text-white/40" : "text-slate-400 dark:text-slate-500")}>
                     Base: {project.baselineDate ? format(project.baselineDate, 'dd/MM/yy') : 'N/A'}
                   </span>
                   {project.actualDate && (
                     <span className={clsx("text-[10px] font-medium", isVivo ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>
                       Real: {format(project.actualDate, 'dd/MM/yy')}
                     </span>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};