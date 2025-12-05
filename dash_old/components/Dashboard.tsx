
import React, { useState, useMemo, useRef } from 'react';
import { ProjectData, FilterState, DashboardMetrics, ProjectStatus, Theme } from '../types';
import { KPICards } from './KPICards';
import { BurnupChart } from './BurnupChart';
import { RoadmapTimeline } from './RoadmapTimeline';
import { DataTable } from './DataTable';
import { AverageDurationChart } from './AverageDurationChart';
import { GanttChart } from './GanttChart';
import { parseExcelFile } from '../services/excelParser';
import { Search, Filter, LogOut, Sun, Moon, Sparkles, FolderOpen, PlusCircle, Loader2, LayoutDashboard, Users } from 'lucide-react';
import clsx from 'clsx';

interface DashboardProps {
  data: ProjectData[];
  onReset: () => void;
  onAppendData: (newData: ProjectData[]) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset, onAppendData, theme, toggleTheme }) => {
  // Filter State including Squad Filter (Tabs)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'Todos',
    projectFilter: 'Todos',
    squadFilter: 'Todos'
  });

  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract Unique Squads for Tabs
  const uniqueSquads = useMemo(() => {
    const squads = new Set<string>();
    data.forEach(p => {
        if (p.squad && p.squad.trim() !== '') {
            squads.add(p.squad.toUpperCase()); // Normalize
        }
    });
    return Array.from(squads).sort();
  }, [data]);

  // Unique Projects for Dropdown (filtered by current squad tab if needed, but keeping global for now)
  const uniqueProjects = useMemo(() => {
    // Optionally filter project list based on selected squad
    let projects = data;
    if (filters.squadFilter !== 'Todos') {
        projects = projects.filter(p => p.squad?.toUpperCase() === filters.squadFilter);
    }
    return Array.from(new Set(projects.map(p => p.name))).sort();
  }, [data, filters.squadFilter]);

  // Filter Logic
  const filteredData = useMemo(() => {
    return data.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesStatus = filters.statusFilter === 'Todos' || p.status === filters.statusFilter;
      const matchesProject = filters.projectFilter === 'Todos' || p.name === filters.projectFilter;
      
      const pSquad = p.squad ? p.squad.toUpperCase() : '';
      const matchesSquad = filters.squadFilter === 'Todos' || pSquad === filters.squadFilter;

      return matchesSearch && matchesStatus && matchesProject && matchesSquad;
    });
  }, [data, filters]);

  // Metrics Calculation
  const metrics: DashboardMetrics = useMemo(() => {
    const totalSaving = filteredData.reduce((acc, p) => acc + p.saving, 0);
    const totalProjects = filteredData.length;
    
    const statusDistribution: Record<string, number> = {};
    filteredData.forEach(p => {
      statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
    });

    const completed = statusDistribution['Concluído'] || 0;
    const completionRate = totalProjects > 0 ? (completed / totalProjects) * 100 : 0;

    return {
      totalSaving,
      totalProjects,
      statusDistribution: statusDistribution as any,
      completionRate,
      avgDelayDays: 0 // Placeholder
    };
  }, [filteredData]);

  const uniqueStatuses = Array.from(new Set(data.map(d => d.status)));

  const isVivo = theme === 'vivo';

  const handleAddFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsImporting(true);
        try {
            const files = Array.from(e.target.files) as File[];
            const promises = files.map(f => parseExcelFile(f));
            const results = await Promise.all(promises);
            const flatData = results.flat();
            if (flatData.length > 0) {
                onAppendData(flatData);
            }
        } catch (error) {
            console.error("Erro ao importar mais arquivos", error);
            alert("Erro ao ler arquivos. Verifique se são válidos.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }
  };

  const isSingleProject = filters.projectFilter !== 'Todos' && filteredData.length === 1;

  return (
    <div className={clsx(
      "min-h-screen pb-20 transition-colors duration-300",
      isVivo ? "bg-vivo-roxo-escuro text-white" : "bg-slate-100/50 dark:bg-slate-900"
    )}>
      <input 
        type="file" 
        multiple 
        accept=".xlsx" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className={clsx(
        "border-b sticky top-0 z-30 shadow-sm transition-colors duration-300",
        isVivo ? "bg-vivo-roxo border-vivo-lilas/20" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden",
              isVivo ? "bg-white" : "bg-brand-600 text-white"
            )}>
              {isVivo ? (
                <img 
                    src="https://logodownload.org/wp-content/uploads/2014/02/vivo-logo-0.png" 
                    alt="Vivo" 
                    className="w-full h-full object-contain p-1"
                />
              ) : (
                'F'
              )}
            </div>
            <h1 className={clsx(
              "text-xl font-bold tracking-tight",
              isVivo ? "text-white" : "text-slate-800 dark:text-white"
            )}>
              Dashboard <span className={clsx("font-normal", isVivo ? "text-vivo-lilas" : "text-slate-400 dark:text-slate-500")}>Executivo</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button
               onClick={toggleTheme}
               className={clsx(
                 "p-2 rounded-full transition-colors flex items-center gap-2",
                 isVivo 
                    ? "text-vivo-lilas hover:bg-vivo-lilas/10" 
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
               )}
               title="Alternar Tema"
             >
               {theme === 'light' && <Sun className="w-5 h-5" />}
               {theme === 'dark' && <Moon className="w-5 h-5" />}
               {theme === 'vivo' && <Sparkles className="w-5 h-5" />}
             </button>

             <div className={clsx("h-6 w-px", isVivo ? "bg-vivo-lilas/20" : "bg-slate-200 dark:bg-slate-700")}></div>

             <button 
               onClick={handleAddFileClick}
               disabled={isImporting}
               className={clsx(
                 "flex items-center gap-2 text-sm transition-colors font-medium",
                 isVivo ? "text-vivo-menta hover:text-white" : "text-brand-600 dark:text-brand-400 hover:text-brand-700"
               )}
             >
               {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
               <span className="hidden sm:inline">Adicionar Arquivo</span>
             </button>

             <button 
               onClick={onReset}
               className={clsx(
                 "flex items-center gap-2 text-sm transition-colors",
                 isVivo ? "text-white/50 hover:text-white" : "text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
               )}
               title="Limpar tudo e começar de novo"
             >
               <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* SQUAD TABS NAVIGATION */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
            <button
                onClick={() => setFilters(prev => ({ ...prev, squadFilter: 'Todos', projectFilter: 'Todos' }))}
                className={clsx(
                    "pb-3 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    filters.squadFilter === 'Todos'
                        ? (isVivo ? "border-vivo-lilas text-vivo-lilas" : "border-brand-600 text-brand-600 dark:text-brand-400")
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
                )}
            >
                <LayoutDashboard className="w-4 h-4" />
                Visão Geral
            </button>
            {uniqueSquads.map(squad => (
                <button
                    key={squad}
                    onClick={() => setFilters(prev => ({ ...prev, squadFilter: squad, projectFilter: 'Todos' }))}
                    className={clsx(
                        "pb-3 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                        filters.squadFilter === squad
                            ? (isVivo ? "border-vivo-lilas text-vivo-lilas" : "border-brand-600 text-brand-600 dark:text-brand-400")
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
                    )}
                >
                    <Users className="w-4 h-4" />
                    {squad}
                </button>
            ))}
        </div>

        {/* Toolbar */}
        <div className={clsx(
            "flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center p-4 rounded-xl shadow-sm border transition-colors duration-300",
            isVivo 
            ? "bg-vivo-roxo border-vivo-lilas/30 shadow-lg shadow-vivo-roxo/50" 
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        )}>
            
            {/* Filters Container */}
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                
                {/* Search */}
                <div className="relative w-full md:w-64">
                <Search className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                <input 
                    type="text" 
                    placeholder="Buscar texto..." 
                    className={clsx(
                    "w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all",
                    isVivo 
                        ? "bg-vivo-roxo-escuro border-transparent text-white placeholder:text-white/40 focus:ring-vivo-lilas"
                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500 placeholder:text-slate-400"
                    )}
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
                </div>

                {/* Project Filter (Dropdown) */}
                <div className="relative w-full md:w-64">
                <FolderOpen className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                <select
                    value={filters.projectFilter}
                    onChange={(e) => setFilters(prev => ({ ...prev, projectFilter: e.target.value }))}
                    className={clsx(
                    "w-full pl-10 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer",
                    isVivo
                        ? "bg-vivo-roxo-escuro border-transparent text-white focus:ring-vivo-lilas"
                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500"
                    )}
                >
                    <option value="Todos">
                        {filters.squadFilter === 'Todos' ? 'Todos os Projetos' : `Projetos de ${filters.squadFilter}`}
                    </option>
                    {uniqueProjects.map(name => (
                    <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className={clsx("w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                </div>

            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                <div className={clsx("flex items-center gap-2 text-sm whitespace-nowrap", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Status:</span>
                </div>
                <div className="flex gap-2">
                <button
                    onClick={() => setFilters(prev => ({ ...prev, statusFilter: 'Todos' }))}
                    className={clsx(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap",
                        isVivo 
                            ? (filters.statusFilter === 'Todos' ? "bg-vivo-lilas text-white border-vivo-lilas" : "bg-transparent text-white border-vivo-lilas/30 hover:border-vivo-lilas")
                            : (filters.statusFilter === 'Todos' ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")
                    )}
                >
                    Todos
                </button>
                {uniqueStatuses.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilters(prev => ({ ...prev, statusFilter: status as ProjectStatus }))}
                        className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap",
                            isVivo 
                            ? (filters.statusFilter === status ? "bg-vivo-lilas text-white border-vivo-lilas" : "bg-transparent text-white border-vivo-lilas/30 hover:border-vivo-lilas")
                            : (filters.statusFilter === status ? "bg-brand-500 text-white border-brand-500" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600")
                        )}
                    >
                        {status}
                    </button>
                ))}
                </div>
            </div>
        </div>

        {/* KPIs */}
        <KPICards metrics={metrics} theme={theme} />

        {/* Row 1: Gantt Chart */}
        <GanttChart 
            data={filteredData} 
            theme={theme} 
            singleProjectMode={isSingleProject}
        />

        {/* Row 2: Burnup and Duration Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
            <BurnupChart data={filteredData} theme={theme} />
            </div>
            <div className="lg:col-span-1">
            <AverageDurationChart data={filteredData} theme={theme} />
            </div>
        </div>

        {/* Row 3: Simple Roadmap (Optional) */}
        {!isSingleProject && <RoadmapTimeline data={filteredData} theme={theme} />}

        {/* Row 4: Detailed Table */}
        <DataTable data={filteredData} theme={theme} />
      </main>
    </div>
  );
};
