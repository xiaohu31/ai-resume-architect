
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeContent, DiagnosisResult } from "./types";
import { useResumeStore } from "./store";

// 严格遵守：每次调用时创建新实例，确保密钥最新
const createAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const getModelName = (taskType: 'basic' | 'complex') => {
  const settings = useResumeStore.getState().resume.settings;
  if (taskType === 'complex') return 'gemini-3-pro-preview';
  return settings.modelName || 'gemini-3-flash-preview';
};

export const polishText = async (text: string): Promise<string> => {
  try {
    const ai = createAIInstance();
    const model = getModelName('basic');
    
    const response = await ai.models.generateContent({
      model,
      contents: `你是一位专业的简历专家。请对以下内容进行润色，使其更加专业、量化并符合行业标准。
原文：
${text}
直接输出润色后的结果，不要有任何开场白或解释。`,
    });
    
    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return response.text;
  } catch (error: any) {
    console.error("Polish Error:", error);
    if (error.message === "API_KEY_MISSING") throw new Error("请先在设置中配置 API 密钥");
    throw new Error("AI 润色服务暂时不可用，请稍后再试");
  }
};

export const expandText = async (text: string): Promise<string> => {
  try {
    const ai = createAIInstance();
    const model = getModelName('basic');

    const response = await ai.models.generateContent({
      model,
      contents: `你是一位专业的简历专家。请对以下内容进行扩展，丰富细节，增加量化指标（如百分比、具体数额等）。
原文：
${text}
直接输出扩展后的结果，不要有任何解释。`,
    });
    
    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return response.text;
  } catch (error: any) {
    console.error("Expand Error:", error);
    throw new Error(error.message || "AI 扩充服务暂时不可用");
  }
};

export const diagnoseResume = async (resume: ResumeContent): Promise<DiagnosisResult> => {
  try {
    const ai = createAIInstance();
    // 诊断任务涉及逻辑推理，强制使用 Pro 模型
    const model = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model,
      contents: `分析这份简历，给出评分和建议：\n${JSON.stringify(resume)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scores: {
              type: Type.OBJECT,
              properties: {
                completeness: { type: Type.NUMBER },
                starCompliance: { type: Type.NUMBER },
                quantification: { type: Type.NUMBER },
                expression: { type: Type.NUMBER },
              },
              required: ["completeness", "starCompliance", "quantification", "expression"]
            },
            totalScore: { type: Type.NUMBER },
            level: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  module: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  issue: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["module", "severity", "issue", "suggestion"]
              }
            }
          },
          required: ["scores", "totalScore", "level", "issues"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Diagnosis Error:", error);
    throw error;
  }
};
