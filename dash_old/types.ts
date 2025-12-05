
export type ProjectStatus = 'Concluído' | 'Em Andamento' | 'Atrasado' | 'Cancelado' | 'Não Iniciado';
export type Theme = 'light' | 'dark' | 'vivo';

export interface RawProjectRow {
  [key: string]: any;
}

export interface TaskData {
  name: string;
  startDate: number | null;  // Timestamp
  plannedEnd: number | null; // Timestamp
  actualEnd: number | null;  // Timestamp
  duration: number;          // Dias
  progress: number;          // 0-100
}

export interface ProjectData {
  id: string;
  name: string;
  description?: string;      // New field
  startDate: Date | null;    // Data Inicio Real do Projeto
  baselineDate: Date | null; // Data Fim Planejada do Projeto
  actualDate: Date | null;   // Data Fim Real do Projeto
  status: ProjectStatus;
  saving: number;
  tasks: TaskData[];         // Lista de tarefas para Burnup granular
  stageDurations: Record<string, number>; // Ex: { "Discovery": 5, "Delivery": 2 }
  
  // Novos campos de equipe
  factory?: string;
  squad?: string;
  architect?: string;
  analyst?: string;
  developer?: string;
}

export interface DashboardMetrics {
  totalSaving: number;
  totalProjects: number;
  statusDistribution: Record<ProjectStatus, number>;
  completionRate: number;
  avgDelayDays: number;
}

export interface BurnupPoint {
  date: string;
  displayDate: string;
  baselineScope: number; // Cumulativo Planejado
  actualCompleted: number; // Cumulativo Realizado
  forecast: number | null; // Tendência
  totalScope: number; // Linha de teto
}

export interface FilterState {
  searchTerm: string;
  statusFilter: ProjectStatus | 'Todos';
  projectFilter: string;
  squadFilter: string; // 'Todos' ou o nome da Squad
}
