import React, { useState, useEffect, useRef } from 'react';
import { useResumeStore } from '../store';
import { Sparkles, Wand2, Check, X, Loader2, Zap, Copy, RefreshCcw, Scissors, MessageSquare, AlertCircle, TrendingUp, List, ListOrdered, Settings } from 'lucide-react';
import { polishText, expandText, simplifyText, summarizeText } from '../aiService';

interface FieldAIAssistantProps {
  value: string;
  onApply: (newValue: string) => void;
  label: string;
  placeholder: string;
  blockId: string;
  itemId: string;
  field: string;
}

const FieldAIAssistant: React.FC<FieldAIAssistantProps> = ({ value, onApply, label, placeholder, blockId, itemId, field }) => {
  const { setSettingsOpen } = useResumeStore();
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const steps = ["分析上下文...", "挖掘技能点...", "对齐 STAR 法则...", "精雕细琢表达..."];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((s) => (s + 1) % steps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAction = async (action: 'polish' | 'expand') => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestion('');

    try {
      let result = '';
      switch (action) {
        case 'polish': result = await polishText(value, label); break;
        case 'expand': result = await expandText(value, label); break;
      }
      setSuggestion(result);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleList = (type: 'ul' | 'ol') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // 如果没有任何选中，则视为处理全部文本
    const isFullText = start === end && text.length > 0;

    let rangeStart, rangeEnd;
    if (isFullText || (start === 0 && end === text.length)) {
      rangeStart = 0;
      rangeEnd = text.length;
    } else {
      rangeStart = text.lastIndexOf('\n', start - 1) + 1;
      rangeEnd = text.indexOf('\n', end);
      if (rangeEnd === -1) rangeEnd = text.length;
    }

    const before = text.substring(0, rangeStart);
    const after = text.substring(rangeEnd);
    const selection = text.substring(rangeStart, rangeEnd);

    if (!selection && !isFullText) return;

    const lines = selection.split('\n');

    // 检查是否已经是同类型的列表，如果是则取消列表
    const ulRegex = /^(\s*)-\s+/;
    const olRegex = /^(\s*)\d+\.\s+/;

    const isAllUl = lines.every(l => ulRegex.test(l) || !l.trim());
    const isAllOl = lines.every(l => olRegex.test(l) || !l.trim());

    let processedLines;
    if (type === 'ul') {
      if (isAllUl) {
        // 取消无序列表
        processedLines = lines.map(l => l.replace(ulRegex, '$1'));
      } else {
        // 变更为无序列表
        processedLines = lines.map(l => {
          if (olRegex.test(l)) return l.replace(olRegex, '$1- ');
          if (ulRegex.test(l)) return l;
          return `- ${l}`;
        });
      }
    } else {
      if (isAllOl) {
        // 取消有序列表
        processedLines = lines.map(l => l.replace(olRegex, '$1'));
      } else {
        // 变更为有序列表，强制重新排序
        let counter = 1;
        processedLines = lines.map(l => {
          const content = l.replace(ulRegex, '$1').replace(olRegex, '$1').trim();
          if (!content && !l.trim()) return l;
          return `${counter++}. ${content}`;
        });
      }
    }

    const newFullText = before + processedLines.join('\n') + after;
    onApply(newFullText);

    // 恢复焦点并尽量保持选区
    requestAnimationFrame(() => {
      textarea.focus();
      if (!isFullText) {
        textarea.setSelectionRange(rangeStart, rangeStart + processedLines.join('\n').length);
      }
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-800/50 rounded-lg p-0.5 border border-zinc-700/30">
            <button
              onClick={() => handleList('ul')}
              className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-md transition-all"
              title="无序列表"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-zinc-700 mx-0.5 opacity-50" />
            <button
              onClick={() => handleList('ol')}
              className="p-1.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-md transition-all"
              title="有序列表"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-600">字数: {value.length} / 1000</span>
        </div>
      </div>

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all">
        <textarea
          ref={textareaRef}
          rows={5}
          className="w-full bg-transparent px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 resize-none font-sans leading-relaxed custom-scrollbar"
          value={value}
          placeholder={placeholder}
          data-block={blockId}
          data-item={itemId}
          data-field={field}
          data-label={label}
          onChange={(e) => onApply(e.target.value)}
        />

        {/* AI Action Bar */}
        <div className="h-12 bg-[#0d1e1e] flex items-center justify-between px-3 border-t border-zinc-800/50">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 text-emerald-400 mr-2">
              <Sparkles className="w-3.5 h-3.5 fill-current opacity-70" />
              <span className="text-xs font-black italic">AI+</span>
            </div>

            {[
              { id: 'polish', label: '润色', icon: Wand2 },
              { id: 'expand', label: '扩展', icon: Zap },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleAction(btn.id as any)}
                disabled={loading || !value.trim()}
                className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50 rounded-lg text-[11px] font-medium text-zinc-200 transition-all flex items-center gap-1.5 disabled:opacity-20"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestion Card */}
      {(loading || suggestion || error) && (
        <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-600/[0.03] border border-blue-500/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-4 py-2 bg-blue-600/10 flex items-center justify-between border-b border-blue-500/10">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                {loading ? steps[loadingStep] : 'AI 优化建议'}
              </span>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                {loading ? steps[loadingStep] : 'AI 优化建议'}
              </span>
              {!loading && (
                <button
                  onClick={() => { setSuggestion(''); setError(null); }}
                  className="text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-blue-500/10 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-blue-500/10 rounded w-4/5 animate-pulse"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-red-400 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error.name === 'AIConfigurationError' ? '请先配置 AI Key' : (error.message || "服务异常")}
                  </div>
                  {error.name === 'AIConfigurationError' && (
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all font-bold flex items-center justify-center gap-1"
                    >
                      <Settings className="w-3 h-3" /> 去配置
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-zinc-200 leading-relaxed font-medium bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/50">
                    {suggestion}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onApply(suggestion); setSuggestion(''); }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> 采纳优化内容
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(suggestion)} className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 rounded-xl text-xs font-bold transition-all">复制</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldAIAssistant;