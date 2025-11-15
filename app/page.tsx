// components/ImageUploader.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
  MessageImpact,
  ScreenshotAnalysisResult,
} from '@/types/conversation';

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadAnalysisResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorRawClaude, setErrorRawClaude] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      addImages(files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = (newFiles: File[]) => {
    setImages(prev => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;

    setIsAnalyzing(true);
    setProgress(0);
    setErrorMessage(null);
    setResults([]);
    setErrorRawClaude(null);

    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const payload = (await uploadResponse.json()) as UploadAnalysisResponse & {
          error?: string;
          rawClaude?: string;
        };

        if (!uploadResponse.ok) {
          setErrorRawClaude(payload.rawClaude ?? null);
          throw new Error(payload.error || 'Upload failed');
        }

        const result = payload as UploadAnalysisResponse;
        setResults((prev) => [...prev, result]);

        setProgress(((i + 1) / images.length) * 100);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to analyze images. Please try again.');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze images. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const impactStyles = useMemo(
    () =>
      ({
        helped: 'border-green-200 bg-green-50 text-green-900',
        neutral: 'border-yellow-200 bg-yellow-50 text-yellow-900',
        hurt: 'border-red-200 bg-red-50 text-red-900',
      }) satisfies Record<MessageImpact, string>,
    [],
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Message Sentiment Analyzer</h1>
        <p className="text-gray-600">
          Upload screenshots of your conversations to see how much your friend likes you
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-lg mb-2">
            <span className="font-semibold text-blue-600">Click to upload</span>
            {' '}or drag and drop
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP, HEIC (max 10MB per image)
          </p>
        </label>
      </div>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Uploaded Images ({images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  disabled={isAnalyzing}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  aria-label="Remove image"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {isAnalyzing && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Analyzing... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`
              mt-6 w-full py-3 px-6 rounded-lg font-semibold text-white
              ${isAnalyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
              transition-colors
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Analyzing Messages...
              </span>
            ) : (
              'Analyze Messages'
            )}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errorMessage}
          </div>
          {errorRawClaude && (
            <details className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <summary className="cursor-pointer font-medium text-gray-900">
                Raw Claude response (error)
              </summary>
              <pre className="mt-3 overflow-auto rounded bg-white p-3 text-xs text-gray-800">
{errorRawClaude}
              </pre>
            </details>
          )}
        </div>
      )}

      {results.length > 0 && (
        <section className="mt-12 space-y-8">
          <h2 className="text-2xl font-semibold">Analysis Results</h2>
          {results.map((result, index) => {
            const payload = result.analysis.analysis;
            const insights = payload?.messageInsights ?? [];
            const messageMap = new Map(
              (payload?.parsedMessages ?? []).map((message) => [message.id, message]),
            );

            const rawJsonDisplay = (() => {
              if (result.rawClaude) {
                try {
                  return JSON.stringify(JSON.parse(result.rawClaude), null, 2);
                } catch {
                  return result.rawClaude;
                }
              }
              return JSON.stringify(result.analysis, null, 2);
            })();

            return (
              <article
                key={`${result.file?.name ?? 'upload'}-${index}`}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <header className="flex flex-col gap-2 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase text-gray-500">Romantic Interest Score</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {payload?.romanticInterestScore ?? '--'}%
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      Confidence:{' '}
                      <span className="font-semibold text-gray-900">
                        {payload?.confidence ?? 'Unknown'}
                      </span>
                    </p>
                    {result.file?.name && <p>Source file: {result.file.name}</p>}
                    <p>Query context: {result.analysis.queryContextId}</p>
                  </div>
                </header>

                {payload?.summary && (
                  <p className="mt-4 text-lg text-gray-800">{payload.summary}</p>
                )}

                {payload?.suggestions?.length ? (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-900">Coaching Tips</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-700">
                      {payload.suggestions.map((suggestion, suggestionIndex) => (
                        <li key={suggestionIndex}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {insights.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-semibold text-gray-900">Message Insights</h3>
                    <div className="mt-3 space-y-3">
                      {insights.map((insight) => {
                        const message = messageMap.get(insight.messageId);
                        const impactClass = impactStyles[insight.impact];
                        return (
                          <div
                            key={insight.messageId}
                            className={`rounded-xl border p-4 ${impactClass}`}
                          >
                            <div className="flex items-center justify-between text-sm uppercase">
                              <span>{insight.impact}</span>
                              <span className="text-gray-600">
                                {insight.sender === 'personB' ? 'You' : 'Person A'}
                              </span>
                            </div>
                            <p className="mt-2 text-base font-medium">
                              {message?.text ?? 'Message text unavailable.'}
                            </p>
                            <p className="mt-1 text-sm text-gray-700">{insight.explanation}</p>
                            <p className="mt-1 text-xs text-gray-600">
                              Confidence: {insight.confidence}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <details className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  <summary className="cursor-pointer font-medium text-gray-900">
                    Raw JSON response
                  </summary>
                  <pre className="mt-3 overflow-auto rounded bg-white p-3 text-xs text-gray-800">
{rawJsonDisplay}
                  </pre>
                </details>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

type UploadAnalysisResponse = {
  file?: {
    name: string;
    size: number;
    mimeType: string;
  };
  analysis: ScreenshotAnalysisResult;
  rawClaude?: string;
};
