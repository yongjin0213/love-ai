import type { ScreenshotAnalysisResult } from '@/types/conversation';

const CLAUDE_MODEL = 'claude-opus-4-1-20250805';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export interface ScreenshotAnalysisParams {
  imageBase64: string;
  filename?: string;
}

const buildPrompt = () => `
You are a texting coach. Analyze the provided screenshot that represents a text conversation.
Return ONLY valid JSON that matches this TypeScript schema:
{
  "analysis": {
    "parsedMessages": { "id": string, "sender": "personA" | "personB", "text": string }[],
    "romanticInterestScore": number, // 0-100 integer
    "confidence": "Low" | "Medium" | "High",
    "summary": string,
    "messageInsights": {
      "messageId": string,
      "sender": "personA" | "personB",
      "impact": "helped" | "neutral" | "hurt",
      "explanation": string,
      "confidence": "Low" | "Medium" | "High"
    }[],
    "suggestions": string[],
    "model": { "provider": "claude", "version": "${CLAUDE_MODEL}" }
  },
  "queryContextId": string
}

Person A should represent the texter whose romantic interest we are evaluating, and Person B should represent the other participant (the user reviewing this analysis).
Whenever you refer to Person A in any part of the response, call them "Target".
Whenever you refer to Person B, speak directly using second-person pronouns (you/your).
Focus on whether Target shows romantic interest toward you.
Strip away any markdown fences or commentary—respond with raw JSON only.
`;

const stripBase64Prefix = (dataUrl: string) =>
  dataUrl.replace(/^data:[^;]+;base64,/, '');

const extractMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.+);base64,/);
  return match ? match[1] : 'image/png';
};

export const parseClaudeResponse = (
  payload: unknown,
): ScreenshotAnalysisResult | null => {
  if (!payload) return null;

  try {
    if (typeof payload === 'string') {
      const parsed = JSON.parse(payload) as ScreenshotAnalysisResult;
      if (parsed?.analysis?.parsedMessages) return parsed;
    }

    if (typeof payload === 'object') {
      const parsed = payload as ScreenshotAnalysisResult;
      if (parsed?.analysis?.parsedMessages) return parsed;
      const jsonCandidate = JSON.stringify(payload);
      const fallback = JSON.parse(jsonCandidate) as ScreenshotAnalysisResult;
      if (fallback?.analysis?.parsedMessages) return fallback;
    }
  } catch {
    return null;
  }

  return null;
};

export interface ClaudeAnalysisPayload {
  rawResponse: string;
}

const callClaude = async (
  params: ScreenshotAnalysisParams,
): Promise<ClaudeAnalysisPayload> => {
  const apiKey = process.env.ANTHROPIC_AI_KEY;
  if (!apiKey) throw new Error('Claude API key not configured.');

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    temperature: 0,
    system: buildPrompt(),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this screenshot and return the JSON result.',
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: extractMimeType(params.imageBase64),
              data: stripBase64Prefix(params.imageBase64),
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = Array.isArray(data?.content) ? data.content : [];
  const textBlock = content.find(
    (item: { type?: string }) => item?.type === 'text',
  );
  const jsonChunk =
    typeof textBlock?.text === 'string' ? textBlock.text.trim() : '';
  const rawResponse = jsonChunk || JSON.stringify(data);
  return { rawResponse };
};

export const runScreenshotAnalysis = async (
  params: ScreenshotAnalysisParams,
): Promise<ClaudeAnalysisPayload> => {
  return callClaude(params);
};
