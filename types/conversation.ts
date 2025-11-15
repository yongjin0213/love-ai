export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type MessageImpact = 'helped' | 'neutral' | 'hurt';

export interface ConversationMessage {
  id: string;
  sender: 'personA' | 'personB';
  text: string;
  timestamp?: string;
}

export interface MessageInsight {
  messageId: string;
  sender: ConversationMessage['sender'];
  impact: MessageImpact;
  explanation: string;
  confidence: ConfidenceLevel;
}

export interface RomanticAnalysis {
  parsedMessages: ConversationMessage[];
  romanticInterestScore: number;
  confidence: ConfidenceLevel;
  summary: string;
  messageInsights: MessageInsight[];
  suggestions: string[];
  model: {
    provider: 'claude' | 'mock';
    version: string;
  };
}

export interface ScreenshotAnalysisResult {
  analysis: RomanticAnalysis;
  queryContextId: string;
}
