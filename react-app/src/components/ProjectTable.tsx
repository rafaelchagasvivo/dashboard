import type { Project, Status } from '../types';
import clsx from 'clsx';

interface ProjectTableProps {
    projects: Project[];
}

const statusColors: Record<Status, string> = {
    'Concluído': 'bg-green-500/20 text-green-500 border-green-500/50',
    'Em Andamento': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    'Atrasado': 'bg-red-500/20 text-red-500 border-red-500/50',
    'Bloqueado': 'bg-red-500/20 text-red-500 border-red-500/50',
    'Pendente': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    'Cancelado': 'bg-slate-500/20 text-slate-500 border-slate-500/50',
};

export function ProjectTable({ projects }: ProjectTableProps) {
    return (
        <div className="bg-card-bg border border-border-color rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/5 dark:bg-white/5 text-text-primary/60 uppercase text-xs font-semibold">
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
                    <tbody className="divide-y divide-border-color">
                        {projects.map((p) => (
                            <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-bold text-text-primary">{p.title}</td>
                                <td className="px-6 py-4 text-xs text-text-primary/60 max-w-[200px]">
                                    {p.description || 'Sem descrição disponível'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold text-vivo-purple">{p.team.fabrica}</span>
                                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] w-fit border border-gray-200 dark:border-gray-700">
                                            {p.team.squad}
                                        </span>
                                        <div className="text-[10px] text-text-primary/50 mt-1">
                                            <div>Dev: {p.team.dev}</div>
                                            <div>AF: {p.team.af}</div>
                                            <div>Arq: {p.team.arq}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium">{p.startDate?.toLocaleDateString('pt-BR') || '-'}</td>
                                <td className="px-6 py-4 text-sm text-text-primary/60">-</td> {/* Data Real not in excel usually, using placeholder or end date */}
                                <td className="px-6 py-4">
                                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", statusColors[p.status])}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-right font-bold text-text-primary">
                                    {p.benefit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
