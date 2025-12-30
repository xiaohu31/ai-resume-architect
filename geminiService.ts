import { GoogleGenAI } from '@google/genai';
import { ResumeContent, DiagnosisResult } from "./types";
import { useResumeStore } from "./store";

// 获取 API Key：优先环境变量，其次用户设置
const getApiKey = (): string => {
  // 1. 优先从环境变量获取 (Vite 构建时注入)
  // @ts-ignore - Vite 在构建时会替换这个值
  const envKey = process.env.GEMINI_API_KEY || '';
  if (envKey) return envKey;

  // 2. 从用户设置中获取
  const userKey = useResumeStore.getState().resume?.settings?.apiKey || '';
  return userKey;
};

// 获取模型名称
const getModelName = (): string => {
  return useResumeStore.getState().resume?.settings?.modelName || 'gemini-2.0-flash';
};

// 通用 AI 调用函数
const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请在设置中配置 Gemini API Key，或在 .env.local 文件中设置 GEMINI_API_KEY');
  }

  const genAI = new GoogleGenAI({ apiKey });
  const modelName = getModelName();

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    return response.text || '';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'AI 请求失败，请检查 API Key 或网络连接');
  }
};

// 润色文本
export const polishText = async (text: string): Promise<string> => {
  const prompt = `你是一位专业的简历优化专家。请对以下简历内容进行润色，使其更加专业、简洁、有力。保持原意，优化表达方式。
直接返回优化后的内容，不要添加任何解释或前缀。

原文：
${text}`;
  return callGemini(prompt);
};

// 扩展文本
export const expandText = async (text: string): Promise<string> => {
  const prompt = `你是一位专业的简历优化专家。请对以下简历内容进行扩展，添加更多具体细节、量化指标或技术关键词，使其更加丰富和有说服力。保持专业性。
直接返回扩展后的内容，不要添加任何解释或前缀。

原文：
${text}`;
  return callGemini(prompt);
};

// 简化文本
export const simplifyText = async (text: string): Promise<string> => {
  const prompt = `你是一位专业的简历优化专家。请对以下简历内容进行简化，去除冗余信息，保留核心要点，使其更加精炼。
直接返回简化后的内容，不要添加任何解释或前缀。

原文：
${text}`;
  return callGemini(prompt);
};

// 总结文本
export const summarizeText = async (text: string): Promise<string> => {
  const prompt = `你是一位专业的简历优化专家。请用一句话总结以下内容的核心价值和亮点。
直接返回总结，不要添加任何解释或前缀。

原文：
${text}`;
  return callGemini(prompt);
};

// 简历诊断
export const diagnoseResume = async (resume: ResumeContent): Promise<DiagnosisResult> => {
  const prompt = `你是一位资深 HR 和简历专家。请从以下维度诊断这份简历，并返回 JSON 格式的评估结果：

评分维度（每项 0-100 分）：
1. completeness（完整性）：信息是否完整
2. starCompliance（STAR法则）：是否遵循情境-任务-行动-结果结构  
3. quantification（量化指标）：是否有具体数据支撑
4. expression（表达质量）：语言是否专业简洁

同时识别出需要改进的问题点，每个问题包含：
- module：所属模块名称
- field：具体字段（可选）
- severity："warning" 或 "info"
- issue：问题描述
- suggestion：改进建议

请严格按以下 JSON 格式返回，不要添加任何其他内容：
{
  "scores": { "completeness": 85, "starCompliance": 70, "quantification": 60, "expression": 80 },
  "totalScore": 74,
  "level": "good",
  "issues": [
    { "module": "工作经历", "field": "业绩描述", "severity": "warning", "issue": "缺少量化数据", "suggestion": "添加具体百分比或数字" }
  ]
}

简历内容：
${JSON.stringify(resume, null, 2)}`;

  const result = await callGemini(prompt);

  try {
    // 尝试提取 JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('无法解析诊断结果');
  } catch (e) {
    console.error('Parse diagnosis result failed:', result);
    // 返回默认结果
    return {
      scores: { completeness: 70, starCompliance: 60, quantification: 50, expression: 70 },
      totalScore: 62,
      level: 'average',
      issues: [{ module: '整体', severity: 'info', issue: 'AI 诊断结果解析失败', suggestion: '请重试或手动检查' }]
    };
  }
};
