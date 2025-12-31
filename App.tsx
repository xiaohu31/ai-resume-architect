
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import SideNav from './components/SideNav';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import AIToolbar from './components/AIToolbar';
import DiagnosisDialog from './components/DiagnosisDialog';
import VersionManager from './components/VersionManager';
import SettingsModal from './components/SettingsModal';
import StylePanel from './components/StylePanel';
import { useResumeStore } from './store';
import * as ReactToPrint from 'react-to-print';
import { Palette } from 'lucide-react';

const App: React.FC = () => {
  const { resume } = useResumeStore();
  const temporalStore = (useResumeStore as any).temporal;
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [zoom, setZoom] = useState(0.85);

  const contentRef = useRef<HTMLDivElement>(null);

  const useReactToPrintHook = useMemo(() => {
    return (ReactToPrint as any).useReactToPrint || (ReactToPrint as any).default?.useReactToPrint;
  }, []);

  const handlePrint = typeof useReactToPrintHook === 'function'
    ? useReactToPrintHook({
      contentRef,
      documentTitle: resume.title || '我的简历',
    })
    : null;

  const triggerPrint = () => {
    if (handlePrint) {
      handlePrint();
    } else {
      window.print();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 's') { e.preventDefault(); setShowVersions(true); }
      if (isCmdOrCtrl && e.key === 'p') { e.preventDefault(); triggerPrint(); }
      if (isCmdOrCtrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); temporalStore.getState().undo(); }
      if ((isCmdOrCtrl && e.shiftKey && e.key === 'z') || (isCmdOrCtrl && e.key === 'y')) { e.preventDefault(); temporalStore.getState().redo(); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resume.title, handlePrint, temporalStore]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Header
        onDiagnosis={() => setShowDiagnosis(true)}
        onVersions={() => setShowVersions(true)}
        onPrint={triggerPrint}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <SideNav />

        <main className="flex-1 flex overflow-hidden">
          <div className="w-1/2 h-full border-r border-zinc-800 overflow-y-auto bg-zinc-900/50 backdrop-blur-sm">
            <EditorPanel />
          </div>

          <div className="w-1/2 h-full overflow-hidden flex flex-col bg-zinc-900 relative">
            {/* 💡 方案优化：改为绝对定位的悬浮“药丸”控件，不再占据垂直空间 */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-900/60 backdrop-blur-xl border border-white/5 px-2 py-1.5 rounded-full shadow-2xl z-30 no-print transition-all hover:bg-zinc-900/80 hover:border-white/10 group/controls">
              <div className="flex items-center gap-1 relative">
                {/* 样式定制核心入口 */}
                <button
                  onClick={() => setShowStylePanel(!showStylePanel)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${showStylePanel
                      ? 'bg-white text-zinc-900 shadow-xl scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>样式定制</span>
                </button>

                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>

                {/* 缩放控制交互 */}
                <div className="flex items-center gap-2 px-1 text-zinc-400">
                  <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="hover:text-white px-1.5 py-0.5 transition-colors text-base font-bold">-</button>
                  <span className="text-[10px] w-9 text-center font-bold tracking-tighter text-zinc-300 font-mono italic">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="hover:text-white px-1.5 py-0.5 transition-colors text-base font-bold">+</button>
                </div>

                {/* StylePanel 弹出层 */}
                <StylePanel isOpen={showStylePanel} onClose={() => setShowStylePanel(false)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pt-4 pb-12 px-8 flex justify-center bg-zinc-950/20 scrollbar-hide">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                <PreviewPanel ref={contentRef} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <AIToolbar />
      <SettingsModal />

      {showDiagnosis && <DiagnosisDialog onClose={() => setShowDiagnosis(false)} />}
      {showVersions && <VersionManager onClose={() => setShowVersions(false)} />}
    </div>
  );
};

export default App;
