
import type { ProjectData, DashboardMetrics, ProjectStatus } from '../types';

export class AnalyticsEngine {
    static calculateKPIs(projects: ProjectData[]): DashboardMetrics {
        const totalSaving = projects.reduce((acc, p) => acc + p.saving, 0);
        const totalProjects = projects.length;

        const statusDistribution: Record<string, number> = {};
        projects.forEach(p => {
            statusDistribution[p.status] = (statusDistribution[p.status] || 0) + 1;
        });

        const completed = statusDistribution['Concluído'] || 0;
        const completionRate = totalProjects > 0 ? (completed / totalProjects) * 100 : 0;

        return {
            totalSaving,
            totalProjects,
            statusDistribution: statusDistribution as Record<ProjectStatus, number>,
            completionRate,
            avgDelayDays: 0 // Placeholder
        };
    }
}
