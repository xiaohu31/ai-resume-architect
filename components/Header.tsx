
import React, { useState } from 'react';
import { useResumeStore } from '../store';
import { LayoutGrid, ClipboardCheck, History, Download, FileJson, Settings2, Sparkles } from 'lucide-react';

interface HeaderProps {
  onDiagnosis: () => void;
  onVersions: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDiagnosis, onVersions }) => {
  const { resume, updateResumeTitle } = useResumeStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${resume.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-md z-20 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isEditing ? (
            <input 
              autoFocus
              className="bg-zinc-800 border border-blue-500 rounded px-3 py-1 text-sm font-semibold outline-none w-64 ring-2 ring-blue-500/20"
              value={resume.title}
              onChange={(e) => updateResumeTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <h1 
              className="text-sm font-semibold text-zinc-100 hover:text-blue-400 cursor-pointer transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {resume.title}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onDiagnosis}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>简历诊断</span>
        </button>
        
        <div className="w-[1px] h-6 bg-zinc-800 mx-2"></div>

        <button 
          onClick={onVersions}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
          title="历史版本"
        >
          <History className="w-4 h-4" />
        </button>

        <button 
          onClick={handleExportJson}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
          title="导出 JSON"
        >
          <FileJson className="w-4 h-4" />
        </button>

        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95 no-print"
        >
          <Download className="w-4 h-4" />
          <span>导出 PDF</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
