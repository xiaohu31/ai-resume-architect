
import React, { useState, useEffect, useCallback } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Wand2, Check, X, Loader2, Zap, AlertCircle } from 'lucide-react';
import { polishText, expandText } from '../geminiService';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

const AIToolbar: React.FC = () => {
  const [selection, setSelection] = useState({ text: '', target: null as any });
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  
  const { updateBlockItemField } = useResumeStore();

  const { refs, floatingStyles } = useFloating({
    open: visible,
    onOpenChange: setVisible,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();
    
    // 只有在 textarea 内选中文字才触发
    if (selectedText && e.target instanceof HTMLTextAreaElement) {
        setSelection({
            text: selectedText,
            target: e.target
        });
        setVisible(true);
        refs.setReference({
            getBoundingClientRect: () => ({
                width: 0, height: 0,
                top: e.clientY, bottom: e.clientY,
                left: e.clientX, right: e.clientX,
                x: e.clientX, y: e.clientY
            })
        });
    } else {
        // 如果点击的不是工具栏本身，则隐藏
        if (!showCompare && !(e.target as HTMLElement).closest('.ai-toolbar-btn')) {
            setVisible(false);
        }
    }
  }, [showCompare, refs]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleAction = async (type: 'polish' | 'expand') => {
    setVisible(false);
    setShowCompare(true);
    setLoading(true);
    setError(null);
    setAiSuggestion('');

    try {
        const result = type === 'polish' ? await polishText(selection.text) : await expandText(selection.text);
        setAiSuggestion(result);
    } catch (err: any) {
        setError(err.message || "AI 助手暂时遇到了问题");
    } finally {
        setLoading(false);
    }
  };

  const handleAccept = () => {
    const textarea = selection.target;
    if (textarea && aiSuggestion) {
        const blockId = textarea.dataset.block;
        const itemId = textarea.dataset.item;
        const field = textarea.dataset.field;

        if (blockId && itemId && field) {
            const fullText = textarea.value;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = fullText.substring(0, start) + aiSuggestion + fullText.substring(end);
            
            updateBlockItemField(blockId, itemId, field, newContent);
            setShowCompare(false);
        } else {
            alert("无法定位表单字段，请重试");
        }
    }
  };

  if (!visible && !showCompare) return null;

  return (
    <>
      {visible && !showCompare && (
        <div 
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-[100] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in duration-200"
        >
          <button 
            onClick={() => handleAction('polish')}
            className="ai-toolbar-btn flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-blue-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>智能润色</span>
          </button>
          <div className="w-[1px] h-4 bg-zinc-700"></div>
          <button 
            onClick={() => handleAction('expand')}
            className="ai-toolbar-btn flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-emerald-500/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>内容扩充</span>
          </button>
        </div>
      )}

      {showCompare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-blue-500" />
                 </div>
                 <div>
                    <h3 className="font-bold text-zinc-100">AI 内容预览</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">选中内容优化建议</p>
                 </div>
               </div>
               <button onClick={() => setShowCompare(false)} className="p-2 text-zinc-500 hover:text-zinc-100"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                <div className="flex-1 p-8 overflow-y-auto">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4">原始内容</span>
                    <div className="text-sm text-zinc-500 leading-relaxed whitespace-pre-wrap italic opacity-60">
                        {selection.text}
                    </div>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto bg-blue-600/[0.03]">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-4">AI 建议方案</span>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                           <div className="text-center">
                              <p className="text-sm text-zinc-300 font-bold animate-pulse">正在精雕细琢内容...</p>
                              <p className="text-[11px] text-zinc-500 mt-2">AI 正在根据行业标准重新构思表达方式</p>
                           </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-red-400 py-20">
                           <AlertCircle className="w-12 h-12 opacity-50" />
                           <p className="text-sm font-medium">{error}</p>
                           <button onClick={() => setShowCompare(false)} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs text-zinc-300">关闭重试</button>
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap animate-in slide-in-from-bottom-2 duration-500">
                           {aiSuggestion}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
               <button 
                 onClick={() => setShowCompare(false)}
                 className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
               >
                 维持现状
               </button>
               <button 
                 disabled={loading || !!error || !aiSuggestion}
                 onClick={handleAccept}
                 className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
               >
                 <Check className="w-5 h-5" />
                 采纳建议
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIToolbar;
