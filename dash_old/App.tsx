import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { ProjectData, Theme } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<ProjectData[] | null>(null);
  
  // Theme State: 'light' | 'dark' | 'vivo'
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Reset classes
    document.documentElement.classList.remove('dark', 'vivo');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'vivo') {
      // Vivo theme behaves like dark mode for text contrast + specific vivo styling
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('vivo');
      document.body.style.backgroundColor = '#180024'; // Force dark purple body for vivo
    } else {
      document.body.style.backgroundColor = ''; // Reset for light
    }
  }, [theme]);

  const cycleTheme = () => {
    setTheme(current => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'vivo';
      return 'light';
    });
  };

  const handleAppendData = (newData: ProjectData[]) => {
    setData(prev => {
      if (!prev) return newData;
      // Merge unique projects based on ID to prevent duplicates if user uploads same file twice
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = newData.filter(p => !existingIds.has(p.id));
      return [...prev, ...uniqueNew];
    });
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'vivo' ? 'bg-vivo-roxo-escuro text-white' : 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100'}`}>
      {!data ? (
        <FileUpload 
          onDataLoaded={setData} 
          theme={theme}
          toggleTheme={cycleTheme}
        />
      ) : (
        <Dashboard 
            data={data} 
            onReset={() => setData(null)}
            onAppendData={handleAppendData}
            theme={theme}
            toggleTheme={cycleTheme}
        />
      )}
    </div>
  );
};

export default App;