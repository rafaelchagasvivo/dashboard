import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    TimeScale
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import type { Project } from '../types';
import { AnalyticsEngine } from '../utils/AnalyticsEngine';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    TimeScale
);

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#94a3b8' } },
        title: { display: true, color: '#f8fafc', font: { size: 16 } }
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }
    }
};

export function StatusChart({ projects }: { projects: Project[] }) {
    const counts: Record<string, number> = {
        'Concluído': 0, 'Em Andamento': 0, 'Atrasado': 0, 'Bloqueado': 0, 'Pendente': 0, 'Cancelado': 0
    };

    projects.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++; });

    const data = {
        labels: Object.keys(counts),
        datasets: [{
            data: Object.values(counts),
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#ef4444', '#f59e0b', '#64748b'],
            borderWidth: 0
        }]
    };

    return (
        <div className="bg-card-bg border border-border-color p-4 rounded-xl h-[350px]">
            <Doughnut
                data={data}
                options={{
                    ...commonOptions,
                    plugins: { ...commonOptions.plugins, title: { ...commonOptions.plugins.title, text: 'Status do Portfólio' } },
                    scales: {}
                }}
            />
        </div>
    );
}

export function BurnupChart({ project }: { project: Project }) {
    const burnupData = AnalyticsEngine.generateBurnup(project);

    if (!burnupData) return <div className="h-[350px] flex items-center justify-center text-text-primary/40">Sem dados de datas</div>;

    const data = {
        labels: burnupData.labels,
        datasets: [
            {
                label: 'Escopo Planejado',
                data: burnupData.planned,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                tension: 0.4
            },
            {
                label: 'Realizado',
                data: burnupData.real,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.4
            }
        ]
    };

    return (
        <div className="bg-card-bg border border-border-color p-4 rounded-xl h-[350px]">
            <Line
                data={data}
                options={{
                    ...commonOptions,
                    plugins: { ...commonOptions.plugins, title: { ...commonOptions.plugins.title, text: `Burnup: ${project.title}` } }
                }}
            />
        </div>
    );
}

export function DurationChart({ projects }: { projects: Project[] }) {
    const durationData = AnalyticsEngine.calculateDurationPerStage(projects);

    const data = {
        labels: durationData.map(d => d.stage),
        datasets: [{
            label: 'Dias Médios',
            data: durationData.map(d => d.avgDays),
            backgroundColor: '#0ea5e9', // Sky blue like screenshot
            borderRadius: 4,
            barThickness: 20
        }]
    };

    return (
        <div className="bg-white dark:bg-card-bg border border-border-color p-6 rounded-xl h-[350px] shadow-sm">
            <Bar
                data={data}
                options={{
                    ...commonOptions,
                    indexAxis: 'y' as const,
                    plugins: {
                        ...commonOptions.plugins,
                        title: { display: false }, // Custom title in layout
                        legend: { display: false }
                    },
                    scales: {
                        x: { grid: { display: true, color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
                        y: { grid: { display: false }, ticks: { color: '#64748b', font: { weight: 'bold' } } }
                    }
                }}
            />
        </div>
    );
}

export function GanttChart({ projects }: { projects: Project[] }) {
    // Sort by start date
    const sorted = [...projects].sort((a, b) => (a.startDate?.getTime() || 0) - (b.startDate?.getTime() || 0));

    const data = {
        labels: sorted.map(p => p.title),
        datasets: [{
            label: 'Cronograma',
            data: sorted.map(p => {
                if (!p.startDate || !p.endDate) return null;
                return [p.startDate.getTime(), p.endDate.getTime()];
            }),
            backgroundColor: sorted.map(p => {
                // Match screenshot colors roughly
                if (p.status === 'Concluído') return '#10b981'; // Green
                return '#3b82f6'; // Blue
            }),
            borderRadius: 6,
            barThickness: 25,
            borderSkipped: false
        }]
    };

    return (
        <div className="bg-white dark:bg-card-bg border border-border-color p-6 rounded-xl h-[400px] shadow-sm w-full">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-text-primary">Cronograma Macro Consolidado</h3>
                <p className="text-sm text-text-primary/60">Visualização macro e equipe</p>
            </div>
            <div className="h-[320px]">
                <Bar
                    data={data}
                    options={{
                        ...commonOptions,
                        indexAxis: 'y' as const,
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => {
                                        const v = ctx.raw as [number, number];
                                        const start = new Date(v[0]).toLocaleDateString('pt-BR');
                                        const end = new Date(v[1]).toLocaleDateString('pt-BR');
                                        return `${start} - ${end}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                type: 'time',
                                time: { unit: 'month', displayFormats: { month: 'MMM/yy' } },
                                grid: { display: true, color: '#f1f5f9' },
                                ticks: { color: '#94a3b8' },
                                min: new Date(new Date().getFullYear(), 0, 1).getTime() // Start of current year? Or dynamic
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: '#64748b', font: { weight: 'bold' } }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}
