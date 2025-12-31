
import React from 'react';
import { useResumeStore } from '../store';
import { templateRegistry } from './templates';

const TemplateSwitcher: React.FC = () => {
    const { resume, updateSettings } = useResumeStore();
    const currentId = resume?.settings?.templateId || 'classic';

    return (
        <div className="flex gap-2 mb-4 no-print">
            {Object.values(templateRegistry).map((template) => (
                <button
                    key={template.id}
                    onClick={() => updateSettings({ templateId: template.id as any })}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${currentId === template.id
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                        }`}
                >
                    {template.name}
                </button>
            ))}
        </div>
    );
};

export default TemplateSwitcher;
