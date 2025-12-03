export type Status = 'Concluído' | 'Em Andamento' | 'Atrasado' | 'Bloqueado' | 'Pendente' | 'Cancelado';

export interface Task {
    id: string;
    name: string;
    start: Date | null;
    end: Date | null;
    duration: number;
    status: Status;
    progress: number;
    etapa?: string;
}

export interface Team {
    squad: string;
    fabrica: string;
    arq: string;
    af: string;
    dev: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    benefit: string; // Saving
    team: Team;
    tasks: Task[];
    // Computed
    status: Status; // Project level status
    progress: number;
    startDate: Date | null;
    endDate: Date | null;
}
