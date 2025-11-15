import { NextRequest, NextResponse } from 'next/server';

import { parseClaudeResponse, runScreenshotAnalysis } from '@/lib/analysis';

export const runtime = 'nodejs';

const MAX_BASE64_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const BASE64_REGEX = /^[a-z0-9+/=\s]+$/i;

const normalizeBase64Image = (
  imageBase64: unknown,
  mimeType?: unknown,
): string | null => {
  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) return null;

  if (imageBase64.startsWith('data:')) {
    return imageBase64;
  }

  const sanitized = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
  if (sanitized.length === 0 || !BASE64_REGEX.test(sanitized)) return null;

  const normalizedMime =
    typeof mimeType === 'string' && mimeType.startsWith('image/')
      ? mimeType
      : 'image/png';

  return `data:${normalizedMime};base64,${sanitized}`;
};

const calculateBase64Size = (dataUrl: string): number => {
  const [, encoded] = dataUrl.split(',');
  if (!encoded) return 0;
  return Buffer.byteLength(encoded, 'base64');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const normalizedImage = normalizeBase64Image(
      body?.imageBase64,
      body?.mimeType,
    );

    if (!normalizedImage) {
      return NextResponse.json(
        {
          error:
            'Provide an `imageBase64` string formatted as a data URL or raw base64 payload.',
        },
        { status: 400 },
      );
    }

    const byteLength = calculateBase64Size(normalizedImage);
    if (byteLength === 0 || byteLength > MAX_BASE64_IMAGE_BYTES) {
      return NextResponse.json(
        { error: 'Screenshot must be a non-empty image <= 10MB.' },
        { status: 413 },
      );
    }

    const filename =
      typeof body?.filename === 'string' ? body.filename : undefined;
    const { rawResponse } = await runScreenshotAnalysis({
      imageBase64: normalizedImage,
      filename,
    });
    const parsed = parseClaudeResponse(rawResponse);
    if (!parsed) {
      return NextResponse.json(
        {
          error: 'Claude returned a response that was not valid JSON.',
          rawClaude: rawResponse,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[analyze-route]', error);
    return NextResponse.json(
      { error: 'Unable to analyze the screenshot right now.' },
      { status: 500 },
    );
  }
}
