import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Check, X, Loader2, Zap, Copy, RefreshCcw, Scissors, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { polishText, expandText, simplifyText, summarizeText } from '../geminiService';

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
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  const handleAction = async (action: 'polish' | 'expand' | 'simplify' | 'summarize') => {
    if (!value.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestion('');
    
    try {
      let result = '';
      switch(action) {
        case 'polish': result = await polishText(value); break;
        case 'expand': result = await expandText(value); break;
        case 'simplify': result = await simplifyText(value); break;
        case 'summarize': result = await summarizeText(value); break;
      }
      setSuggestion(result);
    } catch (err: any) {
      setError(err.message || "服务异常");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{label}</label>
        <span className="text-[10px] text-zinc-600">字数: {value.length} / 1000</span>
      </div>
      
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all">
        <textarea 
          rows={5}
          className="w-full bg-transparent px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 resize-none font-sans leading-relaxed custom-scrollbar"
          value={value}
          placeholder={placeholder}
          data-block={blockId}
          data-item={itemId}
          data-field={field}
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
              { id: 'simplify', label: '简化', icon: Scissors },
              { id: 'expand', label: '扩展', icon: Zap },
              { id: 'summarize', label: '总结', icon: MessageSquare },
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
          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            今日剩余20次 <AlertCircle className="w-3 h-3" />
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
              {!loading && (
                <button onClick={() => setSuggestion('')} className="text-zinc-500 hover:text-zinc-200"><X className="w-4 h-4" /></button>
              )}
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-blue-500/10 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-blue-500/10 rounded w-4/5 animate-pulse"></div>
                </div>
              ) : error ? (
                <div className="text-xs text-red-400 font-bold">{error}</div>
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