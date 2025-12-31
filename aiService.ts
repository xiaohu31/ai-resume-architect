import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { ResumeContent, DiagnosisResult } from "./types";
import { useResumeStore } from "./store";

// ==================== 配置获取 ====================

const getApiKey = (): string => {
    // @ts-ignore
    const envKey = process.env.GEMINI_API_KEY || '';
    if (envKey) return envKey;
    return useResumeStore.getState().resume?.settings?.apiKey || '';
};

const getProvider = (): 'gemini' | 'openai' => {
    return useResumeStore.getState().resume?.settings?.provider || 'gemini';
};

const getModelName = (): string => {
    return useResumeStore.getState().resume?.settings?.modelName || 'gemini-2.0-flash';
};

const getApiEndpoint = (): string => {
    return useResumeStore.getState().resume?.settings?.apiEndpoint || '';
};

// ==================== AI 提供商接口 ====================

interface AIProvider {
    callAI(prompt: string): Promise<string>;
}

// ==================== Gemini 提供商 ====================

class GeminiProvider implements AIProvider {
    private client: any;
    private modelName: string;

    constructor(apiKey: string, modelName: string) {
        this.client = new GoogleGenAI({ apiKey });
        this.modelName = modelName;
    }

    async callAI(prompt: string): Promise<string> {
        try {
            const response = await this.client.models.generateContent({
                model: this.modelName,
                contents: prompt,
            });
            return response.text || '';
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(error.message || 'Gemini API 调用失败');
        }
    }
}

// ==================== OpenAI 提供商 ====================

class OpenAIProvider implements AIProvider {
    private client: OpenAI;
    private modelName: string;

    constructor(apiKey: string, modelName: string, baseURL?: string) {
        this.client = new OpenAI({
            apiKey,
            baseURL: baseURL || undefined,
            dangerouslyAllowBrowser: true, // 必须：允许在浏览器中使用
        });
        this.modelName = modelName;
    }

    async callAI(prompt: string): Promise<string> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.modelName,
                messages: [
                    { role: 'user', content: prompt }
                ],
            });
            return response.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.error('OpenAI API Error:', error);
            throw new Error(error.message || 'OpenAI API 调用失败');
        }
    }
}

// ==================== 错误类型 ====================

export class AIConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AIConfigurationError';
    }
}

// ==================== 提供商工厂 ====================

const createProvider = (): AIProvider => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new AIConfigurationError('请先配置 API Key');
    }

    const provider = getProvider();
    const modelName = getModelName();
    const apiEndpoint = getApiEndpoint();

    if (provider === 'openai') {
        return new OpenAIProvider(apiKey, modelName, apiEndpoint || undefined);
    } else {
        return new GeminiProvider(apiKey, modelName);
    }
};

// ==================== 通用调用函数 ====================

const callAI = async (prompt: string): Promise<string> => {
    const provider = createProvider();
    return provider.callAI(prompt);
};

// ==================== 导出的 AI 功能 ====================

export const polishText = async (text: string, context?: string): Promise<string> => {
    const contextInfo = context ? `你正在优化简历的【${context}】部分。` : '';
    const prompt = `你是一位专业的简历优化专家。${contextInfo}请对以下简历内容进行润色，使其更加专业、简洁、有力。保持原意，优化表达方式。
直接返回优化后的内容，不要添加任何解释或前缀。

原文：
${text}`;
    return callAI(prompt);
};

export const expandText = async (text: string, context?: string): Promise<string> => {
    const contextInfo = context ? `你正在优化简历的【${context}】部分。` : '';
    const prompt = `你是一位专业的简历优化专家。${contextInfo}请对以下简历内容进行扩展，添加更多具体细节、量化指标或技术关键词，使其更加丰富和有说服力。保持专业性。
直接返回扩展后的内容，不要添加任何解释或前缀。

原文：
${text}`;
    return callAI(prompt);
};

export const simplifyText = async (text: string, context?: string): Promise<string> => {
    const contextInfo = context ? `你正在优化简历的【${context}】部分。` : '';
    const prompt = `你是一位专业的简历优化专家。${contextInfo}请对以下简历内容进行简化，去除冗余信息，保留核心要点，使其更加精炼。
直接返回简化后的内容，不要添加任何解释或前缀。

原文：
${text}`;
    return callAI(prompt);
};

export const summarizeText = async (text: string, context?: string): Promise<string> => {
    const contextInfo = context ? `你正在优化简历的【${context}】部分。` : '';
    const prompt = `你是一位专业的简历优化专家。${contextInfo}请用一句话总结以下内容的核心价值和亮点。
直接返回总结，不要添加任何解释或前缀。

原文：
${text}`;
    return callAI(prompt);
};

export const diagnoseResume = async (resume: ResumeContent): Promise<DiagnosisResult> => {
    const prompt = `你是一位资深 HR 和简历专家。请从以下维度诊断这份简历，并返回 JSON 格式的评估结果：

评分维度（每项 0-100 分）：
1. completeness（完整性）：信息是否完整
2. starCompliance（STAR法则）：是否遵循情境-任务-行动-结果结构  
3. quantification（量化指标）：是否有具体数据支撑
4. expression（表达质量）：语言是否专业简洁

同时识别出需要改进的问题点，每个问题包含：
- module：所属模块名称
- blockId：模块 ID（必须返回）
- itemId：项目 ID（如果针对特定项目项，必须返回）
- field：具体字段（如 content, performance, name 等）
- severity："warning" 或 "info"
- issue：问题描述
- suggestion：改进建议

请严格按以下 JSON 格式返回，不要添加任何其他内容：
{
  "scores": { "completeness": 85, "starCompliance": 70, "quantification": 60, "expression": 80 },
  "totalScore": 74,
  "level": "good",
  "issues": [
    { "module": "工作经历", "blockId": "work", "itemId": "uuid...", "field": "content", "severity": "warning", "issue": "缺少量化数据", "suggestion": "添加具体百分比或数字" }
  ]
}

简历内容：
${JSON.stringify(resume, null, 2)}`;

    const result = await callAI(prompt);

    try {
        let jsonString = result;
        // 尝试提取 Markdown 代码块中的 JSON
        const markdownMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch) {
            jsonString = markdownMatch[1];
        } else {
            // 兜底：尝试提取第一个大括号对
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonString = jsonMatch[0];
            }
        }

        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Parse diagnosis result failed:', result);
        return {
            scores: { completeness: 70, starCompliance: 60, quantification: 50, expression: 70 },
            totalScore: 62,
            level: 'average',
            issues: [{ module: '整体', severity: 'info', issue: 'AI 诊断结果解析失败', suggestion: '请重试或手动检查' }]
        };
    }
};
