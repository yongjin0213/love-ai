import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { parseClaudeResponse, runScreenshotAnalysis } from '@/lib/analysis';

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

// Optimized for maximum token efficiency while maintaining text readability
const COMPRESSION_CONFIG = {
  maxWidth: 1024,   // ~1,398 tokens for 1024×1024 (57% reduction vs 1568×1568)
  maxHeight: 1024,
  quality: 85,      // Higher quality since image is smaller
  format: 'jpeg' as const,
};

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

/**
 * Calculate approximate Claude API token count for an image
 */
function estimateImageTokens(width: number, height: number): number {
  return Math.ceil((width * height) / 750);
}

/**
 * Compress image to maximize token efficiency while maintaining text readability
 */
async function compressImageForClaude(
  buffer: Buffer,
  originalMimeType: string,
): Promise<{
  base64: string;
  mimeType: string;
  compressedSize: number;
  dimensions: { width: number; height: number };
  estimatedTokens: number;
}> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Calculate dimensions while maintaining aspect ratio
    let width = metadata.width || COMPRESSION_CONFIG.maxWidth;
    let height = metadata.height || COMPRESSION_CONFIG.maxHeight;

    const originalTokens = estimateImageTokens(width, height);

    if (width > COMPRESSION_CONFIG.maxWidth || height > COMPRESSION_CONFIG.maxHeight) {
      const aspectRatio = width / height;

      if (width > height) {
        width = COMPRESSION_CONFIG.maxWidth;
        height = Math.round(width / aspectRatio);
      } else {
        height = COMPRESSION_CONFIG.maxHeight;
        width = Math.round(height * aspectRatio);
      }
    }

    const estimatedTokens = estimateImageTokens(width, height);

    // Compress image with optimized settings
    const compressedBuffer = await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3', // High-quality downscaling preserves text clarity
      })
      .jpeg({
        quality: COMPRESSION_CONFIG.quality,
        progressive: true,
        mozjpeg: true, // Superior compression algorithm
      })
      .toBuffer();

    const base64 = compressedBuffer.toString('base64');

    // Log compression and token stats
    const fileSizeReduction = (
      ((buffer.length - compressedBuffer.length) / buffer.length) *
      100
    ).toFixed(1);
    const tokenReduction = (
      ((originalTokens - estimatedTokens) / originalTokens) *
      100
    ).toFixed(1);

    console.log(
      `[compression] File: ${(buffer.length / 1024).toFixed(1)}KB → ${(compressedBuffer.length / 1024).toFixed(1)}KB (${fileSizeReduction}% reduction)`,
    );
    console.log(
      `[compression] Tokens: ~${originalTokens} → ~${estimatedTokens} (${tokenReduction}% reduction)`,
    );
    console.log(
      `[compression] Dimensions: ${metadata.width}×${metadata.height} → ${width}×${height}`,
    );

    return {
      base64,
      mimeType: 'image/jpeg',
      compressedSize: compressedBuffer.length,
      dimensions: { width, height },
      estimatedTokens,
    };
  } catch (error) {
    console.error('[compression] Failed to compress image:', error);
    // Fallback to original if compression fails
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || COMPRESSION_CONFIG.maxWidth;
    const height = metadata.height || COMPRESSION_CONFIG.maxHeight;

    return {
      base64: buffer.toString('base64'),
      mimeType: originalMimeType,
      compressedSize: buffer.length,
      dimensions: { width, height },
      estimatedTokens: estimateImageTokens(width, height),
    };
  }
}

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

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
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

    const originalMimeType = inferMimeType(file);

    // Compress image for maximum token efficiency
    const { base64, mimeType, compressedSize, dimensions, estimatedTokens } =
      await compressImageForClaude(buffer, originalMimeType);

    const dataUrl = `data:${mimeType};base64,${base64}`;

    const { rawResponse } = await runScreenshotAnalysis({
      imageBase64: dataUrl,
      filename: file.name,
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

    return NextResponse.json({
      file: {
        name: file.name,
        originalSize: buffer.length,
        compressedSize,
        mimeType,
        dimensions,
        estimatedTokens,
        savings: {
          fileSize: (((buffer.length - compressedSize) / buffer.length) * 100).toFixed(1) + '%',
        },
      },
      analysis: parsed,
      rawClaude: rawResponse,
    });
  } catch (error) {
    console.error('[upload-route]', error);
    return NextResponse.json(
      { error: 'Unable to process the uploaded screenshot.' },
      { status: 500 },
    );
  }
}