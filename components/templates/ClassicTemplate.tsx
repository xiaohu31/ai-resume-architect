
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Mail, Phone, MessageSquare, Github, User, Briefcase, MapPin, Zap } from 'lucide-react';
import { TemplateProps } from './types';

const ClassicTemplate: React.FC<TemplateProps> = ({ resume, style }) => {
    const settings = {
        fontSize: style.fontSize || 11,
        lineHeight: style.lineHeight || 1.5,
    };

    const personalBlock = resume?.blocks?.find(b => b.type === 'personal');
    const personalInfo = personalBlock?.items[0]?.fields || {};

    const textStyle = {
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
    };

    return (
        <div className="p-2 text-zinc-900">
            {/* Header: Left info, Right Avatar */}
            <div className="flex justify-between items-start mb-6 page-break-avoid">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{personalInfo.name || '姓名'}</h1>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-700 mb-2">
                        {personalInfo.gender && <span>{personalInfo.gender}</span>}
                        {personalInfo.gender && (personalInfo.birthday || personalInfo.age) && <span className="text-zinc-300">|</span>}
                        {(personalInfo.birthday || personalInfo.age) && <span>{personalInfo.birthday ? `生日: ${personalInfo.birthday}` : `年龄: ${personalInfo.age}`}</span>}
                        {(personalInfo.birthday || personalInfo.age || personalInfo.gender) && personalInfo.location && <span className="text-zinc-300">|</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                        {personalInfo.phone && <span className="ml-2 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-zinc-400" />{personalInfo.phone}</span>}
                        {personalInfo.email && <span className="ml-2 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-zinc-400" />{personalInfo.email}</span>}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-600 font-medium">
                        {personalInfo.jobStatus && <span>{personalInfo.jobStatus}</span>}
                        {personalInfo.yearsOfExperience && <span className="text-zinc-300">|</span>}
                        {personalInfo.yearsOfExperience && <span>{personalInfo.yearsOfExperience}经验</span>}
                        {personalInfo.jobIntention && <span className="text-zinc-300">|</span>}
                        {personalInfo.jobIntention && <span>求职意向：{personalInfo.jobIntention}</span>}
                        {personalInfo.expectedSalary && <span className="text-zinc-300">|</span>}
                        {personalInfo.expectedSalary && <span>期望薪资：{personalInfo.expectedSalary}</span>}
                    </div>
                </div>

                {personalInfo.avatar && (
                    <div className="w-24 h-28 ml-8 rounded-xl overflow-hidden bg-zinc-50 shadow-sm border border-zinc-100 shrink-0">
                        <img src={personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {/* 个人优势 (Summary) - 如果存在则显示 */}
                {personalInfo.summary && (
                    <div className="relative page-break-avoid">
                        <div className="flex flex-col mb-3">
                            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">个人优势</h2>
                            <div className="h-[1px] bg-zinc-200 mt-0.5"></div>
                        </div>
                        <div className="text-zinc-700 prose prose-sm max-w-none prose-zinc" style={textStyle}>
                            <ReactMarkdown>{personalInfo.summary}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {resume.blocks.filter(b => b.visible && b.type !== 'personal').map((block) => {
                    return (
                        <div key={block.id} className="relative page-break-avoid">
                            {/* Section Header with Line */}
                            <div className="flex flex-col mb-3">
                                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{block.title}</h2>
                                <div className="h-[1px] bg-zinc-200 mt-0.5"></div>
                            </div>

                            <div className="space-y-4">
                                {block.items.map((item) => (
                                    <div key={item.id} className="page-break-avoid">
                                        {block.type === 'education' ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-baseline font-bold text-zinc-900" style={textStyle}>
                                                    <div className="flex gap-4">
                                                        <span>{item.fields.school}</span>
                                                        <span>{item.fields.major}</span>
                                                        <span className="font-normal text-zinc-600">{item.fields.degree}</span>
                                                    </div>
                                                    <span className="font-mono text-zinc-400 text-xs">{item.fields.duration}</span>
                                                </div>
                                                {item.fields.content && (
                                                    <div className="text-zinc-600 prose prose-sm max-w-none prose-zinc" style={textStyle}>
                                                        <ReactMarkdown>{item.fields.content}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        ) : block.type === 'work' || block.type === 'project' ? (
                                            <div className="space-y-2">
                                                {/* Company/Project Header */}
                                                <div className="flex justify-between items-baseline">
                                                    <div className="flex items-baseline gap-4">
                                                        <span className="font-bold text-zinc-900" style={{ fontSize: `${settings.fontSize + 1}px` }}>
                                                            {item.fields.name}
                                                        </span>
                                                        {item.fields.dept && <span className="text-zinc-600 font-medium text-sm">{item.fields.dept}</span>}
                                                        <span className="font-bold text-zinc-700" style={textStyle}>{item.fields.role}</span>
                                                    </div>
                                                    <span className="text-zinc-400 font-mono text-xs">{item.fields.duration}</span>
                                                </div>

                                                {/* Content Blocks */}
                                                <div className="space-y-2 text-zinc-700" style={textStyle}>
                                                    {item.fields.content && (
                                                        <div>
                                                            <span className="font-bold text-zinc-900 mr-2">内容:</span>
                                                            <div className="inline-prose prose prose-sm max-w-none prose-zinc inline" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                                <ReactMarkdown>{item.fields.content}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.fields.performance && (
                                                        <div>
                                                            <span className="font-bold text-zinc-900 mr-2">业绩:</span>
                                                            <div className="inline-prose prose prose-sm max-w-none prose-zinc inline" style={{ fontSize: 'inherit', lineHeight: 'inherit' }}>
                                                                <ReactMarkdown>{item.fields.performance}</ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
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
        </div>
    );
};

export default ClassicTemplate;
