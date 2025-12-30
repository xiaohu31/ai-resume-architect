
import React, { useState } from 'react';
import { useResumeStore } from '../store';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, AlertCircle, Calendar, ChevronLeft, ChevronRight, Settings, Sparkles, Wand2, Palette, FileCheck } from 'lucide-react';
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
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';

// --- MonthPicker Component ---
interface MonthPickerProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
}

const MonthPicker: React.FC<MonthPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const handleSelect = (monthIdx: number) => {
    const monthStr = (monthIdx + 1).toString().padStart(2, '0');
    onChange(`${currentYear}.${monthStr}`);
    setIsOpen(false);
  };

  const handlePresent = () => {
    onChange('至今');
    setIsOpen(false);
  };

  return (
    <div className="relative mb-4 flex-1">
      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">{label}</label>
      <button
        ref={refs.setReference}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-left focus:border-blue-500 outline-none transition-all flex items-center justify-between"
      >
        <span className={value ? 'text-zinc-100' : 'text-zinc-500'}>{value || '选择日期'}</span>
        <Calendar className="w-4 h-4 text-zinc-600" />
      </button>

      {isOpen && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-[120] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 w-64 animate-in fade-in zoom-in duration-200"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
            <button onClick={() => setCurrentYear(currentYear - 1)} className="p-1 hover:text-blue-400"><ChevronLeft className="w-4 h-4"/></button>
            <span className="font-bold text-zinc-100">{currentYear} 年</span>
            <button onClick={() => setCurrentYear(currentYear + 1)} className="p-1 hover:text-blue-400"><ChevronRight className="w-4 h-4"/></button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {months.map((m, idx) => {
              const dateVal = `${currentYear}.${(idx + 1).toString().padStart(2, '0')}`;
              const isSelected = value === dateVal;
              return (
                <button
                  key={m}
                  onClick={() => handleSelect(idx)}
                  className={`py-2 text-[11px] rounded-lg transition-all ${
                    isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <button
            onClick={handlePresent}
            className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all border ${
              value === '至今' ? 'bg-zinc-800 border-blue-500 text-blue-400' : 'bg-zinc-800 border-transparent hover:border-zinc-700 text-zinc-300'
            }`}
          >
            至今
          </button>
        </div>
      )}
    </div>
  );
};

// --- SortableItem Component ---
interface SortableItemProps {
  item: any;
  idx: number;
  activeBlock: any;
  updateBlockItemField: any;
  removeBlockItem: any;
  toggleBlockItemExpanded: any;
}

const SortableItem = ({ 
  item, 
  idx, 
  activeBlock, 
  updateBlockItemField, 
  removeBlockItem, 
  toggleBlockItemExpanded 
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  const handleDurationChange = (part: 'start' | 'end', val: string) => {
    const current = item.fields.duration || '';
    const parts = current.split(' - ');
    const start = part === 'start' ? val : (parts[0] || '');
    const end = part === 'end' ? val : (parts[1] || '');
    updateBlockItemField(activeBlock.id, item.id, 'duration', `${start} - ${end}`);
  };

  const renderField = (field: string, label: string, placeholder: string, type: 'text' | 'textarea' = 'text') => {
    const value = item.fields[field] || '';

    return (
      <div key={field} className="mb-4">
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-1">{label}</label>
        {type === 'text' ? (
          <input 
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600"
            value={value}
            placeholder={placeholder}
            data-block={activeBlock.id}
            data-item={item.id}
            data-field={field}
            onChange={(e) => updateBlockItemField(activeBlock.id, item.id, field, e.target.value)}
          />
        ) : (
          <textarea 
            rows={4}
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 resize-none font-sans leading-relaxed"
            value={value}
            placeholder={placeholder}
            data-block={activeBlock.id}
            data-item={item.id}
            data-field={field}
            onChange={(e) => updateBlockItemField(activeBlock.id, item.id, field, e.target.value)}
          />
        )}
      </div>
    );
  };

  const renderDurationFields = () => {
    const parts = (item.fields.duration || '').split(' - ');
    return (
      <div className="flex gap-4 items-end mb-4">
        <MonthPicker label="开始时间" value={parts[0] || ''} onChange={(v) => handleDurationChange('start', v)} />
        <div className="mb-4 pb-2 font-bold text-zinc-600">至</div>
        <MonthPicker label="结束时间" value={parts[1] || ''} onChange={(v) => handleDurationChange('end', v)} />
      </div>
    );
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
    >
      <div 
        className="flex items-center justify-between px-4 py-3 bg-zinc-800/20 cursor-pointer hover:bg-zinc-800/40"
        onClick={() => toggleBlockItemExpanded(activeBlock.id, item.id)}
      >
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:text-zinc-300">
            <GripVertical className="w-4 h-4 text-zinc-600" />
          </div>
          <span className="text-sm font-semibold text-zinc-300">
            {(Object.values(item.fields)[0] as string) || `记录 #${idx + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); removeBlockItem(activeBlock.id, item.id); }} className="p-1.5 text-zinc-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
          {item.isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500"/> : <ChevronDown className="w-4 h-4 text-zinc-500"/>}
        </div>
      </div>

      {item.isExpanded && (
        <div className="p-6 bg-zinc-900/30">
          {activeBlock.type === 'personal' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {renderField('name', '姓名', '')}
                {renderField('avatar', '头像 URL', 'https://...')}
              </div>
              {renderField('summary', '一行简述', '工作经验：5年 | 求职意向：Java高级开发工程师')}
              <div className="grid grid-cols-3 gap-4">
                {renderField('gender', '性别', '男')}
                {renderField('age', '年龄', '27岁')}
                {renderField('phone', '电话', '')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {renderField('email', '邮箱', '')}
                {renderField('wechat', '微信号', '')}
                {renderField('github', 'GitHub', '')}
              </div>
            </>
          )}

          {activeBlock.type === 'education' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {renderField('school', '学校', '')}
                {renderField('major', '专业', '')}
              </div>
              <div className="grid grid-cols-1 gap-0">
                {renderField('degree', '学历', '硕士')}
                {renderDurationFields()}
              </div>
            </>
          )}

          {activeBlock.type === 'work' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                {renderField('name', '公司', '')}
                {renderField('dept', '部门', '')}
                {renderField('role', '职位', '')}
              </div>
              {renderDurationFields()}
              {renderField('content', '工作内容', '描述你的职责...', 'textarea')}
              {renderField('performance', '工作业绩', '描述你的产出和成就...', 'textarea')}
            </>
          )}

          {activeBlock.type === 'project' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {renderField('name', '项目名称', '')}
                {renderField('role', '项目角色', '')}
              </div>
              {renderDurationFields()}
              {renderField('content', '项目描述', '', 'textarea')}
              {renderField('performance', '项目业绩', '', 'textarea')}
            </>
          )}

          {(activeBlock.type === 'skills' || activeBlock.type === 'custom') && (
             renderField('content', '模块内容', '支持 Markdown 列表', 'textarea')
          )}
        </div>
      )}
    </div>
  );
};

// --- EditorPanel Component ---
const EditorPanel: React.FC = () => {
  const { 
    resume, activeBlockId, updateBlockItemField, addBlockItem, 
    removeBlockItem, toggleBlockItemExpanded, removeBlock, updateBlockTitle, reorderItems, setSettingsOpen 
  } = useResumeStore();

  const activeBlock = resume.blocks.find(b => b.id === activeBlockId);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && activeBlock) {
      reorderItems(activeBlock.id, active.id as string, over.id as string);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 min-h-full no-print pb-32">
      {!activeBlock ? (
        <div className="py-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
             <Sparkles className="w-10 h-10 text-blue-500" />
           </div>
           
           <h2 className="text-2xl font-black text-zinc-100 mb-2 tracking-tight">开启您的精英简历之旅</h2>
           <p className="text-zinc-500 mb-12 text-center max-w-sm">请从左侧选择一个模块开始编辑，或点击下方按钮进行全局配置。</p>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all group">
               <Wand2 className="w-6 h-6 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="font-bold text-zinc-200 mb-2">AI 智能润色</h3>
               <p className="text-xs text-zinc-500 leading-relaxed">在任何输入框中选中文字，即可唤起 AI 工具栏进行润色或扩充内容。</p>
             </div>
             
             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all group">
               <Palette className="w-6 h-6 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="font-bold text-zinc-200 mb-2">视觉排版定制</h3>
               <p className="text-xs text-zinc-500 leading-relaxed">通过右上方设置面板，自由调整全文字号与行间距，确保 A4 完美呈现。</p>
             </div>

             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-amber-500/30 transition-all group">
               <FileCheck className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="font-bold text-zinc-200 mb-2">深度诊断报告</h3>
               <p className="text-xs text-zinc-500 leading-relaxed">点击上方“简历诊断”，获取基于 STAR 法则与量化数据的深度评估意见。</p>
             </div>

             <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-blue-500/30 transition-all group flex flex-col justify-center items-center cursor-pointer" onClick={() => setSettingsOpen(true)}>
               <Settings className="w-8 h-8 text-zinc-500 mb-2 group-hover:rotate-90 transition-transform duration-500" />
               <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-blue-400">去配置 AI 模型</span>
             </div>
           </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 group">
            <div>
              <input 
                className="bg-transparent text-2xl font-bold text-zinc-100 outline-none border-b border-transparent focus:border-blue-500/50 transition-all w-full"
                value={activeBlock.title}
                onChange={(e) => updateBlockTitle(activeBlock.id, e.target.value)}
              />
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-800">当前模块</span>
                <p className="text-xs text-zinc-500">点击名称可重命名</p>
              </div>
            </div>
            {activeBlock.type !== 'personal' && (
              <button onClick={() => confirm('确定删除整个模块？') && removeBlock(activeBlock.id)} className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-all" title="删除此模块">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeBlock.items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {activeBlock.items.map((item, idx) => (
                  <SortableItem 
                    key={item.id} 
                    item={item} 
                    idx={idx} 
                    activeBlock={activeBlock}
                    updateBlockItemField={updateBlockItemField}
                    removeBlockItem={removeBlockItem}
                    toggleBlockItemExpanded={toggleBlockItemExpanded}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {activeBlock.type !== 'personal' && (
              <button 
                onClick={() => addBlockItem(activeBlock.id)}
                className="w-full py-6 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 hover:text-blue-400 transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest">添加新记录</span>
              </button>
            )}
          </div>

          {/* Persistent Hint Banner */}
          <div className="mt-20 p-6 bg-blue-600/5 border border-blue-500/20 rounded-2xl flex items-start gap-4">
             <div className="mt-1 flex-none w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Wand2 className="w-4 h-4" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-blue-400 mb-1">💡 专家提示：如何使用 AI？</h4>
               <p className="text-xs text-zinc-500 leading-relaxed">
                 在任何记录的输入框内，<b>选中您想要优化的文字</b>，上方会自动弹出 AI 润色工具。AI 将基于专业语境为您重写内容，突出重点并量化成果。
               </p>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditorPanel;
