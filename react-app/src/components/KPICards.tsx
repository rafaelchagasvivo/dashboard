import { DollarSign, FolderKanban, CheckCircle, AlertTriangle } from 'lucide-react';

interface KPICardsProps {
    kpis: {
        totalProjects: number;
        totalSaving: number;
        completed: number;
        delayed: number;
        completionRate: number;
    };
}

export function KPICards({ kpis }: KPICardsProps) {
    const cards = [
        {
            label: 'Saving Total',
            value: kpis.totalSaving.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            icon: DollarSign,
            color: 'text-vivo-green',
            bg: 'bg-vivo-green/10'
        },
        {
            label: 'Portfólio',
            value: kpis.totalProjects,
            sub: `${kpis.completionRate}% Concluído`,
            icon: FolderKanban,
            color: 'text-vivo-purple',
            bg: 'bg-vivo-purple/10'
        },
        {
            label: 'Concluídos',
            value: kpis.completed,
            icon: CheckCircle,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Atenção',
            value: kpis.delayed,
            sub: 'Projetos Atrasados',
            icon: AlertTriangle,
            color: 'text-vivo-orange',
            bg: 'bg-vivo-orange/10'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, idx) => (
                <div key={idx} className="bg-card-bg border border-border-color p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-text-primary/60 text-sm font-medium uppercase tracking-wider mb-1">{card.label}</p>
                            <h3 className="text-3xl font-bold">{card.value}</h3>
                            {card.sub && <p className="text-xs text-text-primary/40 mt-1">{card.sub}</p>}
                        </div>
                        <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
