import React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Layout as LayoutIcon, Upload, Search } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    squads: string[];
    selectedSquad: string | null;
    onSelectSquad: (squad: string | null) => void;
    onUpload: () => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    projects: { id: string; title: string }[];
    selectedProject: string | null;
    onSelectProject: (id: string | null) => void;
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
    onSelectProject
}: LayoutProps) {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-color px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-vivo-purple p-2 rounded-lg">
                            <LayoutIcon className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-vivo-purple to-vivo-pink bg-clip-text text-transparent">
                                Vivo Dashboard
                            </h1>
                            <p className="text-xs text-text-primary/60 font-medium">Project Analytics Pro</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Project Selector */}
                        <select
                            value={selectedProject || ''}
                            onChange={(e) => onSelectProject(e.target.value || null)}
                            className="hidden md:block px-4 py-2 rounded-full bg-card-bg border border-border-color focus:outline-none focus:border-vivo-purple text-sm w-48 appearance-none cursor-pointer"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="">Todos os Projetos</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>

                        {/* Search */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar projetos..."
                                value={searchTerm}
                                onChange={(e) => onSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full bg-card-bg border border-border-color focus:outline-none focus:border-vivo-purple w-64 text-sm"
                            />
                        </div>

                        <button
                            onClick={onUpload}
                            className="flex items-center gap-2 px-4 py-2 bg-vivo-purple hover:bg-vivo-dark text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            <Upload size={18} />
                            <span className="hidden sm:inline">Importar Excel</span>
                        </button>

                        <ThemeSwitcher />
                    </div>
                </div>

                {/* Squad Tabs */}
                {squads.length > 0 && (
                    <div className="max-w-7xl mx-auto mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => onSelectSquad(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedSquad === null
                                ? 'bg-vivo-purple text-white'
                                : 'bg-card-bg border border-border-color hover:border-vivo-purple'
                                }`}
                        >
                            Visão Geral
                        </button>
                        {squads.map(squad => (
                            <button
                                key={squad}
                                onClick={() => onSelectSquad(squad)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedSquad === squad
                                    ? 'bg-vivo-purple text-white'
                                    : 'bg-card-bg border border-border-color hover:border-vivo-purple'
                                    }`}
                            >
                                {squad}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
}
