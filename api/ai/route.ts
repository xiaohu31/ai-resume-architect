
import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { action, text, resume, modelName } = await req.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured on server' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const selectedModel = modelName || 'gemini-3-flash-preview';

    // 润色 (Polish)
    if (action === 'polish') {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: `你是一位资深简历专家。请润色以下内容，要求：语言专业化、表达精炼、使用行业术语并尽可能量化成果。原文：\n${text}\n直接输出润色后的内容，不要有任何解释。`,
      });
      return NextResponse.json({ result: response.text });
    }

    // 扩展 (Expand)
    if (action === 'expand') {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: `你是一位资深简历专家。请扩展以下内容，挖掘更多细节，补充具体的技术栈、动作和成果，使用 STAR 法则增强逻辑。原文：\n${text}\n直接输出扩展后的内容。`,
      });
      return NextResponse.json({ result: response.text });
    }

    // 简化 (Simplify)
    if (action === 'simplify') {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: `你是一位资深简历专家。请简化以下内容，去除冗余描述，合并同类项，保留核心贡献，使其精炼易读。原文：\n${text}\n直接输出简化后的内容。`,
      });
      return NextResponse.json({ result: response.text });
    }

    // 总结 (Summarize)
    if (action === 'summarize') {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: `你是一位资深简历专家。请将以下详细描述总结为 1 句充满力量感的核心结论。原文：\n${text}\n直接输出总结内容。`,
      });
      return NextResponse.json({ result: response.text });
    }

    // 诊断 (Diagnose)
    if (action === 'diagnose') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
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
      return NextResponse.json({ result: JSON.parse(response.text || '{}') });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('AI API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Server Internal Error' }, { status: 500 });
  }
}
