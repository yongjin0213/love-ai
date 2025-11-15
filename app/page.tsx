// app/page.tsx
'use client'

import Link from 'next/link'

import { useState, useRef, useCallback } from 'react'
import { Heart, TrendingUp, MessageSquare, Zap, Upload, Send, AlertCircle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import type { CupidResponse, ScreenshotAnalysisResult } from '@/types/conversation'

type UploadAnalysisResponse = {
  file?: {
    name: string;
    size: number;
    mimeType: string;
  };
  analysis: ScreenshotAnalysisResult;
  rawClaude?: string;
};

export default function Home() {
  // File upload state
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<UploadAnalysisResponse[]>([])
  const [showResults, setShowResults] = useState(false)
  const [cupidQuestion, setCupidQuestion] = useState('')
  const [cupidResponse, setCupidResponse] = useState<CupidResponse | null>(null)
  const [isCupidLoading, setIsCupidLoading] = useState(false)
  const [cupidError, setCupidError] = useState<string | null>(null)
  
  // Error state
  const [error, setError] = useState<string>('')
  const [errorRawClaude, setErrorRawClaude] = useState<string | null>(null)
  
  // Refs
  const uploadRef = useRef<HTMLElement>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleStartAnalysis = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const addImages = useCallback((newFiles: File[]) => {
    if (images.length > 0) {
      setError('Remove the current screenshot before uploading another.')
      return
    }

    const [file] = newFiles
    if (!file) return

    // Validate files
    const isInvalidType = !['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)
    const isTooLarge = file.size > 10 * 1024 * 1024

    if (isInvalidType || isTooLarge) {
      setError('Invalid screenshot. Please upload PNG, JPG, GIF, or WEBP under 10MB.')
      return
    }

    setImages([file])
    setError('')

    // Create previews
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviews([reader.result as string])
    }
    reader.readAsDataURL(file)
  }, [images])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (images.length > 0) {
      setError('Remove the current screenshot before uploading another.')
      return
    }

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    ).slice(0, 1)

    if (files.length > 0) {
      addImages(files)
    }
  }, [images, addImages])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (images.length > 0) {
        setError('Remove the current screenshot before uploading another.')
        return
      }
      const files = Array.from(e.target.files).slice(0, 1)
      addImages(files)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError('')
  }

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError('Please upload at least one screenshot')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setResults([])
    setShowResults(false)
    setCupidQuestion('')
    setCupidResponse(null)
    setCupidError(null)
    setErrorRawClaude(null)

    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const payload = (await uploadResponse.json()) as UploadAnalysisResponse & {
          error?: string;
          rawClaude?: string;
        }

        if (!uploadResponse.ok) {
          setErrorRawClaude(payload.rawClaude ?? null)
          throw new Error(payload.error || 'Upload failed')
        }

        const result = payload as UploadAnalysisResponse
        setResults((prev) => [...prev, result])

      }

      setShowResults(true)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err) {
      console.error('Analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze images. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAskCupid = async () => {
    if (!cupidQuestion.trim()) {
      setCupidError('Ask Cupid a specific question to get tailored advice.')
      return
    }
    const firstResult = results[0]
    const payload = firstResult?.analysis.analysis
    if (!payload?.parsedMessages?.length) {
      setCupidError('Cupid needs at least one analyzed conversation to respond.')
      return
    }

    setIsCupidLoading(true)
    setCupidError(null)
    setCupidResponse(null)

    try {
      const response = await fetch('/api/cupid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cupidQuestion.trim(),
          conversation: payload.parsedMessages,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Cupid could not answer that question.')
      }
      setCupidResponse(data as CupidResponse)
    } catch (err) {
      console.error('Cupid query failed:', err)
      setCupidError(
        err instanceof Error ? err.message : 'Cupid could not answer that question.',
      )
    } finally {
      setIsCupidLoading(false)
    }
  }

  const handleReset = () => {
    setImages([])
    setPreviews([])
    setResults([])
    setShowResults(false)
    setError('')
    setErrorRawClaude(null)
    handleStartAnalysis()
  }

  // Calculate average score from all results
  const averageScore = results.length > 0
    ? Math.round(
        results.reduce((sum, r) => sum + (r.analysis.analysis?.romanticInterestScore ?? 0), 0) / results.length
      )
    : 0

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Strong romantic interest detected! 💕"
    if (score >= 70) return "They seem genuinely interested! 😊"
    if (score >= 50) return "Mixed signals - proceed with caution 🤔"
    return "Likely just friends 🤝"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="font-semibold text-lg text-foreground">Arrows</span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleStartAnalysis}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">AI-Powered Analysis</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance mb-6">
                Never Second Guess <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Love Again</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Stop overthinking. Get AI-driven insights into romantic emotions from your text conversations. Finally, let science settle your heart&rsquo;s questions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" onClick={handleStartAnalysis}>
                Start Analysis
              </Button>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="px-8">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative lg:h-96 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-card border border-border/40 rounded-2xl p-8 backdrop-blur-sm shadow-2xl w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Romantic Score</h3>
                  <span className="text-3xl font-bold text-primary">78%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full"></div>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                  &ldquo;They seem genuinely interested based on response patterns and emotional language.&rdquo;
                </p>
                <div className="pt-6 space-y-3 border-t border-border/40">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-foreground">Strong positive engagement</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Emotional depth detected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            How Arrow Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to turn confusion into clarity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: MessageSquare,
              title: "Upload Screenshot",
              description: "Share a screenshot from your conversations. Your data stays completely private and is processed securely."
            },
            {
              icon: Zap,
              title: "AI Analysis",
              description: "Our Claude AI model analyzes emotional patterns, response times, and linguistic cues to understand romantic interest."
            },
            {
              icon: TrendingUp,
              title: "Get Your Score",
              description: "Receive a romantic interest percentage with detailed explanations backing the analysis."
            }
          ].map((feature, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm hover:border-accent/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent p-2.5 mb-6">
                  <feature.icon className="w-full h-full text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload & Analysis Section */}
      <section ref={uploadRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="bg-card border border-border/40 rounded-2xl p-8 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Upload Screenshots</h2>
            <p className="text-muted-foreground">Upload screenshots of your conversation. Your data is processed securely and never stored.</p>
          </div>

          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => {
                if (images.length > 0) {
                  setError('Remove the current screenshot before uploading another.')
                  return
                }
                document.getElementById('screenshot-input')?.click()
              }}
              className={`w-full h-48 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center cursor-pointer group ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : images.length > 0
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border/60 bg-background/50 hover:bg-background/80'
              }`}
            >
              <div className="text-center">
                {images.length > 0 ? (
                  <>
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-foreground font-medium">1 screenshot selected</p>
                    <p className="text-sm text-muted-foreground mt-1">Remove it to upload a different one</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF, or WEBP (max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <input
              id="screenshot-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
              ref={fileInputRef}
            />

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border/40"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(index)
                      }}
                      disabled={isAnalyzing}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
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
            )}

            {/* Progress indicator removed */}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive">{error}</p>
                  {errorRawClaude && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-destructive/80 hover:text-destructive">
                        Show raw Claude response
                      </summary>
                      <pre className="mt-2 text-xs bg-destructive/5 p-2 rounded overflow-auto max-h-40">
                        {errorRawClaude}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={images.length === 0 || isAnalyzing}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && results.length > 0 && (
        <section ref={resultsRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
          <div className="space-y-8">
            {/* Main Score Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-2">Average Romantic Interest Score</p>
                  <div className="flex items-end gap-4">
                    <span className="text-6xl font-bold text-primary">{averageScore}%</span>
                    <div className="flex-1">
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${averageScore}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">{getScoreMessage(averageScore)}</p>
                    </div>
                  </div>
                </div>

                {/* Overall Assessment */}
                {results[0]?.analysis?.analysis?.summary && (
                  <div className="pt-6 border-t border-primary/20">
                    <h3 className="font-semibold text-foreground mb-4">Overall Assessment</h3>
                    <p className="text-foreground/80 leading-relaxed">
                      {results[0].analysis.analysis.summary}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Results for Each Screenshot */}
            {results.map((result, index) => {
              const payload = result.analysis.analysis
              const insights = payload?.messageInsights ?? []

              return (
                <div key={index} className="bg-card border border-border/40 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Screenshot {index + 1}
                    </h3>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {payload?.romanticInterestScore ?? '--'}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {payload?.confidence ?? 'Unknown'}
                      </p>
                    </div>
                  </div>

                  {payload?.suggestions?.length ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Coaching Tips</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {payload.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {insights.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Message Insights</h4>
                      <div className="space-y-2">
                        {insights.map((insight) => {
                          const impactColors = {
                            helped: 'border-green-200 bg-green-50 text-green-900',
                            neutral: 'border-yellow-200 bg-yellow-50 text-yellow-900',
                            hurt: 'border-red-200 bg-red-50 text-red-900',
                          }
                          return (
                            <div
                              key={insight.messageId}
                              className={`rounded-lg border p-3 text-sm ${impactColors[insight.impact]}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs uppercase font-semibold">{insight.impact}</span>
                                <span className="text-xs">
                                  {insight.sender === 'personB' ? 'You' : 'Target'}
                                </span>
                              </div>
                              <p className="font-medium mb-1">{insight.explanation}</p>
                              {(insight.messageText || messageMap.get(insight.messageId)) && (
                                <p className="text-xs text-foreground/90 mb-1">
                                  &ldquo;{insight.messageText || messageMap.get(insight.messageId)?.text}&rdquo;
                                </p>
                              )}
                              <p className="text-xs opacity-75">Confidence: {insight.confidence}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {payload?.parsedMessages?.length ? (
                    <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-foreground">Ask Cupid</h4>
                          <p className="text-xs text-muted-foreground">
                            Ask follow-up questions and get personalized guidance.
                          </p>
                        </div>
                      </div>
                      <textarea
                        value={cupidQuestion}
                        onChange={(e) => setCupidQuestion(e.target.value)}
                        placeholder="e.g. How do I ask Target out after this conversation?"
                        rows={3}
                        className="w-full rounded-lg border border-border/50 bg-background/80 p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                        disabled={isCupidLoading || isAnalyzing}
                      />
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                          size="sm"
                          onClick={handleAskCupid}
                          disabled={
                            isCupidLoading ||
                            isAnalyzing ||
                            !cupidQuestion.trim() ||
                            payload.parsedMessages.length === 0
                          }
                        >
                          {isCupidLoading ? 'Cupid is thinking...' : 'Ask Cupid'}
                        </Button>
                        {cupidError && (
                          <p className="text-xs text-destructive">{cupidError}</p>
                        )}
                      </div>
                      {cupidResponse && (
                        <div className="mt-4 rounded-lg border border-border/50 bg-background/80 p-3 text-sm text-foreground">
                          <p className="font-semibold mb-2">Cupid says:</p>
                          <p className="text-muted-foreground">{cupidResponse.answer}</p>
                          {cupidResponse.tips?.length ? (
                            <div className="mt-3">
                              <p className="text-xs font-semibold uppercase text-foreground tracking-wide mb-1">
                                Coaching Tips
                              </p>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                {cupidResponse.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}

            {/* CTA */}
            <Button
              onClick={handleReset}
              size="lg"
              variant="outline"
              className="w-full"
            >
              Analyze Another Conversation
            </Button>

            {/* Ethical Disclaimer */}
            <div className="mt-12 pt-8 border-t border-border/40">
              <div className="bg-muted/30 border border-border/40 rounded-lg p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 flex items-center gap-3">
                  💜 Ethical Considerations
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  This analysis is based on text patterns and should not be treated as definitive proof of someone&rsquo;s feelings. Human emotions are complex and context-dependent. Always prioritize:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Consent:</strong> Only analyze conversations you have permission to share
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Direct Communication:</strong> Use this as a starting point, not a replacement for honest conversations
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Respect:</strong> Respect the other person&rsquo;s boundaries and pace
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Mental Health:</strong> If you&rsquo;re obsessing over signals, consider talking to a trusted friend or professional
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Privacy:</strong> Your data is never stored or shared with third parties
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" fill="currentColor" />
              <span className="font-semibold text-foreground">LoveData</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 LoveData. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
