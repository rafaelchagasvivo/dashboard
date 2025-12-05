
import * as XLSX from 'xlsx';
import { ProjectData, ProjectStatus, TaskData } from '../types';
import { addDays, isAfter, startOfToday, subDays } from 'date-fns';

// --- Helpers ---

const parseExcelDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value === 'number') {
    return addDays(new Date(1899, 11, 30), Math.floor(value));
  }
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    if (!isNaN(timestamp)) return new Date(timestamp);
    const parts = value.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  return null;
};

const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  if (typeof value === 'string') {
    let clean = value.replace(/[R$\s]/g, '');
    if (clean.includes(',') && clean.indexOf(',') > clean.lastIndexOf('.')) {
       clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
       clean = clean.replace(/,/g, '');
    }
    const float = parseFloat(clean);
    return isNaN(float) ? 0 : float;
  }
  return 0;
};

const normalizeStatus = (status: string, completionPercent: number = 0, isLate: boolean = false): ProjectStatus => {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('conclu') || s.includes('entregue') || completionPercent >= 99) return 'Concluído';
  if (s.includes('cancel')) return 'Cancelado';
  if (s.includes('atrasado') || s.includes('bloqueado')) return 'Atrasado';
  if (isLate) return 'Atrasado';
  if (completionPercent > 0) return 'Em Andamento';
  return 'Não Iniciado';
};

// --- Helper para extrair valor de chave/valor no header ---
const extractHeaderValue = (row: any[], colIndex: number, keyword: string): string => {
    const cellVal = String(row[colIndex]);
    
    // Check regex match for "Key: Value" pattern within same cell
    const regex = new RegExp(`^${keyword}[:\\s]*(.*)`, 'i');
    const match = cellVal.match(regex);
    if (match && match[1] && match[1].trim().length > 0) {
        return match[1].trim();
    }
    
    // Check if cell is exactly the keyword (or close to it), then take next cell
    // Allow for "Arq" matching "Arq" or "Arq:" or "Arquitetura"
    const cleanedCell = cellVal.toLowerCase().replace(':', '').trim();
    if (cleanedCell === keyword.toLowerCase() || cleanedCell.startsWith(keyword.toLowerCase())) {
        if (colIndex + 1 < row.length && row[colIndex + 1]) {
            return String(row[colIndex + 1]).trim();
        }
    }
    return '';
};

// --- Main Parsing Logic ---

