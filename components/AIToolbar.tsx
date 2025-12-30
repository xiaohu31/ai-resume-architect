
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Wand2, ArrowRightLeft, Check, X, Loader2, Zap } from 'lucide-react';
import { polishText, expandText } from '../geminiService';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

const AIToolbar: React.FC = () => {
  const [selection, setSelection] = useState({ text: '', x: 0, y: 0, target: null as any });
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [visible, setVisible] = useState(false);
  
  const { updateBlockItemField, resume } = useResumeStore();

  const { refs, floatingStyles, context } = useFloating({
    open: visible,
    onOpenChange: setVisible,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && e.target instanceof HTMLTextAreaElement) {
        const rect = e.target.getBoundingClientRect();
        setSelection({
            text: selectedText,
            x: e.clientX,
            y: e.clientY,
            target: e.target
        });
        setVisible(true);
        // Position floating manually for this specific case as it's relative to mouse
        refs.setReference({
            getBoundingClientRect: () => ({
                width: 0, height: 0,
                top: e.clientY, bottom: e.clientY,
                left: e.clientX, right: e.clientX,
                x: e.clientX, y: e.clientY
            })
        });
    } else {
        if (!showCompare) {
            setVisible(false);
        }
    }
  }, [showCompare, refs]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleAction = async (type: 'polish' | 'expand') => {
    setLoading(true);
    setShowCompare(true);
    try {
        const result = type === 'polish' ? await polishText(selection.text) : await expandText(selection.text);
        setAiSuggestion(result);
    } catch (err) {
        alert("AI 调用失败，请检查网络或 API 配置");
        setShowCompare(false);
    } finally {
        setLoading(false);
    }
  };

  const handleAccept = () => {
    const textarea = selection.target;
    if (textarea) {
        const fullText = textarea.value;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newText = fullText.substring(0, start) + aiSuggestion + fullText.substring(end);
        
        // Find corresponding field in store and update it
        // This is a bit tricky, we need to find which block and item the textarea belongs to
        // For simplicity in this demo, we assume the user is focusing the field currently being rendered
        // In a real app, we'd pass data-attributes to the textarea
        
        // Find by value matching (naive but works for demo)
        for (const block of resume.blocks) {
            for (const item of block.items) {
                for (const [key, val] of Object.entries(item.fields)) {
                    if (val === fullText) {
                        updateBlockItemField(block.id, item.id, key, newText);
                        break;
                    }
                }
            }
        }
    }
    setShowCompare(false);
    setVisible(false);
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
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-blue-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 润色</span>
          </button>
          <div className="w-[1px] h-4 bg-zinc-700"></div>
          <button 
            onClick={() => handleAction('expand')}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-emerald-600/20 text-emerald-400 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-emerald-500/30"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AI 扩充</span>
          </button>
        </div>
      )}

      {showCompare && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur">
               <div className="flex items-center gap-2">
                 <Wand2 className="w-5 h-5 text-blue-500" />
                 <h3 className="font-bold text-zinc-100">AI 智能辅助</h3>
               </div>
               <button onClick={() => setShowCompare(false)} className="text-zinc-500 hover:text-zinc-100"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex divide-x divide-zinc-800">
                <div className="flex-1 p-6 overflow-y-auto">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">原始内容</label>
                    <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap italic">
                        {selection.text}
                    </div>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto bg-blue-500/5">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-4">AI 优化建议</label>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
                           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                           <p className="text-sm animate-pulse">正在精雕细琢，请稍候...</p>
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap animate-in slide-in-from-bottom-2 duration-500">
                           {aiSuggestion}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/50">
               <button 
                 onClick={() => setShowCompare(false)}
                 className="px-6 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
               >
                 维持现状
               </button>
               <button 
                 disabled={loading}
                 onClick={handleAccept}
                 className="px-8 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
               >
                 <Check className="w-4 h-4" />
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
