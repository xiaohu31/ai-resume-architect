
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
import { useResumeStore } from './store';
import * as ReactToPrint from 'react-to-print';

const App: React.FC = () => {
  const { resume } = useResumeStore();
  const temporalStore = (useResumeStore as any).temporal;
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
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
          
          <div className="w-1/2 h-full overflow-hidden flex flex-col bg-zinc-900">
            <div className="flex-none p-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md z-10 no-print">
              <span className="text-sm font-medium text-zinc-400">实时预览 (A4)</span>
              <div className="flex items-center gap-4 bg-zinc-800 rounded-lg px-2 py-1 shadow-inner">
                <button onClick={() => setZoom(Math.max(0.4, zoom - 0.1))} className="hover:text-blue-400 p-1 transition-colors">-</button>
                <span className="text-xs w-12 text-center text-zinc-300 font-mono">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="hover:text-blue-400 p-1 transition-colors">+</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-950/50 scrollbar-hide">
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
