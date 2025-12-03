import * as XLSX from 'xlsx';
import type { Project, Task, Team, Status } from '../types';

export class ExcelParser {
    static async parseFile(file: File): Promise<Project[]> {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { cellDates: true });
        const projects: Project[] = [];

        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            if (this.isValidProjectSheet(sheet)) {
                const project = this.parseSheet(sheet, sheetName);
                if (project) projects.push(project);
            }
        });

        return projects;
    }

    private static isValidProjectSheet(sheet: XLSX.WorkSheet): boolean {
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');
        for (let R = range.s.r; R <= Math.min(range.e.r, 20); ++R) {
            for (let C = range.s.c; C <= Math.min(range.e.c, 10); ++C) {
                const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
                if (cell && typeof cell.v === 'string' && cell.v.toUpperCase().includes('TAREFA')) {
                    return true;
                }
            }
        }
        return false;
    }

    private static parseSheet(sheet: XLSX.WorkSheet, sheetName: string): Project | null {
        try {
            const metadata = this.extractMetadata(sheet);
            const { tasks } = this.extractTasks(sheet);

            if (tasks.length === 0) return null;

            const startDates = tasks.map(t => t.start?.getTime()).filter(t => t) as number[];
            const endDates = tasks.map(t => t.end?.getTime()).filter(t => t) as number[];

            const minDate = startDates.length ? new Date(Math.min(...startDates)) : null;
            const maxDate = endDates.length ? new Date(Math.max(...endDates)) : null;

            const totalProgress = tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length;
            let status: Status = 'Em Andamento';
            if (totalProgress === 100) status = 'Concluído';
            else if (maxDate && maxDate < new Date() && totalProgress < 100) status = 'Atrasado';

            return {
                id: sheetName,
                title: metadata.title || sheetName,
                benefit: metadata.benefit,
                team: metadata.team,
                tasks: tasks,
                status,
                progress: Math.round(totalProgress),
                startDate: minDate,
                endDate: maxDate
            };
        } catch (e) {
            console.error(`Error parsing sheet ${sheetName}`, e);
            return null;
        }
    }

    private static extractMetadata(sheet: XLSX.WorkSheet) {
        let title = '';
        let benefit = '0';
        const team: Team = { squad: 'N/A', fabrica: 'N/A', arq: 'N/A', af: 'N/A', dev: 'N/A' };

        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z20');
        for (let R = range.s.r; R <= Math.min(range.e.r, 10); ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
                if (!cell || !cell.v) continue;

                const val = String(cell.v);
                const upper = val.toUpperCase();

                if (upper.includes('PROJETO') && val.length < 50 && !title) {
                    if (val.length > 10) title = val;
                    else {
                        const nextCell = sheet[XLSX.utils.encode_cell({ r: R, c: C + 1 })];
                        if (nextCell) title = String(nextCell.v);
                    }
                }

                if (upper.includes('BENEFÍCIO') || upper.includes('SAVING')) {
                    benefit = val.split(':')[1]?.trim() || val;
                }

                if (upper.includes('SQUAD')) team.squad = this.getNextVal(sheet, R, C) || team.squad;
                if (upper.includes('FABRICA') || upper.includes('FÁBRICA')) team.fabrica = this.getNextVal(sheet, R, C) || team.fabrica;
                if (upper.includes('ARQ')) team.arq = this.getNextVal(sheet, R, C) || team.arq;
                if (upper.includes('AF')) team.af = this.getNextVal(sheet, R, C) || team.af;
                if (upper.includes('DEV')) team.dev = this.getNextVal(sheet, R, C) || team.dev;
            }
        }

        return { title, benefit, team };
    }

    private static getNextVal(sheet: XLSX.WorkSheet, R: number, C: number): string | null {
        let cell = sheet[XLSX.utils.encode_cell({ r: R, c: C + 1 })];
        if (cell && cell.v) return String(cell.v);
        cell = sheet[XLSX.utils.encode_cell({ r: R, c: C + 2 })];
        if (cell && cell.v) return String(cell.v);
        return null;
    }

    private static extractTasks(sheet: XLSX.WorkSheet) {
        const tasks: Task[] = [];
        let headerRow = -1;
        let colMap: Record<string, number> = {};

        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:Z100');
        for (let R = range.s.r; R <= Math.min(range.e.r, 20); ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
                if (cell && String(cell.v).toUpperCase().includes('TAREFA')) {
                    headerRow = R;
                    for (let C2 = range.s.c; C2 <= range.e.c; ++C2) {
                        const hCell = sheet[XLSX.utils.encode_cell({ r: R, c: C2 })];
                        if (hCell) {
                            const v = String(hCell.v).toUpperCase().trim();
                            if (v.includes('TAREFA')) colMap['name'] = C2;
                            if (v.includes('INICIO') || v.includes('INÍCIO')) colMap['start'] = C2;
                            if (v.includes('FIM')) colMap['end'] = C2;
                            if (v.includes('STATUS')) colMap['status'] = C2;
                            if (v.includes('PROGRESSO')) colMap['progress'] = C2;
                            if (v.includes('ETAPA') || v.includes('JIRA')) colMap['etapa'] = C2 - 1;
                        }
                    }
                    break;
                }
            }
            if (headerRow !== -1) break;
        }

        if (headerRow === -1) return { tasks: [], headerRow: -1 };

        for (let R = headerRow + 1; R <= range.e.r; ++R) {
            const nameCell = sheet[XLSX.utils.encode_cell({ r: R, c: colMap['name'] })];
            if (!nameCell || !nameCell.v) continue;

            const name = String(nameCell.v);
            const start = this.parseDate(sheet[XLSX.utils.encode_cell({ r: R, c: colMap['start'] })]);
            const end = this.parseDate(sheet[XLSX.utils.encode_cell({ r: R, c: colMap['end'] })]);
            const statusRaw = sheet[XLSX.utils.encode_cell({ r: R, c: colMap['status'] })]?.v;
            const progressRaw = sheet[XLSX.utils.encode_cell({ r: R, c: colMap['progress'] })]?.v;

            const progress = this.parseProgress(progressRaw);
            const status = this.determineStatus(statusRaw, progress, start, end);

            tasks.push({
                id: `${R}`,
                name,
                start,
                end,
                duration: 0,
                status,
                progress
            });
        }

        return { tasks, headerRow };
    }

    private static parseDate(cell: XLSX.CellObject): Date | null {
        if (!cell) return null;
        if (cell.t === 'd') return cell.v as Date;
        if (cell.t === 'n') {
            return new Date(Math.round((Number(cell.v) - 25569) * 86400 * 1000));
        }
        return null;
    }

    private static parseProgress(val: any): number {
        if (typeof val === 'number') return val <= 1 ? Math.round(val * 100) : val;
        if (typeof val === 'string' && val.includes('%')) return parseInt(val.replace('%', ''));
        return 0;
    }

    private static determineStatus(raw: any, progress: number, start: Date | null, end: Date | null): Status {
        if (raw) {
            const s = String(raw).toLowerCase().trim();
            if (s === 'a' || s === 'concluido') return 'Concluído';
            if (s === 'q' || s === 'em andamento') return 'Em Andamento';
            if (s === 'x' || s === 'bloqueado') return 'Bloqueado';
            if (s === ';' || s === 'pendente') return 'Pendente';
            if (s === 'r' || s === 'cancelado') return 'Cancelado';
        }

        if (progress === 100) return 'Concluído';

        const now = new Date();
        if (end && end < now && progress < 100) return 'Atrasado';
        if (start && start <= now && (!end || end >= now)) return 'Em Andamento';

        return 'Pendente';
    }
}
