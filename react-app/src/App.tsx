import { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { UploadZone } from './components/UploadZone';
import { KPICards } from './components/KPICards';
import { BurnupChart, DurationChart, GanttChart } from './components/Charts';
import { ProjectTable } from './components/ProjectTable';
import { ExcelParser } from './utils/ExcelParser';
import { AnalyticsEngine } from './utils/AnalyticsEngine';
import type { Project } from './types';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle File Upload
  const handleFiles = async (files: File[]) => {
    setIsLoading(true);
    try {
      const newProjects: Project[] = [];
      for (const file of files) {
        const parsed = await ExcelParser.parseFile(file);
        newProjects.push(...parsed);
      }

      setProjects(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = newProjects.filter(p => !existingIds.has(p.id));
        return [...prev, ...uniqueNew];
      });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erro ao ler arquivos. Verifique o formato.");
    } finally {
      setIsLoading(false);
    }
  };

  // Derived State
  const squads = useMemo(() => {
    const s = new Set(projects.map(p => p.team.squad).filter(s => s !== 'N/A'));
    return Array.from(s).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSquad = selectedSquad ? p.team.squad === selectedSquad : true;
      const matchesProject = selectedProject ? p.id === selectedProject : true;
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.team.squad.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSquad && matchesProject && matchesSearch;
    });
  }, [projects, selectedSquad, selectedProject, searchTerm]);

  const kpis = useMemo(() => AnalyticsEngine.calculateKPIs(filteredProjects), [filteredProjects]);

  const singleProject = filteredProjects.length === 1 ? filteredProjects[0] : null;

  return (
    <Layout
      squads={squads}
      selectedSquad={selectedSquad}
      onSelectSquad={setSelectedSquad}
      onUpload={() => document.getElementById('hidden-file-input')?.click()}
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
      projects={projects.map(p => ({ id: p.id, title: p.title }))}
      selectedProject={selectedProject}
      onSelectProject={setSelectedProject}
    >
      <input
        id="hidden-file-input"
        type="file"
        multiple
        accept=".xlsx, .xls"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
      />

      {projects.length === 0 ? (
        <div className="max-w-2xl mx-auto mt-20">
          <UploadZone onFilesSelected={handleFiles} />
          {isLoading && <p className="text-center mt-4 text-vivo-purple animate-pulse">Processando...</p>}
        </div>
      ) : (
        <div className="animate-fade-in">
          <KPICards kpis={kpis} />

          {/* Gantt Chart (Full Width) */}
          <div className="mb-8">
            <GanttChart projects={filteredProjects} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-[400px]">
              <h3 className="text-lg font-bold mb-4">Burnup de Entregas</h3>
              {singleProject ? (
                <BurnupChart project={singleProject} />
              ) : (
                <div className="bg-white dark:bg-card-bg border border-border-color p-8 rounded-xl h-full flex flex-col items-center justify-center text-center shadow-sm">
                  <p className="text-text-primary/60 mb-2">Selecione um único projeto para ver o Burnup</p>
                </div>
              )}
            </div>
            <div className="h-[400px]">
              <h3 className="text-lg font-bold mb-4">Duração Média por Etapa</h3>
              <DurationChart projects={filteredProjects} />
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Detalhamento</h2>
          <ProjectTable projects={filteredProjects} />
        </div>
      )}
    </Layout>
  );
}

export default App;
