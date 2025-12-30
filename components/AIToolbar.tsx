import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Check, X, Loader2, Zap, RefreshCcw, Trash2, Bold, Italic } from 'lucide-react';
import { polishText, expandText } from '../aiService';
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
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
  const virtualElementRef = useRef<any>(null);

  const { refs, floatingStyles, update } = useFloating({
    open: visible,
    onOpenChange: setVisible,
    placement: 'bottom',
    strategy: 'fixed',
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ['top', 'bottom'] }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // 忽略点击工具栏内部
    if ((e.target as HTMLElement).closest('.ai-floating-panel')) return;

    const selectionObj = window.getSelection();
    const selectedText = selectionObj?.toString().trim();

    if (selectedText && e.target instanceof HTMLTextAreaElement) {
      const textarea = e.target;

      setSelection({
        text: selectedText,
        target: textarea,
        start: textarea.selectionStart,
        end: textarea.selectionEnd
      });

      // 设置虚拟参考点
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

      // 强制更新位置
      requestAnimationFrame(() => {
        update();
      });
    } else {
      // 只有当点击的不是工具栏时才隐藏
      if (!(e.target as HTMLElement).closest('.ai-floating-panel')) {
        setVisible(false);
      }
    }
  }, [refs, update]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (visible && !(e.target as HTMLElement).closest('.ai-floating-panel')) {
      setVisible(false);
    }
  }, [visible]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleMouseUp, handleClickOutside]);

  const handleFormat = (type: 'bold' | 'italic') => {
    const textarea = selection.target;
    if (!textarea) return;

    const { block, item, field } = textarea.dataset;
    if (block && item && field) {
      const fullText = textarea.value;
      const prefix = type === 'bold' ? '**' : '*';
      const suffix = prefix;

      const newContent =
        fullText.substring(0, selection.start) +
        prefix + selection.text + suffix +
        fullText.substring(selection.end);

      updateBlockItemField(block, item, field, newContent);
      setVisible(false);
    }
  };

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

  return (
    <FloatingPortal>
      {visible && (
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles }}
          className="z-[999] ai-floating-panel"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.4)] flex items-center p-1.5 gap-1 animate-in zoom-in-95 duration-200 ring-1 ring-white/10">

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

                <div className="flex items-center gap-1.5 px-1">
                  <button
                    onClick={() => handleAction('polish')}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold transition-all group"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>润色</span>
                  </button>
                  <button
                    onClick={() => handleAction('expand')}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold transition-all group"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>扩充</span>
                  </button>
                </div>
              </>
            )}

            {mode === 'loading' && (
              <div className="flex items-center gap-3 px-4 py-2 text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold tracking-wider uppercase">AI 正在重塑...</span>
              </div>
            )}

            {mode === 'suggestion' && (
              <div className="flex items-center gap-0.5 px-1 pl-3">
                <div className="max-w-[150px] truncate text-[11px] text-zinc-300 font-medium mr-3">
                  {aiSuggestion}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDiscard}
                    className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAccept}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Check className="w-4 h-4" />
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
