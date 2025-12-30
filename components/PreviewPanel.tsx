
import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useResumeStore } from '../store';
import { Mail, Phone, User, MessageSquare, Github, Briefcase, GraduationCap, Award, FileText, Zap, AlertTriangle, MapPin } from 'lucide-react';

const blockIcons: Record<string, any> = {
  education: GraduationCap,
  skills: Zap,
  work: Briefcase,
  project: FileText,
  custom: User,
};

const PreviewPanel = forwardRef<HTMLDivElement>((props, ref) => {
  const { resume } = useResumeStore();
  const settings = resume?.settings || { fontSize: 12, lineHeight: 1.5 };

  const personalBlock = resume?.blocks?.find(b => b.type === 'personal');
  const personalInfo = personalBlock?.items[0]?.fields || {};

  // Custom styles for markdown and general text
  const textStyle = {
    fontSize: `${settings.fontSize || 12}px`,
    lineHeight: settings.lineHeight || 1.5,
  };

  return (
    <div className="relative group/preview">
      {/* Interactive Guide Overlay (No Print) */}
      <div className="absolute -top-12 left-0 right-0 flex justify-center no-print pointer-events-none group-hover/preview:opacity-100 opacity-0 transition-opacity">
        <div className="bg-zinc-800/90 backdrop-blur border border-zinc-700 px-4 py-1.5 rounded-full text-[10px] text-zinc-400 flex items-center gap-2 shadow-2xl">
          <Zap className="w-3 h-3 text-blue-400" />
          <span>实时渲染预览：修改字号与间距可优化分页布局</span>
        </div>
      </div>

      <div ref={ref} className="preview-a4 shadow-2xl rounded-sm print:shadow-none bg-white">
        {/* Centered Avatar and Name */}
        {/* Centered Avatar and Name */}
        <div className="flex flex-col items-center mb-6">
          {personalInfo.avatar && (
            <div className="w-24 h-24 mb-4 border-2 border-zinc-100 rounded-full overflow-hidden bg-zinc-50 shadow-sm">
              <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-1">{personalInfo.name || '姓名'}</h1>
          {personalInfo.jobIntention && (
            <div className="text-lg font-medium text-zinc-700 mb-2">{personalInfo.jobIntention}</div>
          )}
          <p className="text-[12px] text-zinc-500 font-medium px-12 text-center leading-relaxed">
            {personalInfo.summary || '个人简述'}
          </p>
        </div>

        {/* Info Grid - Refactored for more fields */}
        <div className="grid grid-cols-4 gap-y-2 gap-x-4 mb-8 pb-6 border-b border-zinc-100 text-[11px] text-zinc-600">
          <div className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.gender} / {personalInfo.age}</div>
          <div className="flex items-center justify-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.yearsOfExperience}经验</div>
          <div className="flex items-center justify-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.location}</div>
          <div className="flex items-center justify-center gap-1.5"><Zap className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.jobStatus}</div>

          <div className="flex items-center justify-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.phone}</div>
          <div className="flex items-center justify-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.email}</div>
          <div className="flex items-center justify-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.wechat}</div>
          <div className="flex items-center justify-center gap-1.5"><Github className="w-3.5 h-3.5 text-zinc-400" /> {personalInfo.github}</div>
        </div>

        <div className="space-y-6">
          {resume.blocks.filter(b => b.visible && b.type !== 'personal').map((block) => {
            const Icon = blockIcons[block.type] || FileText;
            return (
              <div key={block.id} className="relative">
                {/* Section Title */}
                <div className="flex items-center gap-2 mb-3 border-b border-zinc-200 pb-1">
                  <Icon className="w-4 h-4 text-zinc-800" />
                  <h2 className="text-[15px] font-bold text-zinc-900 tracking-wide">{block.title}</h2>
                </div>

                <div className="space-y-4">
                  {block.items.map((item) => (
                    <div key={item.id}>
                      {block.type === 'education' ? (
                        <div className="grid grid-cols-4 items-center text-zinc-800" style={textStyle}>
                          <div className="font-bold">{item.fields.school}</div>
                          <div className="text-center">{item.fields.major}</div>
                          <div className="text-center">{item.fields.degree}</div>
                          <div className="text-right text-zinc-500 font-mono text-[11px]">{item.fields.duration}</div>
                        </div>
                      ) : block.type === 'work' || block.type === 'project' ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[14px] text-zinc-900">{item.fields.name}</span>
                              {item.fields.dept && <span className="text-[12px] text-zinc-600 font-medium">{item.fields.dept}</span>}
                              <span className="text-[12px] text-zinc-800 font-bold">{item.fields.role}</span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500">{item.fields.duration}</span>
                          </div>

                          {/* Content */}
                          <div className="text-zinc-700" style={textStyle}>
                            <div className="font-bold text-zinc-900 mb-0.5 mt-1">工作内容：</div>
                            <div className="prose prose-sm max-w-none prose-zinc" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                              <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                            </div>
                          </div>

                          {/* Performance */}
                          {item.fields.performance && (
                            <div className="text-zinc-700" style={textStyle}>
                              <div className="font-bold text-zinc-900 mb-0.5 mt-1">工作业绩：</div>
                              <div className="prose prose-sm max-w-none prose-zinc" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                <ReactMarkdown>{item.fields.performance}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-zinc-700 prose prose-sm max-w-none prose-zinc" style={textStyle}>
                          <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-10 text-[9px] text-zinc-300 italic text-center no-print">
          Design compliant with A4 printing standards
        </div>
      </div>
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';

export default PreviewPanel;
