
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useResumeStore } from '../store';
import { Mail, Phone, MapPin } from 'lucide-react';

const PreviewPanel: React.FC = () => {
  const { resume } = useResumeStore();

  const personalBlock = resume.blocks.find(b => b.type === 'personal');
  const personalInfo = personalBlock?.items[0]?.fields || {};

  return (
    <div className="preview-a4 shadow-2xl rounded-sm">
      {/* Header Section */}
      <div className="border-b-2 border-zinc-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 uppercase">{personalInfo.name || '姓名'}</h1>
          <p className="text-lg text-blue-700 font-semibold mt-1">{personalInfo.target || '求职意向'}</p>
        </div>
        <div className="text-right text-xs text-zinc-600 space-y-1">
          {personalInfo.phone && <div className="flex items-center justify-end gap-1.5"><Phone className="w-3 h-3"/> {personalInfo.phone}</div>}
          {personalInfo.email && <div className="flex items-center justify-end gap-1.5"><Mail className="w-3 h-3"/> {personalInfo.email}</div>}
          {personalInfo.city && <div className="flex items-center justify-end gap-1.5"><MapPin className="w-3 h-3"/> {personalInfo.city}</div>}
        </div>
      </div>

      <div className="space-y-8">
        {resume.blocks.filter(b => b.visible && b.type !== 'personal').map((block) => (
          <div key={block.id}>
            <div className="flex items-center gap-2 mb-3 border-b border-zinc-200 pb-1">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{block.title}</h2>
            </div>
            
            <div className="space-y-4">
              {block.items.map((item) => (
                <div key={item.id} className="group">
                  {block.type === 'work' || block.type === 'project' ? (
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-zinc-900">{item.fields.name}</div>
                        <div className="text-xs font-mono text-zinc-500">{item.fields.duration}</div>
                      </div>
                      <div className="text-xs italic text-blue-700 font-medium mb-2">{item.fields.role}</div>
                      {/* Fix: Moved prose-sm to wrapper div and removed unsupported className from ReactMarkdown to fix type error */}
                      <div className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                        <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                      </div>
                    </div>
                  ) : block.type === 'education' ? (
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="font-bold text-zinc-900">{item.fields.school}</div>
                          <div className="text-xs text-zinc-700">{item.fields.major} · {item.fields.degree}</div>
                       </div>
                       <div className="text-xs font-mono text-zinc-500">{item.fields.duration}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                       {/* Fix: Moved prose-sm to wrapper div and removed unsupported className from ReactMarkdown to fix type error */}
                       <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative Elements */}
      <div className="mt-auto pt-10 text-[9px] text-zinc-300 italic text-center no-print">
        本简历由 AI Resume Architect 2025 构建 | 实时预览模式
      </div>
    </div>
  );
};

export default PreviewPanel;
