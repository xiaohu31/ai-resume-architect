
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeContent, DiagnosisResult } from "./types";

// Fix: Always use the mandated named parameter format and direct environment variable access
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const polishText = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `你是一位专业的简历优化专家。请对以下简历内容进行润色，使其更加专业、流畅、有说服力。
要求：
1. 保持原意不变，优化表达方式
2. 使用更专业的词汇和行业术语
3. 语句简洁有力，避免冗余
4. 突出成果和贡献

原文：
${text}

请直接输出润色后的内容，不要添加任何解释。`,
  });
  return response.text || text;
};

export const expandText = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `你是一位专业的简历优化专家。请对以下简历内容进行扩展，丰富细节，增强说服力。
要求：
1. 补充具体的数据、成果或案例
2. 增加技术细节或方法论描述
3. 扩展后控制在原文 1.5-2 倍长度
4. 保持真实可信，不要过度夸大

原文：
${text}

请直接输出扩展后的内容，不要添加任何解释。`,
  });
  return response.text || text;
};

export const diagnoseResume = async (resume: ResumeContent): Promise<DiagnosisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `你是一位资深的HR和简历优化专家。请对以下简历内容进行全面诊断分析。
## 简历内容
${JSON.stringify(resume, null, 2)}

请以JSON格式输出诊断结果。`,
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
                field: { type: Type.STRING },
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

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error("Failed to parse diagnosis result");
  }
};
