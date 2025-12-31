import React from 'react';
import { ResumeContent } from '../../types';

export interface TemplateProps {
    resume: ResumeContent;
    style: {
        fontSize: number;
        lineHeight: number;
    };
}

export interface TemplateConfig {
    id: string;
    name: string;
    component: React.FC<TemplateProps>;
}
