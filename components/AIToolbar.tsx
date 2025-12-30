import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Wand2, Check, X, Loader2, Zap, RefreshCcw, Trash2, ChevronRight } from 'lucide-react';
import { polishText, expandText } from '../geminiService';
import { 
  useFloating, 
  offset, 
  flip, 
  shift, 
  autoUpdate, 
  arrow, 
  FloatingArrow,
  useTransitionStyles
} from '@floating-ui/react';

const AIToolbar: React.FC = () => {
  const [selection, setSelection] = useState({ 
    text: '', 
    target: null as HTMLTextAreaElement | null, 
    start: 0, 
    end: 0 
  });
  const [mode, setMode] = useState<'toolbar' | 'loading' | 'suggestion'>('toolbar');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [visible, setVisible] = useState(false);
  const arrowRef = useRef(null);
  
  const { updateBlockItemField } = useResumeStore();

  const { refs, floatingStyles, context } = useFloating({
    open: visible,
    onOpenChange: setVisible,
    placement: 'top',
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ['bottom', 'top'] }),
      shift({ padding: 12 }),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate,
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
    open: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    close: { opacity: 0, transform: 'scale(0.95) translateY(10px)' },
  });

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // 忽略点击工具栏内部
    if ((e.target as HTMLElement).closest('.ai-floating-panel')) return;

    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();
    
    if (selectedText && e.target instanceof HTMLTextAreaElement) {
        const { clientX, clientY } = e;
        
        setSelection({
            text: selectedText,
            target: e.target,
            start: e.target.selectionStart,
            end: e.target.selectionEnd
        });

        // 使用鼠标松开位置作为虚拟定位点
        refs.setReference({
            getBoundingClientRect: () => ({
                width: 0,
                height: 0,
                top: clientY,
                bottom: clientY,
                left: clientX,
                right: clientX,
                x: clientX,
                y: clientY,
            }),
        });

        setVisible(true);
        setMode('toolbar');
    } else {
        // 只有当点击的不是工具栏时才隐藏
        if (!(e.target as HTMLElement).closest('.ai-floating-panel')) {
            setVisible(false);
        }
    }
  }, [refs]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleAction = async (type: 'polish' | 'expand') => {
    setMode('loading');
    setAiSuggestion('');

    try {
        const result = type === 'polish' ? await polishText(selection.text) : await expandText(selection.text);
        setAiSuggestion(result);
        setMode('suggestion');
    } catch (err) {
        setMode('toolbar');
        console.error("AI Action failed:", err);
    }
  };

  const handleAccept = () => {
    const textarea = selection.target;
    if (textarea && aiSuggestion) {
        const { block, item, field } = textarea.dataset;
        if (block && item && field) {
            const fullText = textarea.value;
            const newContent = 
              fullText.substring(0, selection.start) + 
              aiSuggestion + 
              fullText.substring(selection.end);
            
            updateBlockItemField(block, item, field, newContent);
            setVisible(false);
        }
    }
  };

  const handleDiscard = () => {
    setVisible(false);
    setAiSuggestion('');
  };

  if (!isMounted) return null;

  return (
    <div 
      ref={refs.setFloating} 
      style={{ ...floatingStyles, ...transitionStyles }} 
      className="z-[999] ai-floating-panel"
    >
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden w-[300px] flex flex-col ring-1 ring-white/10">
        <FloatingArrow ref={arrowRef} context={context} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
        
        {/* Header Title for Context */}
        <div className="px-3 py-2 bg-zinc-800/40 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI 选区助手</span>
            </div>
            {mode === 'suggestion' && (
                <button 
                  onClick={() => setMode('toolbar')}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" />
                </button>
            )}
        </div>

        {/* Dynamic Content Areas */}
        <div className="p-1">
            {mode === 'toolbar' && (
              <div className="flex flex-col p-1 gap-1">
                <button 
                  onClick={() => handleAction('polish')}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-blue-600/10 text-zinc-200 hover:text-blue-400 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">精简润色 (Polish)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
                <button 
                  onClick={() => handleAction('expand')}
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-600/10 text-zinc-200 hover:text-emerald-400 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold">丰富扩展 (Expand)</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              </div>
            )}

            {mode === 'loading' && (
              <div className="p-8 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">正在重塑表达</p>
                    <p className="text-[10px] text-zinc-500">AI 正在根据行业标准优化内容...</p>
                </div>
              </div>
            )}

            {mode === 'suggestion' && (
              <div className="flex flex-col">
                <div className="p-4 max-h-[180px] overflow-y-auto text-xs text-zinc-300 leading-relaxed font-medium selection:bg-blue-500/30 custom-scrollbar">
                  {aiSuggestion}
                </div>
                <div className="p-2 border-t border-zinc-800 flex gap-2">
                  <button 
                    onClick={handleDiscard}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 放弃
                  </button>
                  <button 
                    onClick={handleAccept}
                    className="flex-[2] py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" /> 采纳并替换
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Footer / Tip */}
        <div className="px-3 py-2 bg-black/20 flex items-center justify-center">
            <p className="text-[9px] text-zinc-600 font-medium">使用 Gemini-3-Flash 驱动实时优化</p>
        </div>
      </div>
    </div>
  );
};

export default AIToolbar;