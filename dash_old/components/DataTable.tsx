
import React from 'react';
import { ProjectData, Theme } from '../types';
import { format } from 'date-fns';
import clsx from 'clsx';
import { Users } from 'lucide-react';

interface DataTableProps {
  data: ProjectData[];
  theme: Theme;
}

export const DataTable: React.FC<DataTableProps> = ({ data, theme }) => {
  const isVivo = theme === 'vivo';

  const getStatusBadge = (status: string) => {
    if (isVivo) {
         switch (status) {
            case 'Concluído': return 'bg-vivo-menta text-vivo-roxo';
            case 'Atrasado': return 'bg-vivo-laranja text-vivo-roxo';
            case 'Em Andamento': return 'bg-vivo-lilas text-white';
            default: return 'bg-white/20 text-white';
         }
    }
    return clsx(
        "px-2 py-1 rounded-full text-xs font-semibold",
        status === 'Concluído' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' :
        status === 'Atrasado' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
        status === 'Em Andamento' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    );
  };

  return (
    <div className={clsx(
        "rounded-xl shadow-sm border overflow-hidden transition-colors",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    )}>
      <div className={clsx("p-6 border-b", isVivo ? "border-vivo-lilas/20" : "border-slate-100 dark:border-slate-700")}>
        <h3 className={clsx("text-lg font-bold", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>Detalhamento</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className={clsx("w-full text-left text-sm", isVivo ? "text-white/80" : "text-slate-600 dark:text-slate-400")}>
          <thead className={clsx("font-semibold uppercase text-xs tracking-wider", isVivo ? "bg-vivo-lilas/10 text-vivo-lilas" : "bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400")}>
            <tr>
              <th className="px-6 py-4">Projeto</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Equipe / Fábrica</th>
              <th className="px-6 py-4">Data Base</th>
              <th className="px-6 py-4">Data Real</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Saving (R$)</th>
            </tr>
          </thead>
          <tbody className={clsx("divide-y", isVivo ? "divide-vivo-lilas/10" : "divide-slate-100 dark:divide-slate-700")}>
            {data.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center opacity-50">Nenhum dado encontrado com os filtros atuais.</td>
                </tr>
            ) : (
                data.map((project) => (
                <tr key={project.id} className={clsx("transition-colors", isVivo ? "hover:bg-white/5" : "hover:bg-slate-50 dark:hover:bg-slate-700/30")}>
                    <td className={clsx("px-6 py-4 font-medium", isVivo ? "text-white" : "text-slate-800 dark:text-slate-200")}>
                        {project.name}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                        {project.description ? (
                            <span className="text-xs opacity-80 line-clamp-2" title={project.description}>
                                {project.description}
                            </span>
                        ) : (
                            <span className="opacity-30 text-xs">-</span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                            {/* Squad e Fábrica */}
                            <div className="flex items-center gap-2 mb-1">
                                {project.factory && (
                                    <span className={clsx("font-semibold", isVivo ? "text-vivo-lilas" : "text-brand-600 dark:text-brand-400")}>
                                        {project.factory}
                                    </span>
                                )}
                                {project.squad && (
                                    <span className={clsx("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold", isVivo ? "bg-vivo-rosa/20 text-vivo-rosa" : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300")}>
                                        {project.squad}
                                    </span>
                                )}
                            </div>
                            
                            {/* Lista de Membros */}
                            <div className="flex flex-col gap-0.5 opacity-80">
                                {project.developer && (
                                    <div className="flex gap-1">
                                        <span className={clsx("font-bold w-8", isVivo ? "text-vivo-menta" : "text-slate-500")}>Dev:</span>
                                        <span>{project.developer}</span>
                                    </div>
                                )}
                                {project.analyst && (
                                    <div className="flex gap-1">
                                        <span className={clsx("font-bold w-8", isVivo ? "text-vivo-menta" : "text-slate-500")}>AF:</span>
                                        <span>{project.analyst}</span>
                                    </div>
                                )}
                                {project.architect && (
                                    <div className="flex gap-1">
                                        <span className={clsx("font-bold w-8", isVivo ? "text-vivo-menta" : "text-slate-500")}>Arq:</span>
                                        <span>{project.architect}</span>
                                    </div>
                                )}
                            </div>

                            {(!project.factory && !project.squad && !project.developer && !project.analyst && !project.architect) && (
                                <span className="opacity-30">-</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                    {project.baselineDate ? format(project.baselineDate, 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                    {project.actualDate ? format(project.actualDate, 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4">
                    <span className={clsx("px-2 py-1 rounded-full text-xs font-semibold", getStatusBadge(project.status))}>
                        {project.status}
                    </span>
                    </td>
                    <td className={clsx("px-6 py-4 text-right font-mono", isVivo ? "text-white" : "text-slate-700 dark:text-slate-300")}>
                    {project.saving.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      <div className={clsx("px-6 py-3 border-t text-xs text-right", isVivo ? "bg-white/5 border-vivo-lilas/20 text-white/50" : "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700 text-slate-400")}>
        Exibindo {data.length} registros
      </div>
    </div>
  );
};
