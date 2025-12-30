
import React, { useState } from 'react';
import { useResumeStore } from '../store';
import { User, Briefcase, Rocket, GraduationCap, Award, FileText, PlusCircle, GripVertical, ChevronRight, ChevronLeft } from 'lucide-react';
import { BlockType } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const blockIcons: Record<string, React.ReactNode> = {
  personal: <User className="w-5 h-5" />,
  work: <Briefcase className="w-5 h-5" />,
  project: <Rocket className="w-5 h-5" />,
  education: <GraduationCap className="w-5 h-5" />,
  certificate: <Award className="w-5 h-5" />,
  custom: <FileText className="w-5 h-5" />,
};

interface SortableBlockProps {
  block: any;
  activeBlockId: string | null;
  setActiveBlock: (id: string | null) => void;
  isExpanded: boolean;
}

const SortableBlock: React.FC<SortableBlockProps> = ({ block, activeBlockId, setActiveBlock, isExpanded }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group w-full px-3"
    >
      <button
        onClick={() => setActiveBlock(block.id)}
        className={`w-full p-3 rounded-xl transition-all relative flex items-center ${isExpanded ? 'justify-start gap-3' : 'justify-center'
          } ${activeBlockId === block.id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
      >
        <span className="flex-none">{blockIcons[block.type] || blockIcons.custom}</span>

        {isExpanded && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {block.title}
          </span>
        )}

        {/* Tooltip - only show when collapsed */}
        {!isExpanded && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-zinc-700 z-50">
            {block.title}
          </div>
        )}


      </button>

      {/* Small drag handle on hover */}
      <div
        {...attributes}
        {...listeners}
        className={`absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors ${isExpanded ? 'right-3' : 'right-1'
          }`}
      >
        <GripVertical className="w-4 h-4" />
      </div>
    </div>
  );
};

const SideNav: React.FC = () => {
  const { resume, activeBlockId, setActiveBlock, addCustomBlock, reorderBlocks } = useResumeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddCustom = () => {
    const title = prompt("请输入模块名称:", "新模块");
    if (title) {
      addCustomBlock(title);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  return (
    <nav className={`${isExpanded ? 'w-56' : 'w-20'} bg-zinc-950 border-r border-zinc-900 flex flex-col items-center py-6 gap-6 z-10 no-print transition-all duration-300 ease-in-out`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-100 transition-colors border border-zinc-800"
      >
        {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="flex flex-col gap-3 w-full">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={resume?.blocks?.map(b => b.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {resume?.blocks?.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                activeBlockId={activeBlockId}
                setActiveBlock={setActiveBlock}
                isExpanded={isExpanded}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex-1"></div>

      <button
        onClick={handleAddCustom}
        className={`w-full px-3 py-3 text-zinc-500 hover:text-emerald-400 transition-colors group relative flex items-center ${isExpanded ? 'justify-start gap-3' : 'justify-center'}`}
      >
        <PlusCircle className="w-6 h-6 flex-none" />
        {isExpanded && <span className="text-sm font-semibold">添加模块</span>}
        {!isExpanded && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-zinc-700">
            添加自定义模块
          </div>
        )}
      </button>
    </nav>
  );
};

export default SideNav;
