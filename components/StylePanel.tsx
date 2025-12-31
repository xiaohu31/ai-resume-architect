
import React, { useState, useRef, useEffect } from 'react';
import { Palette, X, Type, AlignJustify, Layout, Maximize } from 'lucide-react';
import { useResumeStore } from '../store';
import { templateRegistry } from './templates';

interface StylePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ isOpen, onClose }) => {
    const { resume, updateSettings } = useResumeStore();
    const panelRef = useRef<HTMLDivElement>(null);

    const currentTemplateId = resume?.settings?.templateId || 'classic';
    const fontSize = resume?.settings?.fontSize || 11;
    const lineHeight = resume?.settings?.lineHeight || 1.6;
    const pagePadding = resume?.settings?.pagePadding || 15;
    const moduleTitleSize = resume?.settings?.moduleTitleSize || 18;

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-12 left-1/2 -translate-x-1/2 w-80 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col max-h-[calc(100vh-160px)] min-h-[200px]"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-800/50 shrink-0">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                    <Palette className="w-4 h-4 text-blue-400" />
                    样式设置
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-6 text-left overflow-y-auto">
                {/* 模版选择 */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                        <Layout className="w-3.5 h-3.5" />
                        模版风格
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(templateRegistry).map((template) => (
                            <button
                                key={template.id}
                                onClick={() => updateSettings({ templateId: template.id as any })}
                                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all border ${currentTemplateId === template.id
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 hover:border-zinc-600'
                                    }`}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 字体大小 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            <Type className="w-3.5 h-3.5" />
                            字体大小
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{fontSize}px</span>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="24"
                        step="0.5"
                        value={fontSize}
                        onChange={(e) => updateSettings({ fontSize: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>8px</span>
                        <span>24px</span>
                    </div>
                </div>

                {/* 模块标题大小 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            <Maximize className="w-3.5 h-3.5" />
                            模块标题大小
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{moduleTitleSize}px</span>
                    </div>
                    <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={moduleTitleSize}
                        onChange={(e) => updateSettings({ moduleTitleSize: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>12px</span>
                        <span>32px</span>
                    </div>
                </div>

                {/* 行间距 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            <AlignJustify className="w-3.5 h-3.5" />
                            行间距
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{lineHeight.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min="0.8"
                        max="3.0"
                        step="0.1"
                        value={lineHeight}
                        onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>紧凑 (0.8)</span>
                        <span>宽松 (3.0)</span>
                    </div>
                </div>

                {/* 字体选择 */}
                <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">
                        <Palette className="w-3.5 h-3.5" />
                        字体选择
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', name: 'Inter (默认)' },
                            { id: '"Alibaba PuHuiTi 3.0", "Noto Sans SC", sans-serif', name: '阿里惠普体' },
                            { id: '"Noto Sans SC", sans-serif', name: '思源黑体' },
                            { id: '"Microsoft YaHei", sans-serif', name: '微软雅黑' }
                        ].map((font) => (
                            <button
                                key={font.id}
                                onClick={() => updateSettings({ fontFamily: font.id })}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${resume?.settings?.fontFamily === font.id
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 hover:border-zinc-600'
                                    }`}
                                style={{ fontFamily: font.id }}
                            >
                                {font.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 页边距 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                            <Maximize className="w-3.5 h-3.5" />
                            页边距
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{pagePadding}mm</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        step="1"
                        value={pagePadding}
                        onChange={(e) => updateSettings({ pagePadding: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                        <span>0mm</span>
                        <span>50mm</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StylePanel;
