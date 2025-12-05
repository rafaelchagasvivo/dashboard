import React from 'react';
import { LogOut, Sun, Moon, Sparkles, PlusCircle, Search, FolderOpen, LayoutDashboard, Users, Factory, Cpu, ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
import type { Theme } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    squads: string[];
    selectedSquad: string | null;
    onSelectSquad: (squad: string | null) => void;
    onUpload: () => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    projects: { id: string; name: string }[];
    selectedProject: string | null;
    onSelectProject: (id: string | null) => void;
    theme: Theme;
    toggleTheme: () => void;
    onReset?: () => void;
    factories: string[];
    selectedFactory: string | null;
    onSelectFactory: (factory: string | null) => void;
    technologies: string[];
    selectedTechnology: string[];
    onSelectTechnology: (techs: string[]) => void;
}

export function Layout({
    children,
    squads,
    selectedSquad,
    onSelectSquad,
    onUpload,
    searchTerm,
    onSearch,
    projects,
    selectedProject,
    onSelectProject,
    theme,
    toggleTheme,
    onReset,
    factories,
    selectedFactory,
    onSelectFactory,
    technologies,
    selectedTechnology,
    onSelectTechnology
}: LayoutProps) {

    const isVivo = theme === 'vivo';
    const [techDropdownOpen, setTechDropdownOpen] = React.useState(false);

    return (
        <div className={clsx(
            "min-h-screen pb-20 transition-colors duration-300",
            isVivo ? "bg-vivo-roxo-escuro text-white" : "bg-slate-100/50 dark:bg-slate-900"
        )}>
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
                            onClick={onUpload}
                            className={clsx(
                                "flex items-center gap-2 text-sm transition-colors font-medium",
                                isVivo ? "text-vivo-menta hover:text-white" : "text-brand-600 dark:text-brand-400 hover:text-brand-700"
                            )}
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Adicionar Arquivo</span>
                        </button>

                        {onReset && (
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
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => onSelectSquad(null)}
                        className={clsx(
                            "pb-3 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                            selectedSquad === null
                                ? (isVivo ? "border-vivo-lilas text-vivo-lilas" : "border-brand-600 text-brand-600 dark:text-brand-400")
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
                        )}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Visão Geral
                    </button>
                    {squads.map(squad => (
                        <button
                            key={squad}
                            onClick={() => onSelectSquad(squad)}
                            className={clsx(
                                "pb-3 px-4 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                selectedSquad === squad
                                    ? (isVivo ? "border-vivo-lilas text-vivo-lilas" : "border-brand-600 text-brand-600 dark:text-brand-400")
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
                            )}
                        >
                            <Users className="w-4 h-4" />
                            {squad}
                        </button>
                    ))}
                </div>
                <div className={clsx(
                    "flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center p-4 rounded-xl shadow-sm border transition-colors duration-300",
                    isVivo
                        ? "bg-vivo-roxo border-vivo-lilas/30 shadow-lg shadow-vivo-roxo/50"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                )}>

                    <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">

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
                                value={searchTerm}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>

                        <div className="relative w-full md:w-64">
                            <FolderOpen className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                            <select
                                value={selectedProject || ''}
                                onChange={(e) => onSelectProject(e.target.value || null)}
                                className={clsx(
                                    "w-full pl-10 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer",
                                    isVivo
                                        ? "bg-vivo-roxo-escuro border-transparent text-white focus:ring-vivo-lilas"
                                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500"
                                )}
                            >
                                <option value="">
                                    {selectedSquad === null ? 'Todos os Projetos' : `Projetos de ${selectedSquad}`}
                                </option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className={clsx("w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Factory className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                            <select
                                value={selectedFactory || ''}
                                onChange={(e) => onSelectFactory(e.target.value || null)}
                                className={clsx(
                                    "w-full pl-10 pr-8 py-2 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer",
                                    isVivo
                                        ? "bg-vivo-roxo-escuro border-transparent text-white focus:ring-vivo-lilas"
                                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500"
                                )}
                            >
                                <option value="">Todas as Fábricas</option>
                                {factories.map(f => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className={clsx("w-4 h-4", isVivo ? "text-vivo-lilas" : "text-slate-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Cpu className={clsx("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none", isVivo ? "text-vivo-lilas" : "text-slate-400")} />
                            <button
                                onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                                className={clsx(
                                    "w-full pl-10 pr-8 py-2 rounded-lg text-sm text-left focus:outline-none focus:ring-2 transition-all flex items-center justify-between",
                                    isVivo
                                        ? "bg-vivo-roxo-escuro border-transparent text-white focus:ring-vivo-lilas"
                                        : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-brand-500"
                                )}
                            >
                                <span className="truncate">
                                    {selectedTechnology.length === 0
                                        ? "Todas as Tecnologias"
                                        : `${selectedTechnology.length} selecionada${selectedTechnology.length > 1 ? 's' : ''}`}
                                </span>
                                <ChevronDown className={clsx("w-4 h-4 transition-transform", techDropdownOpen && "rotate-180")} />
                            </button>

                            {techDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setTechDropdownOpen(false)}
                                    />
                                    <div className={clsx(
                                        "absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-20 max-h-60 overflow-y-auto",
                                        isVivo ? "bg-vivo-roxo-escuro border-vivo-lilas" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    )}>
                                        {technologies.length === 0 ? (
                                            <div className={clsx("px-3 py-2 text-sm", isVivo ? "text-white/50" : "text-slate-400")}>
                                                Nenhuma tecnologia disponível
                                            </div>
                                        ) : (
                                            technologies.map(tech => (
                                                <label
                                                    key={tech}
                                                    className={clsx(
                                                        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                                                        isVivo ? "hover:bg-white/5" : "hover:bg-slate-50 dark:hover:bg-slate-700"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTechnology.includes(tech)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                onSelectTechnology([...selectedTechnology, tech]);
                                                            } else {
                                                                onSelectTechnology(selectedTechnology.filter(t => t !== tech));
                                                            }
                                                        }}
                                                        className={clsx(
                                                            "w-4 h-4 rounded border-2 cursor-pointer",
                                                            isVivo
                                                                ? "border-vivo-lilas checked:bg-vivo-lilas checked:border-vivo-lilas"
                                                                : "border-slate-300 dark:border-slate-600 checked:bg-brand-500 checked:border-brand-500"
                                                        )}
                                                    />
                                                    <span className={clsx(
                                                        "text-sm",
                                                        isVivo ? "text-white" : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {tech}
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                        {selectedTechnology.length > 0 && (
                                            <div className={clsx(
                                                "border-t px-3 py-2",
                                                isVivo ? "border-vivo-lilas/20" : "border-slate-200 dark:border-slate-700"
                                            )}>
                                                <button
                                                    onClick={() => {
                                                        onSelectTechnology([]);
                                                        setTechDropdownOpen(false);
                                                    }}
                                                    className={clsx(
                                                        "w-full text-xs py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors",
                                                        isVivo
                                                            ? "bg-vivo-lilas/20 text-vivo-lilas hover:bg-vivo-lilas/30"
                                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                                                    )}
                                                >
                                                    <X className="w-3 h-3" />
                                                    Limpar seleção
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
