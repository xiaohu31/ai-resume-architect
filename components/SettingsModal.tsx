
import React, { useState } from 'react';
import { useResumeStore } from '../store';
import { X, Settings, Cpu, Palette, Key, ExternalLink, Eye, EyeOff } from 'lucide-react';

const SettingsModal: React.FC = () => {
  const { resume, updateSettings, isSettingsOpen, setSettingsOpen } = useResumeStore();
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isSettingsOpen) return null;

  // 检查环境变量是否有 API Key
  // @ts-ignore - Vite 在构建时会替换这个值
  const envApiKey = process.env.GEMINI_API_KEY || '';
  const hasEnvKey = !!envApiKey;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">全局设置</h2>
              <p className="text-xs text-zinc-500">配置 AI 模型参数与简历视觉样式</p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* AI Configuration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">AI 模型配置</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 bg-zinc-800/20 p-6 rounded-2xl border border-zinc-800/50">
              {/* 提供商选择 */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-1">AI 提供商 (Provider)</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => updateSettings({ provider: 'gemini' })}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${(resume.settings.provider || 'gemini') === 'gemini'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    onClick={() => updateSettings({ provider: 'openai' })}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${resume.settings.provider === 'openai'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                  >
                    OpenAI 兼容
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">模型名称 (Model Name)</label>
                <input
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                  value={resume.settings.modelName}
                  onChange={(e) => updateSettings({ modelName: e.target.value })}
                  placeholder={(resume.settings.provider || 'gemini') === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini'}
                />
                <p className="text-[10px] text-zinc-600 mt-2 px-1">
                  {(resume.settings.provider || 'gemini') === 'gemini'
                    ? '支持：gemini-2.0-flash、gemini-1.5-pro 等'
                    : '支持：gpt-4o-mini、gpt-3.5-turbo、deepseek-chat 等'}
                </p>
              </div>

              {/* 自定义端点（仅OpenAI） */}
              {resume.settings.provider === 'openai' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">API 端点 (Custom Endpoint) <span className="text-zinc-600">- 可选</span></label>
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                    value={resume.settings.apiEndpoint || ''}
                    onChange={(e) => updateSettings({ apiEndpoint: e.target.value })}
                    placeholder="https://api.openai.com/v1 或第三方兼容服务"
                  />
                  <p className="text-[10px] text-zinc-600 mt-2 px-1">留空使用默认 OpenAI 端点；填写时支持 DeepSeek、Claude 等第三方服务</p>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800/50 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-400">API 密钥</span>
                  {hasEnvKey && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">环境变量已配置</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm focus:border-blue-500 outline-none transition-all font-mono"
                    value={resume.settings.apiKey || ''}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                    placeholder={hasEnvKey ? '已使用环境变量密钥' : '输入你的 Gemini API Key'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 px-1">优先级：环境变量 GEMINI_API_KEY &gt; 此处输入的密钥</p>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-blue-400 transition-colors"
          >
            <span>计费说明文档</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div >
  );
};

export default SettingsModal;
