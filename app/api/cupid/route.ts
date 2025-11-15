import { NextRequest, NextResponse } from 'next/server';

import { askCupidQuestion } from '@/lib/analysis';
import type { ConversationMessage } from '@/types/conversation';

export const runtime = 'nodejs';

const isSender = (value: unknown): value is ConversationMessage['sender'] =>
  value === 'personA' || value === 'personB';

const normalizeConversation = (
  conversation: unknown,
): ConversationMessage[] => {
  if (!Array.isArray(conversation)) return [];

  return conversation
    .map((entry, index) => {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        typeof (entry as ConversationMessage).text !== 'string' ||
        !isSender((entry as ConversationMessage).sender)
      ) {
        return null;
      }

      return {
        id: (entry as ConversationMessage).id ?? `${index}`,
        sender: (entry as ConversationMessage).sender,
        text: (entry as ConversationMessage).text,
      };
    })
    .filter((item): item is ConversationMessage => Boolean(item));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question =
      typeof body?.question === 'string' ? body.question.trim() : '';
    const conversation = normalizeConversation(body?.conversation);

    if (!question) {
      return NextResponse.json(
        { error: 'Provide a question to ask Cupid.' },
        { status: 400 },
      );
    }

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: 'Include the parsed conversation for context.' },
        { status: 400 },
      );
    }

    const response = await askCupidQuestion(conversation, question);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[cupid-route]', error);
    return NextResponse.json(
      { error: 'Cupid is thinking too hard right now. Try again shortly.' },
      { status: 500 },
    );
  }
}
