import type { Project } from '../types';
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, isBefore, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class AnalyticsEngine {
    static calculateKPIs(projects: Project[]) {
        const totalProjects = projects.length;
        const totalSaving = projects.reduce((acc, p) => {
            // Extract number from string like "R$ 4.200.000,00"
            const num = parseFloat(p.benefit.replace(/[^0-9,]/g, '').replace(',', '.'));
            return acc + (isNaN(num) ? 0 : num);
        }, 0);

        const completed = projects.filter(p => p.status === 'Concluído').length;
        const delayed = projects.filter(p => p.status === 'Atrasado').length;
        const completionRate = totalProjects ? Math.round((completed / totalProjects) * 100) : 0;

        return { totalProjects, totalSaving, completed, delayed, completionRate };
    }

    static generateBurnup(project: Project) {
        if (!project.startDate || !project.endDate) return null;

        const start = startOfMonth(project.startDate);
        // Extend end if project is delayed
        const finalDate = project.status === 'Concluído' ? project.endDate : addMonths(new Date(), 3);

        const months = eachMonthOfInterval({ start, end: finalDate });
        const totalScope = project.tasks.length;

        // Planned: Linear distribution from start to end
        const planned = months.map(m => {
            if (isBefore(m, project.startDate!)) return 0;
            if (isBefore(project.endDate!, m)) return totalScope;

            const totalDuration = project.endDate!.getTime() - project.startDate!.getTime();
            const elapsed = m.getTime() - project.startDate!.getTime();
            return Math.min(totalScope, Math.round((elapsed / totalDuration) * totalScope));
        });

        // Real: Count completed tasks by month
        const real = months.map(m => {
            if (isBefore(new Date(), m)) return null; // Future
            return project.tasks.filter(t =>
                t.status === 'Concluído' && t.end && isBefore(t.end, endOfMonth(m))
            ).length;
        });

        return {
            labels: months.map(m => format(m, 'MMM/yy', { locale: ptBR })),
            planned,
            real
        };
    }

    static calculateDurationPerStage(projects: Project[]) {
        const stages: Record<string, { count: number, totalDays: number }> = {};

        projects.flatMap(p => p.tasks).forEach(t => {
            let stage = t.etapa || 'Geral';

            const s = stage.toUpperCase();
            if (s.includes('DISCOVERY')) stage = 'Discovery';
            else if (s.includes('DESENVOLVIMENTO') || s.includes('DEV')) stage = 'Desenvolvimento';
            else if (s.includes('HOMOLOGAÇÃO') || s.includes('QA')) stage = 'Homologação';
            else if (s.includes('DELIVERY') || s.includes('IMPLANTAÇÃO')) stage = 'Delivery';

            if (t.start && t.end) {
                const days = (t.end.getTime() - t.start.getTime()) / (1000 * 60 * 60 * 24);
                if (days > 0) {
                    if (!stages[stage]) stages[stage] = { count: 0, totalDays: 0 };
                    stages[stage].count++;
                    stages[stage].totalDays += days;
                }
            }
        });

        return Object.entries(stages).map(([stage, data]) => ({
            stage,
            avgDays: Math.round(data.totalDays / data.count)
        })).sort((a, b) => b.avgDays - a.avgDays);
    }
}
