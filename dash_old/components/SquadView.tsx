
import React, { useMemo } from 'react';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';
import { Users, AlertTriangle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface SquadViewProps {
  data: ProjectData[];
  theme: Theme;
  onProjectClick: (projectName: string) => void;
}

export const SquadView: React.FC<SquadViewProps> = ({ data, theme, onProjectClick }) => {
  const isVivo = theme === 'vivo';

  const groupedSquads = useMemo(() => {
    const groups: Record<string, ProjectData[]> = {};
    
    data.forEach(project => {
      const squadName = project.squad ? project.squad.toUpperCase() : 'SEM SQUAD';
      if (!groups[squadName]) {
        groups[squadName] = [];
      }
      groups[squadName].push(project);
    });

    // Sort squads alphabetically, put "SEM SQUAD" last
    return Object.entries(groups).sort((a, b) => {
        if (a[0] === 'SEM SQUAD') return 1;
        if (b[0] === 'SEM SQUAD') return -1;
        return a[0].localeCompare(b[0]);
    });
  }, [data]);

  const getStatusColor = (status: string) => {
    if (isVivo) {
        if (status === 'Concluído') return 'text-vivo-menta';
        if (status === 'Atrasado') return 'text-vivo-laranja';
        return 'text-vivo-lilas';
    }
    if (status === 'Concluído') return 'text-emerald-600 dark:text-emerald-400';
    if (status === 'Atrasado') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Concluído') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'Atrasado') return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {groupedSquads.map(([squadName, projects]) => (
        <div 
          key={squadName} 
          className={clsx(
            "rounded-xl border shadow-sm overflow-hidden flex flex-col h-full transition-colors",
            isVivo 
                ? "bg-vivo-roxo border-vivo-lilas/20 hover:border-vivo-lilas/50" 
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          )}
        >
          {/* Header da Squad */}
          <div className={clsx(
            "p-4 border-b flex justify-between items-center",
            isVivo ? "bg-white/5 border-vivo-lilas/20" : "bg-slate-50 dark:bg-slate-700/30 border-slate-100 dark:border-slate-700"
          )}>
            <div className="flex items-center gap-2">
                <div className={clsx(
                    "p-1.5 rounded-lg",
                    isVivo ? "bg-vivo-lilas/20 text-vivo-lilas" : "bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                )}>
                    <Users className="w-4 h-4" />
                </div>
                <h3 className={clsx("font-bold text-sm tracking-wide", isVivo ? "text-white" : "text-slate-700 dark:text-slate-200")}>
                    {squadName}
                </h3>
            </div>
            <span className={clsx("text-xs font-mono opacity-60", isVivo ? "text-white" : "text-slate-500")}>
                {projects.length} PROJETO(S)
            </span>
          </div>

          {/* Lista de Projetos */}
          <div className="p-2 flex-1 flex flex-col gap-2">
            {projects.map(project => (
                <button
                    key={project.id}
                    onClick={() => onProjectClick(project.name)}
                    className={clsx(
                        "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group",
                        isVivo 
                            ? "bg-transparent border-transparent hover:bg-white/5 hover:border-vivo-lilas/30" 
                            : "bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600"
                    )}
                >
                    <div className="min-w-0">
                        <div className={clsx("font-medium text-sm truncate", isVivo ? "text-white group-hover:text-vivo-lilas" : "text-slate-700 dark:text-slate-200")}>
                            {project.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={clsx("flex items-center gap-1 text-xs", getStatusColor(project.status))}>
                                {getStatusIcon(project.status)}
                                {project.status}
                            </span>
                            {project.saving > 0 && (
                                <span className={clsx("text-[10px] px-1.5 py-0.5 rounded", isVivo ? "bg-vivo-menta/10 text-vivo-menta" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                                    {project.saving.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' })}
                                </span>
                            )}
                        </div>
                    </div>
                    <ChevronRight className={clsx("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
