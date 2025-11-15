import { NextRequest, NextResponse } from 'next/server';

import { runScreenshotAnalysis } from '@/lib/analysis';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
];

const inferMimeType = (file: File): string => {
  if (file.type && ALLOWED_MIME_TYPES.includes(file.type)) {
    return file.type;
  }

  if (file.name.toLowerCase().endsWith('.jpg')) return 'image/jpeg';
  if (file.name.toLowerCase().endsWith('.jpeg')) return 'image/jpeg';
  if (file.name.toLowerCase().endsWith('.png')) return 'image/png';
  if (file.name.toLowerCase().endsWith('.webp')) return 'image/webp';
  if (file.name.toLowerCase().endsWith('.heic')) return 'image/heic';
  if (file.name.toLowerCase().endsWith('.heif')) return 'image/heif';

  return 'image/png';
};

const validateFile = (file: unknown): file is File =>
  file instanceof File && file.size > 0;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!validateFile(file)) {
      return NextResponse.json(
        { error: 'Upload requires a non-empty `file` field.' },
        { status: 400 },
      );
    }

    if (
      file.type &&
      !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())
    ) {
      return NextResponse.json(
        {
          error:
            'Unsupported image type. Please upload png, jpg, jpeg, webp, heic, or heif files.',
        },
        { status: 415 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Screenshot must be a non-empty image <= 10MB.' },
        { status: 413 },
      );
    }

    const mimeType = inferMimeType(file);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const analysis = await runScreenshotAnalysis({
      imageBase64: dataUrl,
      filename: file.name,
    });

    return NextResponse.json({
      file: {
        name: file.name,
        size: buffer.length,
        mimeType,
      },
      analysis,
      next: '/api/analyze',
    });
  } catch (error) {
    console.error('[upload-route]', error);
    return NextResponse.json(
      { error: 'Unable to process the uploaded screenshot.' },
      { status: 500 },
    );
  }
}
