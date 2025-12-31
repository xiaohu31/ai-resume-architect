
export type BlockType = 'personal' | 'project' | 'skills' | 'work' | 'education' | 'certificate' | 'custom';

export interface BlockItem {
  id: string;
  fields: Record<string, string>;
  isExpanded?: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  order: number;
  visible: boolean;
  items: BlockItem[];
}

export interface ResumeSettings {
  fontSize: number;
  lineHeight: number;
  modelName: string;
  baseUrl: string;
  apiKey?: string;
  provider?: 'gemini' | 'openai';
  apiEndpoint?: string;
  templateId: 'classic' | 'minimal' | 'professional';
  pagePadding: number;
}

export interface ResumeContent {
  id: string;
  title: string;
  blocks: Block[];
  settings: ResumeSettings;
  createdAt: number;
  updatedAt: number;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  name: string;
  data: ResumeContent;
  createdAt: number;
}

export interface DiagnosisResult {
  scores: {
    completeness: number;
    starCompliance: number;
    quantification: number;
    expression: number;
  };
  totalScore: number;
  level: 'excellent' | 'good' | 'average' | 'needsWork';
  issues: Array<{
    module: string;
    blockId?: string;
    itemId?: string;
    field?: string;
    severity: 'warning' | 'info';
    issue: string;
    suggestion: string;
  }>;
}
