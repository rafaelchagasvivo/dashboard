import React from 'react';
import { DollarSign, LayoutList, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DashboardMetrics, Theme } from '../types';
import clsx from 'clsx';

interface KPICardsProps {
  metrics: DashboardMetrics;
  theme: Theme;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, theme }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const isVivo = theme === 'vivo';

  // Helper to get card base classes
  const cardClasses = clsx(
    "p-5 rounded-xl shadow-sm border relative overflow-hidden group transition-colors",
    isVivo 
      ? "bg-vivo-roxo border-vivo-lilas/20 hover:border-vivo-lilas/50" 
      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Saving */}
      <div className={cardClasses}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className={clsx("w-16 h-16", isVivo ? "text-vivo-menta" : "text-emerald-600 dark:text-emerald-500")} />
        </div>
        <div className="flex flex-col relative z-10">
            <span className={clsx("text-xs uppercase font-bold tracking-wider", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Saving Total</span>
            <span className={clsx("text-2xl font-bold mt-1", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>{formatCurrency(metrics.totalSaving)}</span>
            <div className={clsx("flex items-center gap-1 mt-2 text-xs font-medium", isVivo ? "text-vivo-menta" : "text-emerald-600 dark:text-emerald-400")}>
                <TrendingUp className="w-3 h-3" />
                <span>Acumulado</span>
            </div>
        </div>
      </div>

      {/* Projetos Totais */}
      <div className={cardClasses}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <LayoutList className={clsx("w-16 h-16", isVivo ? "text-vivo-rosa" : "text-brand-600 dark:text-brand-500")} />
        </div>
        <div className="flex flex-col relative z-10">
            <span className={clsx("text-xs uppercase font-bold tracking-wider", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Portfólio</span>
            <span className={clsx("text-2xl font-bold mt-1", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>{metrics.totalProjects}</span>
            <span className={clsx("text-xs mt-2", isVivo ? "text-white/60" : "text-slate-400 dark:text-slate-500")}>Projetos monitorados</span>
        </div>
      </div>

      {/* Taxa de Conclusão */}
      <div className={cardClasses}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className={clsx("w-16 h-16", isVivo ? "text-vivo-lilas" : "text-blue-600 dark:text-blue-500")} />
        </div>
        <div className="flex flex-col relative z-10">
            <span className={clsx("text-xs uppercase font-bold tracking-wider", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Conclusão</span>
            <div className="flex items-baseline gap-2">
                <span className={clsx("text-2xl font-bold mt-1", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>{metrics.completionRate.toFixed(1)}%</span>
                <span className={clsx("text-xs", isVivo ? "text-white/60" : "text-slate-500")}>do total</span>
            </div>
            <div className={clsx("w-full h-1.5 rounded-full mt-3", isVivo ? "bg-white/10" : "bg-slate-100 dark:bg-slate-700")}>
                <div 
                    className={clsx("h-1.5 rounded-full transition-all duration-500", isVivo ? "bg-vivo-lilas" : "bg-blue-500 dark:bg-blue-400")}
                    style={{ width: `${metrics.completionRate}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* Atrasados */}
      <div className={cardClasses}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle className={clsx("w-16 h-16", isVivo ? "text-vivo-laranja" : "text-red-600 dark:text-red-500")} />
        </div>
        <div className="flex flex-col relative z-10">
            <span className={clsx("text-xs uppercase font-bold tracking-wider", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>Atenção</span>
            <span className={clsx("text-2xl font-bold mt-1", isVivo ? "text-vivo-laranja" : "text-red-600 dark:text-red-400")}>{metrics.statusDistribution['Atrasado'] || 0}</span>
            <span className={clsx("text-xs mt-2 font-medium", isVivo ? "text-vivo-laranja/80" : "text-red-600/80 dark:text-red-400/80")}>Projetos em atraso</span>
        </div>
      </div>
    </div>
  );
};