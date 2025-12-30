
import React from 'react';
import { useResumeStore } from '../store';
import { User, Briefcase, Rocket, GraduationCap, Award, FileText, PlusCircle } from 'lucide-react';
import { BlockType } from '../types';

const blockIcons: Record<string, React.ReactNode> = {
  personal: <User className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  project: <Rocket className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  certificate: <Award className="w-5 h-5" />,
  custom: <FileText className="w-5 h-5" />,
};

const SideNav: React.FC = () => {
  const { resume, activeBlockId, setActiveBlock, addCustomBlock } = useResumeStore();

  const handleAddCustom = () => {
    const title = prompt("请输入模块名称:", "新模块");
    if (title) {
      addCustomBlock(title);
    }
  };

  return (
    <nav className="w-20 bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-10 no-print">
      <div className="flex flex-col gap-3">
        {resume.blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => setActiveBlock(block.id)}
            className={`p-3 rounded-xl transition-all relative group ${
              activeBlockId === block.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            {blockIcons[block.type] || blockIcons.custom}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-zinc-700">
              {block.title}
            </div>

            {activeBlockId === block.id && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1"></div>

      <button 
        onClick={handleAddCustom}
        className="p-3 text-zinc-500 hover:text-emerald-400 transition-colors group relative"
      >
        <PlusCircle className="w-6 h-6" />
        <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-zinc-700">
          添加自定义模块
        </div>
      </button>
    </nav>
  );
};

export default SideNav;
