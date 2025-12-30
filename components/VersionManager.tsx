
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '../store';
import { db } from '../db';
import { ResumeVersion } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { X, Save, Trash2, RotateCcw, Clock, Calendar, Check } from 'lucide-react';

const VersionManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { resume, setResume } = useResumeStore();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [saveName, setSaveName] = useState('');
  const [success, setSuccess] = useState(false);

  const loadVersions = async () => {
    const list = await db.versions.where('resumeId').equals(resume.id).reverse().sortBy('createdAt');
    setVersions(list);
  };

  useEffect(() => {
    loadVersions();
  }, []);

  const handleSave = async () => {
    if (!saveName) return;
    const newVersion: ResumeVersion = {
        id: uuidv4(),
        resumeId: resume.id,
        name: saveName,
        data: JSON.parse(JSON.stringify(resume)),
        createdAt: Date.now()
    };
    await db.versions.add(newVersion);
    setSaveName('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    loadVersions();
  };

  const handleRestore = (v: ResumeVersion) => {
    if (confirm(`确定恢复到版本 "${v.name}" 吗？当前未保存的修改将会丢失。`)) {
        setResume(v.data);
        onClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此版本吗？')) {
        await db.versions.delete(id);
        loadVersions();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[70vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-zinc-100">历史版本管理</h3>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X className="w-5 h-5"/></button>
            </div>

            <div className="p-6 bg-zinc-800/20 border-b border-zinc-800">
                <p className="text-xs text-zinc-500 mb-3 font-bold uppercase tracking-widest">创建新快照</p>
                <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all"
                      placeholder="例如：投递阿里版、V1.0..."
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                    />
                    <button 
                      onClick={handleSave}
                      className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${success ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                      {success ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
                      {success ? '已保存' : '保存当前'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                {versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 italic">
                        <Clock className="w-12 h-12 opacity-10" />
                        <p>暂无保存的版本</p>
                    </div>
                ) : (
                    versions.map((v) => (
                        <div key={v.id} className="group p-4 bg-zinc-800/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-800/60 transition-all flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-zinc-200">{v.name}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(v.createdAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(v.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleRestore(v)}
                                  className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" 
                                  title="恢复此版本"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(v.id)}
                                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                  title="删除此版本"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default VersionManager;
