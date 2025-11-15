import {
  ConfidenceLevel,
  ConversationMessage,
  MessageImpact,
  MessageInsight,
  RomanticAnalysis,
  ScreenshotAnalysisResult,
} from '@/types/conversation';

const CLAUDE_MODEL = 'claude-opus-4-1-20250805';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const positiveKeywords = [
  'love',
  'miss',
  'soon',
  'excited',
  'fun',
  'great',
  'cute',
  'adorable',
  '😍',
  '😊',
  'lol',
  'haha',
];

const curiousKeywords = [
  'why',
  'when',
  'how',
  'maybe',
  'could',
  'should',
  'plan',
  'idea',
  'sometime',
];

const negativeKeywords = [
  'busy',
  'idk',
  'later',
  'stop',
  'tired',
  'nah',
  'no',
  'maybe another time',
  'not sure',
  'dont know',
];

const supportiveKeywords = ['proud', 'happy for you', 'congrats', 'support'];

const fallbackConversation: ConversationMessage[] = [
  {
    id: '0',
    sender: 'personA',
    text: 'Hey! Had an awesome time last night 😊',
  },
  {
    id: '1',
    sender: 'personB',
    text: 'Same! Your story about the concert had me laughing haha',
  },
  {
    id: '2',
    sender: 'personA',
    text: 'We should do another adventure soon, maybe the night market?',
  },
  {
    id: '3',
    sender: 'personB',
    text: 'That sounds fun, I am free Friday after 7!',
  },
];

export interface ScreenshotAnalysisParams {
  imageBase64: string;
  filename?: string;
}

const buildPrompt = () => `
You are a texting coach. Analyze the provided screenshot that represents a text conversation.
Return ONLY valid JSON that matches this TypeScript schema:
{
  "analysis": {
    "parsedMessages": { "id": string, "sender": "personA" | "personB", "text": string, "timestamp"?: string }[],
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

Impact color coding:
- helped => green highlight
- neutral => yellow highlight
- hurt => red highlight

Focus on whether Person B shows romantic interest toward Person A.
`;

const parseClaudeResponse = (payload: unknown): ScreenshotAnalysisResult | null => {
  if (!payload || typeof payload !== 'object') return null;
  try {
    const jsonCandidate =
      typeof payload === 'string'
        ? payload
        : JSON.stringify(payload);
    const parsed =
      typeof payload === 'string'
        ? (JSON.parse(payload) as ScreenshotAnalysisResult)
        : (payload as ScreenshotAnalysisResult);
    if (parsed?.analysis?.parsedMessages) return parsed;
    const fallback = JSON.parse(jsonCandidate) as ScreenshotAnalysisResult;
    return fallback;
  } catch {
    return null;
  }
};

const callClaude = async (
  params: ScreenshotAnalysisParams,
): Promise<ScreenshotAnalysisResult> => {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error('Claude API key not configured');

  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: buildPrompt(),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Please analyze this screenshot and return the JSON result.',
          },
          {
            type: 'input_image',
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
    (item: { type: string }) => item?.type === 'text',
  );
  const jsonChunk =
    typeof textBlock?.text === 'string' ? textBlock.text.trim() : '';
  const parsed = parseClaudeResponse(jsonChunk);
  if (!parsed) {
    throw new Error('Claude response could not be parsed into JSON.');
  }
  return parsed;
};

const stripBase64Prefix = (dataUrl: string) =>
  dataUrl.replace(/^data:[^;]+;base64,/, '');

const extractMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.+);base64,/);
  return match ? match[1] : 'image/png';
};

const clampScore = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const keywordScore = (text: string, keywords: string[]) =>
  keywords.reduce(
    (score, keyword) =>
      score + (text.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0),
    0,
  );

const classifyImpact = (
  message: ConversationMessage,
): { impact: MessageImpact; explanation: string } => {
  const lowered = message.text.toLowerCase();
  const positiveHits = keywordScore(lowered, positiveKeywords);
  const negativeHits = keywordScore(lowered, negativeKeywords);
  const supportiveHits = keywordScore(lowered, supportiveKeywords);
  const curiosityHits = keywordScore(lowered, curiousKeywords);

  if (positiveHits + supportiveHits > negativeHits && positiveHits > 0) {
    return {
      impact: 'helped',
      explanation: 'Positive language and warmth keeps momentum.',
    };
  }

  if (message.sender === 'personB' && curiosityHits > 0) {
    return {
      impact: 'helped',
      explanation: 'Follow-up questions show interest and investment.',
    };
  }

  if (negativeHits > positiveHits) {
    return {
      impact: 'hurt',
      explanation: 'Hesitation or distancing language lowers momentum.',
    };
  }

  return {
    impact: 'neutral',
    explanation: 'This message maintains tone without major impact.',
  };
};

const generateMockAnalysis = (
  filename?: string,
): ScreenshotAnalysisResult => {
  const conversation =
    fallbackConversation.map((message, index) => ({
      ...message,
      id: message.id ?? `${index}`,
    })) ?? [];

  const positiveCount = conversation.reduce(
    (score, message) => score + keywordScore(message.text, positiveKeywords),
    0,
  );
  const negativeCount = conversation.reduce(
    (score, message) => score + keywordScore(message.text, negativeKeywords),
    0,
  );
  const baseScore = 55 + (positiveCount - negativeCount) * 6;
  const romanticInterestScore = Math.round(clampScore(baseScore));

  const messageInsights: MessageInsight[] = conversation.map((message) => {
    const { impact, explanation } = classifyImpact(message);
    const confidenceForMessage: ConfidenceLevel =
      message.text.length > 40 ? 'High' : message.text.length > 15 ? 'Medium' : 'Low';

    return {
      messageId: message.id,
      sender: message.sender,
      impact,
      explanation,
      confidence: confidenceForMessage,
    };
  });

  const suggestions = [
    'Mirror the energy in Person B’s strongest “helped” messages to keep rapport.',
    'Avoid repeating tones flagged as “hurt” and instead ground the convo in shared plans.',
    'Ask a concrete follow-up that matches Person B’s availability or curiosity cues.',
  ];

  const summary =
    romanticInterestScore >= 70
      ? 'Plenty of positive energy and reciprocal curiosity are present.'
      : romanticInterestScore >= 50
      ? 'There are encouraging signals, but momentum depends on next moves.'
      : 'Conversation lacks warmth from Person B, so you may need to reset tone.';

  const analysis: RomanticAnalysis = {
    parsedMessages: conversation,
    romanticInterestScore,
    confidence: conversation.length >= 8 ? 'High' : conversation.length >= 4 ? 'Medium' : 'Low',
    summary,
    messageInsights,
    suggestions,
    model: {
      provider: 'mock',
      version: filename ? `mock-from-${filename}` : 'mock-v1',
    },
  };

  return {
    analysis,
    queryContextId: 'mock-context',
  };
};

export const runScreenshotAnalysis = async (
  params: ScreenshotAnalysisParams,
): Promise<ScreenshotAnalysisResult> => {
  try {
    return await callClaude(params);
  } catch (error) {
    console.warn('[analysis] Falling back to heuristic analysis:', error);
    return generateMockAnalysis(params.filename);
  }
};
