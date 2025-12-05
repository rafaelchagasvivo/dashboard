import React, { useCallback, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, AlertCircle, Sun, Moon, Sparkles } from 'lucide-react';
import { parseExcelFile } from '../services/excelParser';
import { ProjectData, Theme } from '../types';
import clsx from 'clsx';

interface FileUploadProps {
  onDataLoaded: (data: ProjectData[]) => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded, theme, toggleTheme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(f => f.name.endsWith('.xlsx'));
      
      if (validFiles.length === 0) {
        throw new Error("Por favor, carregue apenas arquivos Excel (.xlsx)");
      }

      const promises = validFiles.map(file => parseExcelFile(file));
      const results = await Promise.all(promises);
      const flatData = results.flat();

      if (flatData.length === 0) {
        throw new Error("Nenhum projeto válido encontrado nos arquivos selecionados.");
      }

      setTimeout(() => {
        onDataLoaded(flatData);
        setIsLoading(false);
      }, 600);

    } catch (err: any) {
      setError(err.message || "Erro ao processar arquivos.");
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const isVivo = theme === 'vivo';

  return (
    <div className={clsx(
      "relative flex flex-col items-center justify-center min-h-screen p-6 transition-colors duration-300",
      isVivo ? "bg-vivo-roxo-escuro" : "bg-slate-50 dark:bg-slate-900"
    )}>
      
      {/* Theme Toggle in Corner */}
      <button 
        onClick={toggleTheme}
        className={clsx(
            "absolute top-6 right-6 p-2 rounded-full transition-colors",
            isVivo 
                ? "text-vivo-lilas hover:bg-vivo-lilas/20" 
                : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        )}
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'vivo' && <Sparkles className="w-5 h-5" />}
      </button>

      <div className="text-center mb-8 flex flex-col items-center">
        {isVivo ? (
            <img 
                src="https://logodownload.org/wp-content/uploads/2014/02/vivo-logo-0.png" 
                alt="Vivo" 
                className="w-32 h-auto mb-4 object-contain"
            />
        ) : (
            <div className="w-20 h-20 mb-4 bg-brand-600 dark:bg-brand-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                F
            </div>
        )}
        <h1 className={clsx("text-4xl font-bold tracking-tight mb-2", isVivo ? "text-white" : "text-slate-800 dark:text-white")}>
            Dashboard Executivo
        </h1>
        <p className={clsx("text-sm", isVivo ? "text-vivo-lilas" : "text-slate-500 dark:text-slate-400")}>
            Inteligência Executiva Local. Seus dados não saem do seu dispositivo.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          "w-full max-w-xl p-10 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer",
          isDragging 
            ? (isVivo ? 'border-vivo-lilas bg-vivo-lilas/10 scale-105' : 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-105') 
            : (isVivo 
                ? 'border-vivo-lilas/30 bg-vivo-roxo hover:border-vivo-lilas hover:bg-vivo-roxo/80' 
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-400 dark:hover:border-brand-500')
        )}
      >
        <div className="relative">
           {isLoading ? (
             <Loader2 className={clsx("w-16 h-16 animate-spin", isVivo ? "text-vivo-lilas" : "text-brand-500")} />
           ) : (
             <div className="relative">
                <FileSpreadsheet className={clsx("w-16 h-16", isVivo ? "text-vivo-lilas" : "text-slate-400 dark:text-slate-500")} />
                <div className={clsx("absolute -bottom-2 -right-2 rounded-full p-1", isVivo ? "bg-vivo-rosa text-white" : "bg-brand-500 text-white")}>
                  <UploadCloud className="w-4 h-4" />
                </div>
             </div>
           )}
        </div>

        <div className="text-center">
          <h3 className={clsx("text-lg font-semibold", isVivo ? "text-white" : "text-slate-700 dark:text-slate-200")}>
            {isLoading ? "Processando..." : "Arraste suas planilhas aqui"}
          </h3>
          <p className={clsx("text-sm mt-1", isVivo ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>
            Suporta múltiplos arquivos simultâneos (.xlsx)
          </p>
        </div>

        <input
          type="file"
          accept=".xlsx"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 animate-fade-in-up">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl">
        <div className={clsx("p-4 rounded-lg shadow-sm border transition-colors", isVivo ? "bg-vivo-roxo border-vivo-lilas/20 text-white" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200")}>
          <div className="font-semibold">100% Seguro</div>
          <div className={clsx("text-xs mt-1", isVivo ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>Processamento local. Nenhuma nuvem envolvida.</div>
        </div>
        <div className={clsx("p-4 rounded-lg shadow-sm border transition-colors", isVivo ? "bg-vivo-roxo border-vivo-lilas/20 text-white" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200")}>
          <div className="font-semibold">Multi-Arquivo</div>
          <div className={clsx("text-xs mt-1", isVivo ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>Carregue várias planilhas de uma só vez.</div>
        </div>
        <div className={clsx("p-4 rounded-lg shadow-sm border transition-colors", isVivo ? "bg-vivo-roxo border-vivo-lilas/20 text-white" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200")}>
          <div className="font-semibold">Padrão Forgia</div>
          <div className={clsx("text-xs mt-1", isVivo ? "text-white/60" : "text-slate-500 dark:text-slate-400")}>Compatível com o padrão de gestão da empresa.</div>
        </div>
      </div>
    </div>
  );
};