export const parseExcelFile = async (file: File): Promise<ProjectData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const projects: ProjectData[] = [];
        const skippedSheets = ['feriados', 'config', 'instrucoes', 'menu', 'legendas', 'historico', 'capa'];

        workbook.SheetNames.forEach((sheetName) => {
          if (skippedSheets.some(skip => sheetName.toLowerCase().includes(skip))) return;
          const sheet = workbook.Sheets[sheetName];
          // Pass filename to generate unique IDs across multiple files
          const project = parseProjectSheet(sheet, sheetName, file.name);
          if (project) projects.push(project);
        });

        if (projects.length === 0) {
          // Instead of rejecting, we resolve empty so Promise.all in multi-upload doesn't fail entirely
          console.warn(`Arquivo ${file.name} não contém abas válidas de projeto.`);
          resolve([]); 
          return;
        }
        resolve(projects);
      } catch (error) {
        console.error("Parse Error:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const parseProjectSheet = (sheet: XLSX.WorkSheet, sheetName: string, fileName: string): ProjectData | null => {
  const grid = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
  if (!grid || grid.length < 5) return null;

  // 1. Metadata e Campos de Equipe
  let name = sheetName;
  let description = '';
  let saving = 0;
  
  let factory = '';
  let squad = '';
  let architect = '';
  let analyst = '';
  let developer = '';

  // Captura direta da Descrição na Célula C3 (Índice [2][2])
  if (grid.length > 2 && grid[2] && grid[2][2]) {
      description = String(grid[2][2]).trim();
  }

  // Scan first 15 rows for header info
  for (let r = 0; r < Math.min(grid.length, 15); r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
        const cellVal = String(row[c]).trim();
        const lowerVal = cellVal.toLowerCase();

        if (!cellVal) continue;

        // Saving / Benefício
        if (lowerVal.includes('benefício') || lowerVal.includes('saving')) {
            const match = cellVal.match(/[:\s]\s*(?:R\$)?\s*([\d.,]+)/);
            if (match) saving = parseCurrency(match[1]);
            else if (c + 1 < row.length) {
                const nextVal = row[c+1];
                if (typeof nextVal === 'number' || (typeof nextVal === 'string' && nextVal.match(/[\d.,]/))) {
                    saving = parseCurrency(nextVal);
                }
            }
        }

        // Equipe Parsing
        if (!factory && (lowerVal.includes('fábrica') || lowerVal.includes('fabrica'))) {
            factory = extractHeaderValue(row, c, 'fábrica') || extractHeaderValue(row, c, 'fabrica');
        }
        if (!squad && lowerVal.includes('squad')) {
            squad = extractHeaderValue(row, c, 'squad');
        }
        
        // Architect (Arq or Arquiteto)
        if (!architect) {
             if (lowerVal.includes('arquiteto')) architect = extractHeaderValue(row, c, 'arquiteto');
             else if (lowerVal === 'arq' || lowerVal.startsWith('arq:')) architect = extractHeaderValue(row, c, 'arq');
        }
        
        // Analyst (AF or Analista)
        if (!analyst) {
             if (lowerVal.includes('analista')) analyst = extractHeaderValue(row, c, 'analista');
             else if (lowerVal === 'af' || lowerVal.startsWith('af:') || lowerVal === 'analista func') analyst = extractHeaderValue(row, c, 'af') || extractHeaderValue(row, c, 'analista');
        }

        // Developer (Dev or Desenvolvedor)
        if (!developer) {
             if (lowerVal.includes('desenvol')) developer = extractHeaderValue(row, c, 'desenvol');
             else if (lowerVal.includes('dev') && !lowerVal.includes('delivery')) developer = extractHeaderValue(row, c, 'dev');
        }
    }
  }

  // 2. Identify Headers
  let headerRowIndex = -1;
  for (let r = 0; r < 20; r++) {
    const rowStr = (grid[r] || []).join(' ').toUpperCase();
    if (rowStr.includes('TAREFA') || rowStr.includes('ETAPA')) {
        headerRowIndex = r;
        break;
    }
  }

  if (headerRowIndex === -1) return null;

  const headerRow = grid[headerRowIndex].map(v => String(v).toUpperCase().trim());
  const colIndexTask = headerRow.findIndex(h => h.includes('TAREFA') || h.includes('ETAPA'));
  const colIndexStart = headerRow.findIndex(h => h.includes('INICIO') || h.includes('INÍCIO'));
  const colIndexPlannedEnd = headerRow.indexOf('FIM'); // First 'FIM'
  const colIndexExecutedEnd = headerRow.lastIndexOf('FIM'); // Last 'FIM'
  const colIndexDuration = headerRow.findIndex(h => h.includes('DIAS') || h.includes('DURAÇÃO'));
  const colIndexProgress = headerRow.findIndex(h => h.includes('PROGRE') || h.includes('%'));

  // 3. Extract Tasks & Stages
  const tasks: TaskData[] = [];
  const stageDurations: Record<string, number> = {};
  
  // Mapping key stages (normalize keywords)
  const stageKeywords: Record<string, string> = {
    'DISCOVERY': 'Discovery',
    'MAPEAMENTO': 'Discovery',
    'DELIVERY': 'Delivery',
    'DESENVOLVIMENTO': 'Desenvolvimento',
    'DEV': 'Desenvolvimento',
    'HOMOLOGAÇÃO': 'Homologação',
    'QA': 'Homologação',
    'ROLLOUT': 'Implantação',
    'IMPLANTAÇÃO': 'Implantação'
  };

  let totalProgress = 0;
  let taskCount = 0;

  for (let r = headerRowIndex + 1; r < grid.length; r++) {
    const row = grid[r];
    if (!row || (!row[0] && !row[1])) continue;

    const taskName = String(row[colIndexTask] || '').trim();
    if (!taskName) continue;

    const plannedEndVal = row[colIndexPlannedEnd];
    const executedEndVal = colIndexExecutedEnd > colIndexPlannedEnd ? row[colIndexExecutedEnd] : null;
    const durationVal = colIndexDuration > -1 ? row[colIndexDuration] : 0;
    const progressVal = colIndexProgress > -1 ? row[colIndexProgress] : 0;
    const startVal = colIndexStart > -1 ? row[colIndexStart] : null;

    const pDate = parseExcelDate(plannedEndVal);
    const eDate = parseExcelDate(executedEndVal);
    let sDate = parseExcelDate(startVal);
    
    const duration = typeof durationVal === 'number' ? durationVal : parseInt(durationVal) || 0;

    // Fallback if start date is missing but we have end and duration
    if (!sDate && pDate && duration > 0) {
        sDate = subDays(pDate, duration);
    }

    let p = 0;
    if (typeof progressVal === 'number') p = progressVal <= 1 ? progressVal * 100 : progressVal;
    else if (typeof progressVal === 'string') p = parseFloat(progressVal.replace('%', ''));
    if (isNaN(p)) p = 0;

    // Add to Task List (for Burnup & Gantt)
    if (pDate) {
        tasks.push({
            name: taskName,
            startDate: sDate ? sDate.getTime() : null,
            plannedEnd: pDate.getTime(),
            actualEnd: eDate ? eDate.getTime() : null,
            duration,
            progress: p
        });
    }

    // Capture Stage Duration
    const upperName = taskName.toUpperCase();
    for (const [key, label] of Object.entries(stageKeywords)) {
        if (upperName.includes(key)) {
            let days = duration;
            if (days === 0 && pDate && sDate) {
                days = 1; 
            }
            stageDurations[label] = (stageDurations[label] || 0) + days;
            break; 
        }
    }

    // Project Level Stats
    if (pDate) { 
        totalProgress += p;
        taskCount++;
    }
  }

  const avgProgress = taskCount > 0 ? totalProgress / taskCount : 0;
  
  // Dates
  const validPlanned = tasks.filter(t => t.plannedEnd).map(t => t.plannedEnd!);
  const validStarts = tasks.filter(t => t.startDate).map(t => t.startDate!);
  const validActual = tasks.filter(t => t.actualEnd && t.progress >= 99).map(t => t.actualEnd!);
  
  const baselineDate = validPlanned.length > 0 ? new Date(Math.max(...validPlanned)) : null;
  const startDate = validStarts.length > 0 ? new Date(Math.min(...validStarts)) : null;

  const isDone = avgProgress >= 99;
  const actualDate = (isDone && validActual.length > 0) ? new Date(Math.max(...validActual)) : null;

  const isLate = baselineDate ? isAfter(startOfToday(), baselineDate) && !isDone : false;
  const status = normalizeStatus('', avgProgress, isLate);

  if (!baselineDate && saving === 0) return null;

  // Generate unique ID based on file + sheet
  const uniqueId = `${fileName.replace(/\s+/g, '_')}-${sheetName.replace(/\s+/g, '_')}-${Date.now()}`;

  return {
    id: uniqueId,
    name: name,
    description,
    startDate,
    baselineDate,
    actualDate,
    status,
    saving,
    tasks,
    stageDurations,
    factory,
    squad,
    architect,
    analyst,
    developer
  };
};
