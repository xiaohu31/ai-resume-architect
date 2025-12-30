
import React from 'react';
import { useResumeStore } from '../store';
import { History, Download, FileJson, Sparkles, ClipboardCheck, Settings, AlertCircle, Undo2, Redo2 } from 'lucide-react';
import { useStore } from 'zustand';

interface HeaderProps {
  onDiagnosis: () => void;
  onVersions: () => void;
  onPrint: () => void;
}

const Header: React.FC<HeaderProps> = ({ onDiagnosis, onVersions, onPrint }) => {
  const { resume, updateResumeTitle, setSettingsOpen } = useResumeStore();
  // Fix: Access zundo's temporal store via type assertion to avoid TypeScript property error
  const temporalStore = (useResumeStore as any).temporal;
  // Use 'any' cast to access properties from the temporal store state which are provided by zundo
  const { undo, redo, pastStates, futureStates } = useStore(temporalStore) as any;
  const [isEditing, setIsEditing] = React.useState(false);

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${resume.title}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-md z-20 sticky top-0 no-print">
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
            <div className="group flex items-center gap-2">
              <h1 
                className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {resume.title}
              </h1>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-600 transition-opacity">点击编辑</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo Buttons */}
        <div className="flex items-center gap-1 mr-4 bg-zinc-800/50 p-1 rounded-xl border border-zinc-800">
          <button 
            disabled={!canUndo}
            onClick={() => undo()}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all group relative"
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
               撤销 (Ctrl+Z)
            </div>
          </button>
          <button 
            disabled={!canRedo}
            onClick={() => redo()}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg transition-all group relative"
            title="重做 (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
               重做 (Ctrl+Y / Ctrl+Shift+Z)
            </div>
          </button>
        </div>

        <button 
          onClick={onDiagnosis}
          className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
        >
          <ClipboardCheck className="w-4 h-4 animate-pulse" />
          <span>简历诊断</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
             ✨ AI 模拟 HR 视角，深度评估 STAR 法则与量化指标
          </div>
        </button>
        
        <div className="w-[1px] h-6 bg-zinc-800 mx-2"></div>

        <button 
          onClick={() => setSettingsOpen(true)}
          className="group relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
        >
          <Settings className="w-4 h-4" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
             配置 AI 模型与全局视觉样式
          </div>
        </button>

        <button 
          onClick={onVersions}
          className="group relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
        >
          <History className="w-4 h-4" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
             查看已保存的历史快照
          </div>
        </button>

        <button 
          onClick={handleExportJson}
          className="group relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
        >
          <FileJson className="w-4 h-4" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
             导出原始数据 (JSON) 供下次导入
          </div>
        </button>

        <div className="relative group ml-2">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>导出 PDF</span>
          </button>
          <div className="absolute top-full right-0 mt-2 px-4 py-3 bg-zinc-900 border border-zinc-700 text-[10px] text-zinc-400 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-48 z-50">
             <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-none" />
                <p><b>提示：</b>导出时请在浏览器打印对话框中勾选 <b>“背景图形”</b>，以确保颜色正常显示。</p>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
