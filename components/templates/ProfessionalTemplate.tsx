
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Phone, MessageSquare, Github, MapPin } from 'lucide-react';
import { TemplateProps } from './types';

const ProfessionalTemplate: React.FC<TemplateProps> = ({ resume, style }) => {
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

    const sideBlocks = resume.blocks.filter(b => b.visible && ['skills', 'education', 'certificate'].includes(b.type));
    const mainBlocks = resume.blocks.filter(b => b.visible && ['work', 'project', 'custom'].includes(b.type) && b.type !== 'personal');

    return (
        <div className="flex bg-white">
            {/* Sidebar (Left) */}
            <div className="w-[220px] bg-zinc-900 text-white p-6 flex flex-col gap-5 shrink-0">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center page-break-avoid">
                    {personalInfo.avatar && (
                        <div className="w-24 h-24 mb-4 border-4 border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-800 shadow-xl box-content">
                            <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h1 className="text-xl font-bold tracking-tight mb-1">{personalInfo.name || '姓名'}</h1>
                    <div className="text-xs text-zinc-400 font-medium px-2">{personalInfo.jobIntention}</div>
                </div>

                {/* Contact info list */}
                <div className="space-y-3 pt-3 page-break-avoid">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 border-b border-zinc-800 pb-1.5 mb-3">联系方式</h3>
                    <div className="space-y-2 text-[10px] text-zinc-300">
                        <div className="flex items-start gap-2"><Phone className="w-3 h-3 mt-0.5 text-zinc-500" /> <span>{personalInfo.phone}</span></div>
                        <div className="flex items-start gap-2"><Mail className="w-3 h-3 mt-0.5 text-zinc-500" /> <span className="break-all">{personalInfo.email}</span></div>
                        <div className="flex items-start gap-2"><MapPin className="w-3 h-3 mt-0.5 text-zinc-500" /> <span>{personalInfo.location}</span></div>
                        {personalInfo.github && <div className="flex items-start gap-2"><Github className="w-3 h-3 mt-0.5 text-zinc-500" /> <span className="break-all">{personalInfo.github}</span></div>}
                        {personalInfo.wechat && <div className="flex items-start gap-2"><MessageSquare className="w-3 h-3 mt-0.5 text-zinc-500" /> <span>{personalInfo.wechat}</span></div>}
                        <div className="pt-2 border-t border-zinc-800 space-y-1.5 opacity-80">
                            {(personalInfo.gender || personalInfo.age || personalInfo.birthday) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">基本信息:</span>
                                    <span>{personalInfo.gender} / {personalInfo.birthday || personalInfo.age}</span>
                                </div>
                            )}
                            {personalInfo.jobStatus && (
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">求职状态:</span>
                                    <span>{personalInfo.jobStatus}</span>
                                </div>
                            )}
                            {personalInfo.expectedSalary && (
                                <div className="flex items-center gap-2 text-blue-400 font-bold">
                                    <span className="text-zinc-500">期望薪资:</span>
                                    <span>{personalInfo.expectedSalary}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {sideBlocks.map(block => (
                    <div key={block.id} className="space-y-2 page-break-avoid">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 border-b border-zinc-800 pb-1.5">{block.title}</h3>
                        <div className="text-[10px] leading-relaxed text-zinc-300">
                            {block.items.map(item => (
                                <div key={item.id} className="mb-3 last:mb-0">
                                    {block.type === 'education' ? (
                                        <div className="space-y-0.5">
                                            <div className="font-bold text-white">{item.fields.school}</div>
                                            <div className="text-zinc-400">{item.fields.major} · {item.fields.degree}</div>
                                            <div className="text-[9px] font-mono text-zinc-600">{item.fields.duration}</div>
                                            {item.fields.content && (
                                                <div className="prose prose-sm prose-invert max-w-none opacity-60 mt-1" style={{ fontSize: '9px', lineHeight: '1.4' }}>
                                                    <ReactMarkdown>{item.fields.content}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm prose-invert max-w-none opacity-90" style={{ fontSize: '10px', lineHeight: '1.5' }}>
                                            <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content (Right) */}
            <div className="flex-1 p-8 text-zinc-900 bg-white">
                {/* Intro Summary in Main */}
                {personalInfo.summary && (
                    <div className="mb-6 page-break-avoid">
                        <h2 className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.15em] mb-2">个人优势</h2>
                        <p className="text-xs font-medium text-zinc-700 leading-relaxed border-l-4 border-zinc-100 pl-4 py-1">
                            {personalInfo.summary}
                        </p>
                    </div>
                )}

                <div className="space-y-6">
                    {mainBlocks.map(block => (
                        <div key={block.id} className="page-break-avoid">
                            <h2 className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.15em] mb-4 flex items-center gap-3">
                                {block.title}
                                <div className="flex-1 h-px bg-zinc-50"></div>
                            </h2>

                            <div className="space-y-5">
                                {block.items.map(item => (
                                    <div key={item.id} className="relative pl-0 page-break-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <div className="flex flex-wrap items-baseline gap-x-3">
                                                <span className="font-bold text-[14px] tracking-tight">{item.fields.name}</span>
                                                <span className="text-[12px] text-zinc-500 font-medium">{item.fields.role}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-zinc-400 font-medium">{item.fields.duration}</span>
                                        </div>

                                        <div className="space-y-2" style={textStyle}>
                                            <div className="prose prose-sm max-w-none prose-zinc" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                <ReactMarkdown>{item.fields.content || ''}</ReactMarkdown>
                                            </div>
                                            {item.fields.performance && (
                                                <div className="bg-zinc-50/50 p-3 rounded-r-lg border-l-2 border-zinc-200">
                                                    <div className="prose prose-sm max-w-none prose-zinc text-zinc-600 italic" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                        <ReactMarkdown>{item.fields.performance}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfessionalTemplate;
