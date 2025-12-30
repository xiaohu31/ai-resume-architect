
import React, { useRef } from 'react';
import { useResumeStore } from '../store';
import { 
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical, AlertCircle, 
  Bold, Italic, List, ListOrdered 
} from 'lucide-react';

interface FieldProps {
  blockId: string;
  itemId: string;
  field: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
  value: string;
  updateBlockItemField: (blockId: string, itemId: string, field: string, value: string) => void;
}

const FormField: React.FC<FieldProps> = ({ 
  blockId, itemId, field, label, placeholder, type, value, updateBlockItemField 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyMarkdown = (
    prefix: string, 
    suffix: string = '', 
    isLineEditor: boolean = false
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fullText = textarea.value;
    const selectedText = fullText.substring(start, end);

    let newText = '';
    let newCursorPos = start;

    if (isLineEditor) {
      const before = fullText.substring(0, start);
      const after = fullText.substring(end);
      const lines = selectedText.split('\n');
      const formattedLines = lines.map(line => 
        line.startsWith(prefix) ? line.substring(prefix.length) : prefix + line
      );
      newText = before + formattedLines.join('\n') + after;
    } else {
      const before = fullText.substring(0, start);
      const after = fullText.substring(end);
      
      if (before.endsWith(prefix) && after.startsWith(suffix)) {
        newText = fullText.substring(0, start - prefix.length) + selectedText + fullText.substring(end + suffix.length);
        newCursorPos = start - prefix.length;
      } else {
        newText = before + prefix + selectedText + suffix + after;
        newCursorPos = start + prefix.length;
      }
    }

    updateBlockItemField(blockId, itemId, field, newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4 group/field">
      <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-1 group-focus-within/field:text-blue-400 transition-colors">
        {label}
      </label>
      {type === 'text' ? (
        <input 
          type="text"
          className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all placeholder:text-zinc-600 focus:bg-zinc-800"
          placeholder={placeholder}
          value={value}
          onChange={(e) => updateBlockItemField(blockId, itemId, field, e.target.value)}
        />
      ) : (
        <div className="flex flex-col bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden focus-within:border-blue-500 transition-all">
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-zinc-700/50 bg-zinc-900/30">
            <button 
              type="button"
              onClick={() => applyMarkdown('**', '**')}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="加粗 (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={() => applyMarkdown('*', '*')}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="斜体 (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-zinc-700 mx-1"></div>
            <button 
              type="button"
              onClick={() => applyMarkdown('- ', '', true)}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="无序列表 (Bullet List)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={() => applyMarkdown('1. ', '', true)}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors"
              title="有序列表 (Numbered List)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1"></div>
            <span className="text-[10px] text-zinc-600 font-mono pr-2 select-none">Markdown</span>
          </div>
          <textarea 
            ref={textareaRef}
            rows={5}
            className="bg-transparent border-none px-3 py-2 text-sm outline-none resize-none placeholder:text-zinc-600 leading-relaxed"
            placeholder={placeholder}
            value={value}
            onChange={(e) => updateBlockItemField(blockId, itemId, field, e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

const EditorPanel: React.FC = () => {
  const { 
    resume, activeBlockId, updateBlockItemField, addBlockItem, 
    removeBlockItem, toggleBlockItemExpanded, removeBlock, updateBlockTitle 
  } = useResumeStore();

  const activeBlock = resume.blocks.find(b => b.id === activeBlockId);

  if (!activeBlock) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-500 gap-4">
      <AlertCircle className="w-12 h-12 opacity-20" />
      <p>请在左侧选择或添加一个模块开始编辑</p>
    </div>
  );

  const renderField = (itemId: string, field: string, label: string, placeholder: string, type: 'text' | 'textarea' = 'text') => {
    const item = activeBlock.items.find(i => i.id === itemId);
    const value = item?.fields[field] || '';

    return (
      <FormField 
        key={`${activeBlock.id}-${itemId}-${field}`}
        blockId={activeBlock.id}
        itemId={itemId}
        field={field}
        label={label}
        placeholder={placeholder}
        type={type}
        value={value}
        updateBlockItemField={updateBlockItemField}
      />
    );
  };

  const renderItems = () => {
    return activeBlock.items.map((item, index) => (
      <div key={item.id} className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div 
          className="flex items-center justify-between px-4 py-3 bg-zinc-800/30 cursor-pointer hover:bg-zinc-800/50 transition-colors"
          onClick={() => toggleBlockItemExpanded(activeBlock.id, item.id)}
        >
          <div className="flex items-center gap-3">
             <GripVertical className="w-4 h-4 text-zinc-600" />
             <span className="text-xs font-semibold text-zinc-400">记录 #{index + 1}</span>
             <span className="text-sm truncate max-w-[200px] text-zinc-100">
               {(Object.values(item.fields)[0] as string) || '未命名'}
             </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); removeBlockItem(activeBlock.id, item.id); }}
                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {item.isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </div>
        </div>
        
        {item.isExpanded && (
          <div className="p-5 bg-zinc-900/20">
            {activeBlock.type === 'personal' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {renderField(item.id, 'name', '姓名', '请输入姓名')}
                  {renderField(item.id, 'phone', '电话', '请输入电话')}
                </div>
                {renderField(item.id, 'email', '邮箱', '请输入电子邮箱')}
                <div className="grid grid-cols-2 gap-4">
                  {renderField(item.id, 'target', '期望职位', '如：前端工程专家')}
                  {renderField(item.id, 'city', '所在城市', '如：北京')}
                </div>
              </>
            )}

            {(activeBlock.type === 'work' || activeBlock.type === 'project') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {renderField(item.id, 'name', activeBlock.type === 'work' ? '公司名称' : '项目名称', '请输入名称')}
                  {renderField(item.id, 'role', '担任角色', '如：技术负责、主程')}
                </div>
                {renderField(item.id, 'duration', '时间周期', '如：2023.01 - 至今')}
                {renderField(item.id, 'content', '详细描述 (支持 AI 润色 & Markdown)', '请描述具体职责、项目背景、技术栈等', 'textarea')}
              </>
            )}

            {activeBlock.type === 'education' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {renderField(item.id, 'school', '学校名称', '请输入学校名称')}
                  {renderField(item.id, 'degree', '学历', '如：本科')}
                </div>
                {renderField(item.id, 'major', '专业名称', '请输入专业')}
                {renderField(item.id, 'duration', '时间周期', '如：2016.09 - 2020.06')}
              </>
            )}

            {(activeBlock.type === 'skills' || activeBlock.type === 'certificate' || activeBlock.type === 'custom') && (
               renderField(item.id, 'content', '内容 (支持 Markdown)', '请输入详细内容，每行一条建议。', 'textarea')
            )}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-8 min-h-full">
      <div className="flex items-center justify-between mb-8 group">
        <div className="flex flex-col gap-1">
            <input 
                className="bg-transparent text-2xl font-bold text-zinc-100 outline-none border-b border-transparent focus:border-blue-500/50 transition-all hover:text-blue-400"
                value={activeBlock.title}
                onChange={(e) => updateBlockTitle(activeBlock.id, e.target.value)}
            />
            <p className="text-xs text-zinc-500 font-medium">配置简历的 {activeBlock.title} 模块内容</p>
        </div>
        {activeBlock.type !== 'personal' && (
           <button 
             onClick={() => { if(confirm('确定删除整个模块吗？')) removeBlock(activeBlock.id); }}
             className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 hover:bg-red-400/10 rounded"
           >
             <Trash2 className="w-3.5 h-3.5" />
             <span>删除模块</span>
           </button>
        )}
      </div>

      <div className="space-y-4">
        {renderItems()}
      </div>

      {activeBlock.type !== 'personal' && (
        <button 
          onClick={() => addBlockItem(activeBlock.id)}
          className="w-full py-4 mt-4 border-2 border-dashed border-zinc-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-blue-400 transition-all group active:scale-[0.99]"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-wider">添加新记录</span>
        </button>
      )}
    </div>
  );
};

export default EditorPanel;
