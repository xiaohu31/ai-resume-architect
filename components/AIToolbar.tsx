import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Check, X, Loader2, Zap, Copy, Bold, Italic, AlertCircle, Settings, GripVertical, GripHorizontal } from 'lucide-react';
import { polishText, expandText } from '../aiService';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
  limitShift,
} from '@floating-ui/react';

const AIToolbar: React.FC = () => {
  const [selection, setSelection] = useState({
    text: '',
    target: null as HTMLTextAreaElement | null,
    start: 0,
    end: 0
  });
  const [mode, setMode] = useState<'toolbar' | 'loading' | 'suggestion' | 'error'>('toolbar');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [error, setError] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  // Dragging state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const { updateBlockItemField, setSettingsOpen } = useResumeStore();
  const virtualElementRef = useRef<any>(null);

  const { refs, floatingStyles, update } = useFloating({
    open: visible,
    onOpenChange: setVisible,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ['top-start', 'bottom-start'] }),
      shift({
        padding: 20,
        limiter: limitShift()
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // If we are clicking inside the toolbar, don't trigger new selection logic
    if ((e.target as HTMLElement).closest('.ai-floating-panel')) return;

    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();

    // Only show if text is selected in a textarea
    if (selectedText && e.target instanceof HTMLTextAreaElement) {
      const textarea = e.target;

      setSelection({
        text: selectedText,
        target: textarea,
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });

      // Set virtual reference at cursor position
      const { clientX, clientY } = e;
      virtualElementRef.current = {
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: clientX,
            y: clientY,
            top: clientY,
            left: clientX,
            right: clientX,
            bottom: clientY,
          };
        },
      };

      refs.setReference(virtualElementRef.current);
      setVisible(true);
      setMode('toolbar');
      setDragOffset({ x: 0, y: 0 });
      currentOffsetRef.current = { x: 0, y: 0 };

      requestAnimationFrame(() => {
        update();
      });
    }
  }, [refs, update]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    // Only dismiss on click outside if we are in toolbar mode
    // In other modes (loading, suggestion, error), we want manual close
    if (visible && mode === 'toolbar' && !(e.target as HTMLElement).closest('.ai-floating-panel')) {
      handleClose();
    }
  }, [visible, mode]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleMouseUp, handleClickOutside]);

  // Dragging Logic
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - currentOffsetRef.current.x,
      y: e.clientY - currentOffsetRef.current.y
    };
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      setDragOffset({ x: newX, y: newY });
      currentOffsetRef.current = { x: newX, y: newY };
    };

    const handleMouseUpDrag = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUpDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpDrag);
    };
  }, [isDragging]);

  const handleFormat = (type: 'bold' | 'italic') => {
    const textarea = selection.target;
    if (!textarea) return;

    const { start, end, text } = selection;
    const fullText = textarea.value;
    const prefix = type === 'bold' ? '**' : '*';
    const suffix = prefix;

    const newContent =
      fullText.substring(0, start) +
      prefix + text + suffix +
      fullText.substring(end);

    // Update store
    const { block, item, field } = textarea.dataset;
    if (block && item && field) {
      updateBlockItemField(block, item, field, newContent);
    }

    // Also update textarea locally for immediate feedback
    textarea.setRangeText(prefix + text + suffix, start, end, 'select');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const handleAction = async (type: 'polish' | 'expand') => {
    setMode('loading');
    setAiSuggestion('');

    try {
      const label = selection.target?.dataset.label;
      const result = type === 'polish'
        ? await polishText(selection.text, label)
        : await expandText(selection.text, label);
      setAiSuggestion(result);
      setMode('suggestion');
    } catch (err: any) {
      setMode('error');
      setError(err);
      console.error("AI Action failed:", err);
    }
  };

  const handleAccept = () => {
    const textarea = selection.target;
    if (textarea && aiSuggestion) {
      textarea.setRangeText(aiSuggestion, selection.start, selection.end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      handleClose();
    }
  };

  const handleClose = () => {
    setVisible(false);
    setAiSuggestion('');
    setMode('toolbar');
    setDragOffset({ x: 0, y: 0 });
    currentOffsetRef.current = { x: 0, y: 0 };
  };

  return (
    <FloatingPortal>
      {visible && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            transform: `${floatingStyles.transform} translate(${dragOffset.x}px, ${dragOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="z-[999] ai-floating-panel select-none"
        >
          <div className={`
            bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            flex animate-in zoom-in-95 duration-200 ring-1 ring-white/10
            ${mode === 'suggestion' ? 'rounded-[32px] w-[540px] p-6 flex-col gap-6' : 'rounded-full p-1.5 flex-row items-center gap-1 min-w-[280px]'}
          `}>

            {/* Grabber Handle */}
            <div
              onMouseDown={handleDragStart}
              className={`flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors cursor-grab active:cursor-grabbing
                ${mode === 'suggestion' ? 'absolute top-0 left-0 right-0 h-10' : 'w-8 h-8 hover:bg-zinc-800 rounded-full flex-shrink-0'}
              `}
            >
              {mode === 'suggestion' ? (
                <GripHorizontal className="w-5 h-5 opacity-20" />
              ) : (
                <GripVertical className="w-4 h-4 opacity-40" />
              )}
            </div>

            {mode === 'toolbar' && (
              <>
                <div className="flex items-center px-1 border-r border-zinc-700/50 mr-1 gap-1">
                  <button
                    onClick={() => handleFormat('bold')}
                    className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition-all"
                    title="加粗"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFormat('italic')}
                    className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition-all"
                    title="斜体"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-1 flex-1">
                  <button
                    onClick={() => handleAction('polish')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold transition-all group whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>润色</span>
                  </button>
                  <button
                    onClick={() => handleAction('expand')}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold transition-all group whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>扩充</span>
                  </button>
                </div>

                <div className="w-[1px] h-4 bg-zinc-700/50 mx-1" />

                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-full transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}

            {mode === 'loading' && (
              <div className="flex items-center gap-3 px-6 py-3 text-blue-400 min-w-[200px]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-black italic tracking-wider uppercase">AI 正在注入灵魂...</span>
              </div>
            )}

            {mode === 'suggestion' && (
              <>
                <div className="flex items-center justify-between text-[11px] font-black text-zinc-500 uppercase tracking-widest px-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    AI 优化建议
                  </div>
                  <button onClick={handleClose} className="hover:text-zinc-200 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-6 relative z-10">
                  <div className="flex-1 text-[15px] text-zinc-200 font-medium leading-[1.8] select-text cursor-text max-h-[450px] overflow-y-auto custom-scrollbar pr-4">
                    {aiSuggestion.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-3'}>{line}</p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 shrink-0 pt-1">
                    <button
                      onClick={handleAccept}
                      className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center group"
                      title="采纳并替换"
                    >
                      <Check className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiSuggestion);
                      }}
                      className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-[20px] transition-all flex items-center justify-center group"
                      title="复制"
                    >
                      <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'error' && (
              <div className="flex items-center gap-4 px-4 py-2 min-w-[300px]">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-xs font-bold">
                    {error?.name === 'AIConfigurationError' ? '需配置 API Key' : '处理失败'}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {error?.name === 'AIConfigurationError' ? (
                    <button
                      onClick={() => { setVisible(false); setSettingsOpen(true); }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-bold transition-all border border-red-500/20"
                    >
                      去配置
                    </button>
                  ) : (
                    <button
                      onClick={() => setMode('toolbar')}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
                    >
                      重试
                    </button>
                  )}
                  <button onClick={handleClose} className="p-1.5 hover:bg-zinc-800 text-zinc-500 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </FloatingPortal>
  );
};

export default AIToolbar;
