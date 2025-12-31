
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Phone, Github, MapPin } from 'lucide-react';
import { TemplateProps } from './types';

const MinimalTemplate: React.FC<TemplateProps> = ({ resume, style }) => {
    const settings = {
        fontSize: style.fontSize || 10,
        lineHeight: style.lineHeight || 1.5,
    };

    const personalBlock = resume?.blocks?.find(b => b.type === 'personal');
    const personalInfo = personalBlock?.items[0]?.fields || {};

    const textStyle = {
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
    };

    return (
        <div className="p-6 text-zinc-800">
            {/* Header Area */}
            <div className="flex justify-between items-start mb-6 page-break-avoid">
                <div className="flex-1">
                    <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-1">{personalInfo.name || '姓名'}</h1>
                    <div className="text-lg text-zinc-500 font-light mb-3">{personalInfo.jobIntention}</div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] text-zinc-400 font-medium">
                        <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {personalInfo.phone}</div>
                        <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {personalInfo.email}</div>
                        {personalInfo.location && <div className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {personalInfo.location}</div>}
                        {personalInfo.github && <div className="flex items-center gap-1"><Github className="w-2.5 h-2.5" /> {personalInfo.github}</div>}
                        {(personalInfo.gender || personalInfo.age || personalInfo.birthday) && (
                            <div className="flex items-center gap-1 opacity-80">
                                {personalInfo.gender} {personalInfo.birthday || personalInfo.age}
                            </div>
                        )}
                        {personalInfo.jobStatus && <div className="flex items-center gap-1 opacity-80 px-2 bg-zinc-50 rounded">{personalInfo.jobStatus}</div>}
                        {personalInfo.expectedSalary && <div className="flex items-center gap-1 opacity-80 decoration-zinc-100">期望: {personalInfo.expectedSalary}</div>}
                    </div>
                </div>
                {personalInfo.avatar && (
                    <div className="w-16 h-16 rounded-full overflow-hidden grayscale contrast-125 border border-zinc-100 shadow-sm ml-6">
                        <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Summary with Light Quote Style */}
            {personalInfo.summary && (
                <div className="mb-6 text-zinc-600 italic font-light border-l-2 border-zinc-100 pl-4 py-0.5 leading-relaxed page-break-avoid" style={{ fontSize: `${settings.fontSize + 1}px` }}>
                    {personalInfo.summary}
                </div>
            )}

            {/* Content Sections */}
            <div className="space-y-6">
                {resume.blocks.filter(b => b.visible && b.type !== 'personal').map((block) => {
                    return (
                        <div key={block.id} className="relative page-break-avoid">
                            {/* Simple Minimal Title */}
                            <div className="flex items-center gap-2 mb-3">
                                <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em]">{block.title}</h2>
                                <div className="flex-1 h-px bg-zinc-100"></div>
                            </div>

                            <div className="space-y-4">
                                {block.items.map((item) => (
                                    <div key={item.id} className="page-break-avoid">
                                        {block.type === 'education' ? (
                                            <div className="flex justify-between items-baseline" style={textStyle}>
                                                <div>
                                                    <span className="font-bold text-zinc-900 mr-3">{item.fields.school}</span>
                                                    <span className="text-zinc-600">{item.fields.major} · {item.fields.degree}</span>
                                                    {item.fields.content && (
                                                        <div className="mt-1 text-zinc-500 italic text-[10px] prose prose-sm max-w-none">
                                                            <ReactMarkdown>{item.fields.content}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-zinc-400 font-light text-[10px] whitespace-nowrap ml-3">{item.fields.duration}</div>
                                            </div>
                                        ) : block.type === 'work' || block.type === 'project' ? (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-baseline">
                                                    <div className="flex flex-wrap items-baseline gap-x-3">
                                                        <span className="font-bold text-[13px] text-zinc-900">{item.fields.name}</span>
                                                        {item.fields.dept && <span className="text-[11px] text-zinc-400">{item.fields.dept}</span>}
                                                        <span className="text-[11px] text-zinc-700 font-medium">{item.fields.role}</span>
                                                    </div>
                                                    <span className="text-[10px] text-zinc-300 font-light whitespace-nowrap ml-3">{item.fields.duration}</span>
                                                </div>

                                                <div className="text-zinc-600 font-light pl-0" style={textStyle}>
                                                    <div className="prose prose-sm max-w-none prose-zinc opacity-90" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                        <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                                                    </div>
                                                    {item.fields.performance && (
                                                        <div className="mt-2 pt-2 border-t border-zinc-50">
                                                            <div className="text-zinc-400 text-[9px] uppercase tracking-wider mb-1">Key Achievement</div>
                                                            <div className="prose prose-sm max-w-none prose-zinc opacity-80" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                                <ReactMarkdown>{item.fields.performance}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-zinc-600 font-light prose prose-sm max-w-none prose-zinc pl-0" style={textStyle}>
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
        </div>
    );
};

export default MinimalTemplate;
