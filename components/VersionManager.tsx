
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../store';
import { db } from '../db';
import { ResumeVersion } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Save, Trash2, RotateCcw, Clock, Calendar, Check, Download, Layers, History, ChevronRight, AlertCircle } from 'lucide-react';

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} 天前`;
  if (hours > 0) return `${hours} 小时前`;
  if (minutes > 0) return `${minutes} 分钟前`;
  return '刚刚';
};

const VersionManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { resume, setResume } = useResumeStore();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadVersions = async () => {
    try {
      const list = await db.versions.where('resumeId').equals(resume.id).reverse().sortBy('createdAt');
      setVersions(list);
    } catch (error) {
      console.error('Failed to load versions:', error);
    }
  };

  useEffect(() => {
    loadVersions();
  }, [resume.id]);

  const handleSave = async () => {
    const name = saveName.trim() || `版本 ${new Date().toLocaleString()}`;
    setIsSaving(true);
    try {
      const newVersion: ResumeVersion = {
        id: uuidv4(),
        resumeId: resume.id,
        name: name,
        data: JSON.parse(JSON.stringify(resume)),
        createdAt: Date.now()
      };
      await db.versions.add(newVersion);
      setSaveName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      await loadVersions();
    } catch (error) {
      alert('保存快照失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = (v: ResumeVersion) => {
    if (confirm(`⚠️ 警告：正在恢复版本 "${v.name}"\n\n恢复操作将覆盖您当前的编辑内容。建议在恢复前先为当前状态保存一份快照。\n\n是否继续恢复？`)) {
      setResume(v.data);
      onClose();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`确定要永久删除版本 "${name}" 吗？此操作无法撤销。`)) {
      await db.versions.delete(id);
      loadVersions();
    }
  };

  const handleExportVersion = (v: ResumeVersion) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(v.data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${v.name}_${new Date(v.createdAt).toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <History className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight">时光机器</h3>
              <p className="text-sm text-zinc-500 font-medium">保存与恢复简历的历史快照</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-all"
          >
            <X className="w-6 h-6"/>
          </button>
        </div>

        {/* Create Snapshot Section */}
        <div className="px-8 py-6 bg-zinc-800/20 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">创建新快照</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-3.5 text-sm focus:border-blue-500 outline-none transition-all pr-12 placeholder:text-zinc-700"
                placeholder="给当前版本起个名字 (如：投递阿里版 V1.0)"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700">
                <Save className="w-4 h-4" />
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl active:scale-95 ${
                success 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {isSaving ? <RotateCcw className="w-4 h-4 animate-spin"/> : success ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
              {success ? '已成功保存' : '立即快照'}
            </button>
          </div>
        </div>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar bg-zinc-950/20">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-6 opacity-40">
              <div className="p-8 bg-zinc-800/30 rounded-full border border-zinc-800">
                <Clock className="w-16 h-16 stroke-[1]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold">暂无历史版本</p>
                <p className="text-sm">养成定期保存快照的好习惯，防止数据丢失</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">已保存的快照 ({versions.length})</span>
                <span className="text-[10px] text-zinc-600 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> 点击卡片可快速预览</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {versions.map((v) => (
                  <div 
                    key={v.id} 
                    className="group relative p-5 bg-zinc-900/50 border border-zinc-800/50 rounded-[1.5rem] hover:bg-zinc-800/40 hover:border-zinc-700 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition-colors">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-zinc-100 group-hover:text-white transition-colors flex items-center gap-2">
                          {v.name}
                          {v.data.id === resume.id && v.data.updatedAt === resume.updatedAt && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 uppercase">当前版本</span>
                          )}
                        </h4>
                        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {new Date(v.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {new Date(v.createdAt).toLocaleTimeString()}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{formatTimeAgo(v.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleExportVersion(v)}
                        className="p-2.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all"
                        title="下载为 JSON"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleRestore(v)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-blue-400/10 border border-transparent hover:border-blue-400/20 rounded-xl font-bold text-xs transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        恢复
                      </button>
                      <div className="w-[1px] h-4 bg-zinc-800 mx-1"></div>
                      <button 
                        onClick={() => handleDelete(v.id, v.name)}
                        className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="彻底删除"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-[1.5rem] bg-blue-500/0 group-hover:bg-blue-500/[0.02] pointer-events-none transition-all"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="px-8 py-4 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center">
          <p className="text-[10px] text-zinc-600 flex items-center gap-2 italic">
            <Check className="w-3 h-3 text-emerald-500" />
            所有快照均存储于本地 IndexedDB，保证您的隐私与安全
          </p>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
             <span>占用空间: {(versions.length * 0.5).toFixed(1)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionManager;
