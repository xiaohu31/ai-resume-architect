
import { ResumeContent, DiagnosisResult } from "./types";
import { useResumeStore } from "./store";

const callAiApi = async (action: string, payload: any) => {
  const modelName = useResumeStore.getState().resume.settings.modelName;
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload, modelName }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'AI 请求失败');
  }

  const data = await res.json();
  return data.result;
};

export const polishText = (text: string): Promise<string> => callAiApi('polish', { text });
export const expandText = (text: string): Promise<string> => callAiApi('expand', { text });
export const simplifyText = (text: string): Promise<string> => callAiApi('simplify', { text });
export const summarizeText = (text: string): Promise<string> => callAiApi('summarize', { text });
export const diagnoseResume = (resume: ResumeContent): Promise<DiagnosisResult> => callAiApi('diagnose', { resume });
