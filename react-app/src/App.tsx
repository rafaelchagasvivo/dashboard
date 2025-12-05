import { useState, useMemo } from 'react';

import { Layout } from './components/Layout';
import { UploadZone } from './components/UploadZone';
import { KPICards } from './components/KPICards';
import { BurnupChart } from './components/BurnupChart';
import { GanttChart } from './components/GanttChart';
import { AverageDurationChart } from './components/AverageDurationChart';

import { ProjectTable } from './components/ProjectTable';
import { ExcelParser } from './utils/ExcelParser';
import { AnalyticsEngine } from './utils/AnalyticsEngine';
import type { ProjectData, Theme } from './types';

function App() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<string | null>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('vivo');

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'vivo'];
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
  };

  // Handle File Upload
  const handleFiles = async (files: File[]) => {
    setIsLoading(true);
    try {
      const newProjects: ProjectData[] = [];
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
    const s = new Set(projects.map(p => p.squad).filter((s): s is string => !!s && s !== 'N/A'));
    return Array.from(s).sort();
  }, [projects]);

  const factories = useMemo(() => {
    let filtered = projects;
    if (selectedSquad) {
      filtered = filtered.filter(p => p.squad === selectedSquad);
    }
    const s = new Set(filtered.map(p => p.factory).filter((s): s is string => !!s && s !== 'N/A'));
    return Array.from(s).sort();
  }, [projects, selectedSquad]);

  const technologies = useMemo(() => {
    let filtered = projects;
    if (selectedSquad) {
      filtered = filtered.filter(p => p.squad === selectedSquad);
    }
    const s = new Set(filtered.map(p => p.technology).filter((s): s is string => !!s && s !== 'N/A'));
    return Array.from(s).sort();
  }, [projects, selectedSquad]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Exclude burnup-only projects from the table
      if (p.burnupData) return false;

      const matchesSquad = selectedSquad ? p.squad === selectedSquad : true;
      const matchesFactory = selectedFactory ? p.factory === selectedFactory : true;
      const matchesTechnology = selectedTechnology.length > 0
        ? (p.technology && selectedTechnology.includes(p.technology))
        : true;
      const matchesProject = selectedProject ? p.id === selectedProject : true;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.squad && p.squad.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSquad && matchesProject && matchesSearch && matchesFactory && matchesTechnology;
    });
  }, [projects, selectedSquad, selectedProject, searchTerm, selectedFactory, selectedTechnology]);

  // Filter available projects for dropdown based on squad
  const availableProjects = useMemo(() => {
    let filtered = projects;
    if (selectedSquad) {
      filtered = filtered.filter(p => p.squad === selectedSquad);
    }
    return filtered.map(p => ({ id: p.id, name: p.name }));
  }, [projects, selectedSquad]);

  const kpis = useMemo(() => AnalyticsEngine.calculateKPIs(filteredProjects), [filteredProjects]);

  const isSingleProject = filteredProjects.length === 1;

  return (
    <Layout
      squads={squads}
      selectedSquad={selectedSquad}
      onSelectSquad={setSelectedSquad}
      onUpload={() => document.getElementById('hidden-file-input')?.click()}
      searchTerm={searchTerm}
      onSearch={setSearchTerm}
      projects={availableProjects}
      selectedProject={selectedProject}
      onSelectProject={setSelectedProject}
      theme={theme}
      toggleTheme={toggleTheme}
      factories={factories}
      selectedFactory={selectedFactory}
      onSelectFactory={setSelectedFactory}
      technologies={technologies}
      selectedTechnology={selectedTechnology}
      onSelectTechnology={setSelectedTechnology}
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
        <div className="animate-fade-in space-y-6">
          <KPICards metrics={kpis} theme={theme} />
          <GanttChart data={filteredProjects} theme={theme} singleProjectMode={isSingleProject} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BurnupChart data={filteredProjects} theme={theme} />
            </div>
            <div className="lg:col-span-1">
              <AverageDurationChart data={filteredProjects} theme={theme} />
            </div>
          </div>

          <ProjectTable projects={filteredProjects} theme={theme} />
        </div>
      )}
    </Layout>
  );
}

export default App;

