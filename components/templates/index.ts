import { TemplateConfig } from './types';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';

export const templateRegistry: Record<string, TemplateConfig> = {
    classic: {
        id: 'classic',
        name: '经典',
        component: ClassicTemplate,
    },
    minimal: {
        id: 'minimal',
        name: '简约',
        component: MinimalTemplate,
    },
    professional: {
        id: 'professional',
        name: '专业',
        component: ProfessionalTemplate,
    },
};

export * from './types';
