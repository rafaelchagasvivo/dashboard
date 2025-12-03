import { Upload, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
        ${isDragging
                    ? 'border-vivo-purple bg-vivo-purple/10 scale-[1.01]'
                    : 'border-border-color bg-card-bg hover:border-vivo-purple/50'
                }
      `}
        >
            <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${isDragging ? 'bg-vivo-purple text-white' : 'bg-bg-primary text-vivo-purple'}`}>
                    <FileSpreadsheet size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Arraste seus arquivos Excel</h3>
                    <p className="text-text-primary/60 mb-6">
                        Suporta múltiplos arquivos (.xlsx). Os dados serão adicionados aos existentes.
                    </p>
                    <label className="inline-flex items-center gap-2 px-6 py-3 bg-vivo-purple hover:bg-vivo-dark text-white rounded-lg cursor-pointer transition-colors font-medium">
                        <Upload size={20} />
                        <span>Selecionar Arquivos</span>
                        <input
                            type="file"
                            multiple
                            accept=".xlsx, .xls"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
