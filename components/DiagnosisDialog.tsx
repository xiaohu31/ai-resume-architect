
import React, { useState, useEffect, useRef } from 'react';
import { useResumeStore } from '../store';
import { diagnoseResume, fixTextWithSuggestion } from '../aiService';
import { DiagnosisResult } from '../types';
import { X, ShieldAlert, CheckCircle2, Info, Loader2, Target, BarChart3, TrendingUp, Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface IssueItemProps {
    issue: any;
    resume: any;
    updateBlockItemField: any;
    onResolve: (issue: any) => void;
    isResolved: boolean;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, resume, updateBlockItemField, onResolve, isResolved }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isAiFixing, setIsAiFixing] = useState(false);
    const [aiReviewMode, setAiReviewMode] = useState(false);
    const [originalContent, setOriginalContent] = useState('');

    const canEdit = issue.blockId && issue.itemId && issue.field;
    // ... (IssueItem logic remains the same)

    const handleStartEdit = () => {
        if (!canEdit) return;
        const block = resume.blocks.find((b: any) => b.id === issue.blockId);
        const item = block?.items.find((i: any) => i.id === issue.itemId);
        if (item && issue.field) {
            setEditValue(item.fields[issue.field] || '');
            setIsEditing(true);
            setAiReviewMode(false);
        } else {
            alert("无法定位到具体内容，请手动修改");
        }
    };

    const handleAiFix = async () => {
        if (!canEdit) return;

        const block = resume.blocks.find((b: any) => b.id === issue.blockId);
        const item = block?.items.find((i: any) => i.id === issue.itemId);
        const currentText = item?.fields[issue.field] || '';

        setOriginalContent(currentText);
        setEditValue(currentText);
        setIsEditing(true);
        setAiReviewMode(true);
        setIsAiFixing(true);

        try {
            const fixedText = await fixTextWithSuggestion(currentText, issue.suggestion, `${issue.module} - ${issue.field}`);
            setEditValue(fixedText);
        } catch (error) {
            console.error("AI Fix failed", error);
            setAiReviewMode(false);
        } finally {
            setIsAiFixing(false);
        }
    };

    const handleSave = () => {
        if (canEdit) {
            updateBlockItemField(issue.blockId, issue.itemId, issue.field, editValue);
            setIsEditing(false);
            setAiReviewMode(false);
            onResolve(issue);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setAiReviewMode(false);
        setEditValue('');
    };

    // If resolved but not currently editing, show completed state
    if (isResolved && !isEditing) {
        return (
            <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 transition-all opacity-80">
                <div className="flex gap-4">
                    <div className="mt-1 flex-none w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">{issue.module} / {issue.field || 'General'}</span>
                            <button
                                onClick={handleStartEdit}
                                className="text-[10px] px-2 py-1 hover:bg-emerald-500/10 text-emerald-600 rounded font-bold transition-colors"
                            >
                                再次更改
                            </button>
                        </div>
                        <h4 className="font-bold text-zinc-300 line-through decoration-emerald-500/30">{issue.issue}</h4>
                        <p className="text-sm text-emerald-600/70 mt-1">已根据建议完成优化</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="group p-5 bg-zinc-800/40 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all">
            <div className="flex gap-4">
                <div className={`mt-1 flex-none w-8 h-8 rounded-full flex items-center justify-center ${issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                    {issue.severity === 'warning' ? <ShieldAlert className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{issue.module} / {issue.field || 'General'}</span>
                        <div className="flex items-center gap-2">
                            {canEdit && !isEditing && (
                                <>
                                    <button
                                        onClick={handleAiFix}
                                        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded font-bold transition-colors"
                                    >
                                        <Wand2 className="w-3 h-3" /> AI 修复
                                    </button>
                                    <button
                                        onClick={handleStartEdit}
                                        className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold transition-colors"
                                    >
                                        手动修改
                                    </button>
                                </>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${issue.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                {issue.severity === 'warning' ? '重要' : '建议'}
                            </span>
                        </div>
                    </div>

                    <h4 className="font-bold text-zinc-100">{issue.issue}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/50">
                        💡 <span className="text-zinc-300 font-medium">建议：</span>{issue.suggestion}
                    </p>

                    {isEditing && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 border-t border-zinc-700/50 pt-4">
                            {/* Comparison View */}
                            {aiReviewMode && !isAiFixing && (
                                <div className="mb-4 space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                                        <span>原始内容 (可复制)</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(originalContent);
                                                // Success feedback could be added here
                                            }}
                                            className="text-[10px] lowercase text-zinc-400 hover:text-blue-400 flex items-center gap-1"
                                        >
                                            复制
                                        </button>
                                    </div>
                                    <div className="p-3 bg-zinc-900/50 rounded-xl text-sm text-zinc-400 border border-zinc-800/50 leading-relaxed line-through decoration-zinc-700 select-text cursor-text">
                                        {originalContent}
                                    </div>
                                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mt-2">
                                        <Sparkles className="w-3 h-3" /> AI 优化结果 (您可以继续调整)
                                    </div>
                                </div>
                            )}

                            <div className="relative">
                                {isAiFixing && (
                                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-blue-500/30">
                                        <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
                                            <Sparkles className="w-4 h-4" />
                                            <span>AI 正在根据建议优化内容...</span>
                                        </div>
                                    </div>
                                )}
                                <textarea
                                    className={`w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-blue-500 outline-none transition-all min-h-[100px] mb-2 font-mono scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent ${aiReviewMode ? 'border-indigo-500/30 bg-indigo-500/5' : ''}`}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    placeholder="在此处直接修改内容..."
                                    data-label={`${issue.module} - ${issue.field}`}
                                    disabled={isAiFixing}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-200"
                                >
                                    {aiReviewMode ? '放弃' : '取消'}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold transition-colors shadow-lg flex items-center gap-1 ${aiReviewMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
                                >
                                    {aiReviewMode ? <><CheckCircle2 className="w-3 h-3" /> 采纳修改</> : '保存修改'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DiagnosisDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { resume, updateBlockItemField, setSettingsOpen } = useResumeStore();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [error, setError] = useState<any>(null);
    const [resolvedIssues, setResolvedIssues] = useState<Set<string>>(new Set());
    const hasRunRef = useRef(false);

    const runDiagnosis = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await diagnoseResume(resume);
            setResult(data);
        } catch (e: any) {
            console.error(e);
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasRunRef.current) {
            hasRunRef.current = true;
            runDiagnosis();
        }
    }, []);

    const handleResolve = (issue: any) => {
        const key = `${issue.blockId}-${issue.itemId}-${issue.field}`;
        setResolvedIssues(prev => new Set(prev).add(key));
    };

    const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <span>{label}</span>
                <span className={color}>{score}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100">简历诊断报告</h2>
                            <p className="text-xs text-zinc-500">基于 AI 的资深 HR 模拟分析</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!loading && result && (
                            <button
                                onClick={runDiagnosis}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> 重新诊断
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                            <Sparkles className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-zinc-200 animate-pulse">正在深度分析您的简历...</p>
                            <p className="text-sm text-zinc-500 mt-2">分析维度：完整性、STAR 法则、量化程度、表达质量</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="text-center max-w-md">
                            <h3 className="text-xl font-bold text-zinc-200 mb-2">
                                {error.name === 'AIConfigurationError' ? 'AI 配置缺失' : '诊断服务异常'}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-6">
                                {error.name === 'AIConfigurationError'
                                    ? '请先配置 API Key 才能使用智能诊断服务'
                                    : (error.message || 'AI 服务暂时不可用，请稍后再试')}
                            </p>

                            <div className="flex gap-4 justify-center">
                                {error.name === 'AIConfigurationError' ? (
                                    <button
                                        onClick={() => { onClose(); setSettingsOpen(true); }}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
                                    >
                                        前往配置
                                    </button>
                                ) : (
                                    <button
                                        onClick={runDiagnosis}
                                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-bold transition-all"
                                    >
                                        重试
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-bold transition-all"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                ) : result && (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Stats Side */}
                        <div className="w-80 border-r border-zinc-800 p-8 flex flex-col gap-10 bg-zinc-900/50">
                            <div className="text-center space-y-4">
                                <div className="relative inline-block">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                        <circle
                                            cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={377}
                                            strokeDashoffset={377 - (377 * result.totalScore) / 100}
                                            className="text-emerald-500 transition-all duration-1000"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{result.totalScore}</span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">总评分</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase tracking-widest">
                                        {result.level === 'excellent' ? '优秀' : result.level === 'good' ? '良好' : '待优化'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <ScoreBar label="内容完整性" score={result.scores.completeness} color="text-blue-400" />
                                <ScoreBar label="STAR 符合度" score={result.scores.starCompliance} color="text-purple-400" />
                                <ScoreBar label="量化程度" score={result.scores.quantification} color="text-amber-400" />
                                <ScoreBar label="表达质量" score={result.scores.expression} color="text-emerald-400" />
                            </div>
                        </div>

                        {/* Right Issues List */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-zinc-400" />
                                    <h3 className="font-bold text-zinc-300">优化建议 ({result.issues.length})</h3>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-zinc-400">
                                        进度: <span className="text-emerald-500">{resolvedIssues.size}</span> / {result.issues.length}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {result.issues
                                    .sort((a, b) => {
                                        const keyA = `${a.blockId}-${a.itemId}-${a.field}`;
                                        const keyB = `${b.blockId}-${b.itemId}-${b.field}`;
                                        const resolvedA = resolvedIssues.has(keyA);
                                        const resolvedB = resolvedIssues.has(keyB);

                                        // Resolved issues go to bottom
                                        if (resolvedA !== resolvedB) return resolvedA ? 1 : -1;
                                        // Then sort by severity
                                        return (a.severity === 'warning' ? -1 : 1);
                                    })
                                    .map((issue, idx) => (
                                        <IssueItem
                                            key={idx}
                                            issue={issue}
                                            resume={resume}
                                            updateBlockItemField={updateBlockItemField}
                                            onResolve={handleResolve}
                                            isResolved={resolvedIssues.has(`${issue.blockId}-${issue.itemId}-${issue.field}`)}
                                        />
                                    ))}

                                {result.issues.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500/40" />
                                        <p>您的简历表现非常出色，暂无明显需要优化的地方！</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiagnosisDialog;
