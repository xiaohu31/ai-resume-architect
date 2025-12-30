
import React from 'react';
import { useResumeStore } from '../store';
import { X, Settings, Cpu, Palette, Key, ExternalLink } from 'lucide-react';

const SettingsModal: React.FC = () => {
  const { resume, updateSettings, isSettingsOpen, setSettingsOpen } = useResumeStore();

  if (!isSettingsOpen) return null;

  const handleOpenKeyManager = async () => {
    try {
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("当前环境不支持平台密钥管理。");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">全局设置</h2>
              <p className="text-xs text-zinc-500">配置 AI 模型参数与简历视觉样式</p>
            </div>
          </div>
          <button 
            onClick={() => setSettingsOpen(false)} 
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-all"
          >
            <X className="w-6 h-6"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* AI Configuration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">AI 模型配置</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6 bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800/50">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">模型名称 (Model Name)</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                  value={resume.settings.modelName}
                  onChange={(e) => updateSettings({ modelName: e.target.value })}
                  placeholder="e.gemini-3-flash-preview"
                />
                <p className="text-[10px] text-zinc-600 mt-2 px-1">支持：gemini-3-flash-preview, gemini-3-pro-preview 等</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">API 终端 (Base URL)</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                  value={resume.settings.baseUrl}
                  onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                  placeholder="https://generativelanguage.googleapis.com"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800/50 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-400">API 密钥管理</span>
                </div>
                <button 
                  onClick={handleOpenKeyManager}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-bold transition-all border border-zinc-700"
                >
                  管理平台密钥
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 italic">注：系统优先使用环境变量注入的密钥。对于 Pro 模型，需通过平台选择付费密钥。</p>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">外观排版</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-8 bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800/50">
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">字体大小</label>
                  <span className="text-xs font-mono text-blue-400">{resume.settings.fontSize}px</span>
                </div>
                <input 
                  type="range" min="10" max="16" step="0.5"
                  value={resume.settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 bg-zinc-950 rounded-lg h-1.5 appearance-none cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-4 px-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">行间距</label>
                  <span className="text-xs font-mono text-emerald-400">{resume.settings.lineHeight}</span>
                </div>
                <input 
                  type="range" min="1" max="2.5" step="0.1"
                  value={resume.settings.lineHeight}
                  onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 bg-zinc-950 rounded-lg h-1.5 appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-blue-400 transition-colors"
          >
            <span>计费说明文档</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button 
            onClick={() => setSettingsOpen(false)}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
