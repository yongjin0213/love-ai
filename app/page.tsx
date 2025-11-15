'use client'

import { useState, useRef } from 'react'
import { Heart, TrendingUp, MessageSquare, Zap, Upload, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnalysisResult {
  score: number;
  overallAssessment: string;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string>('')
  const uploadRef = useRef<HTMLElement>(null)
  const resultsRef = useRef<HTMLElement>(null)

  const handleStartAnalysis = () => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.type)) {
      setError('Please upload a PNG, JPG, or GIF image')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please upload a screenshot first')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setShowResults(false)

    try {
      // Create FormData to send the image
      const formData = new FormData()
      formData.append('image', selectedFile)

      // Call your Next.js API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data: AnalysisResult = await response.json()

      // Set the results
      setAnalysisResult(data)
      setShowResults(true)

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze conversation. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setShowResults(false)
    setAnalysisResult(null)
    setError('')
    handleStartAnalysis()
  }

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
            <span className="font-semibold text-lg text-foreground">LoveData</span>
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleStartAnalysis}>
              Get Started
            </Button>
            <a href="/how-it-works" className="no-underline">
              <Button variant="ghost" size="sm">How It Works</Button>
            </a>
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
                Stop overthinking. Get data-driven insights into romantic emotions from your text conversations. Finally, let science settle your heart's questions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" onClick={handleStartAnalysis}>
                Start Analysis
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                See How It Works
              </Button>
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
                  "They seem genuinely interested based on response patterns and emotional language."
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
            How LoveData Works
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
            <h2 className="text-3xl font-bold text-foreground mb-2">Upload Screenshot</h2>
            <p className="text-muted-foreground">Upload a screenshot of your conversation. Your data is processed securely and never stored.</p>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => document.getElementById('screenshot-input')?.click()}
              className={`w-full h-48 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center cursor-pointer group ${selectedFile
                ? 'border-primary/60 bg-primary/5'
                : 'border-border/60 bg-background/50 hover:bg-background/80'
                }`}
            >
              <div className="text-center">
                {selectedFile ? (
                  <>
                    <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-foreground font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, or GIF (max 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <input
              id="screenshot-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0])
                }
              }}
            />

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
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
      {showResults && analysisResult && (
        <section ref={resultsRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
          <div className="space-y-8">
            {/* Main Score Card */}
            <div className="relative rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-2">Romantic Interest Score</p>
                  <div className="flex items-end gap-4">
                    <span className="text-6xl font-bold text-primary">{analysisResult.score}%</span>
                    <div className="flex-1">
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{ width: `${analysisResult.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-muted-foreground">{getScoreMessage(analysisResult.score)}</p>
                    </div>
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="pt-6 border-t border-primary/20">
                  <h3 className="font-semibold text-foreground mb-4">Overall Assessment</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {analysisResult.overallAssessment}
                  </p>
                </div>
              </div>
            </div>

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
                  This analysis is based on text patterns and should not be treated as definitive proof of someone's feelings. Human emotions are complex and context-dependent. Always prioritize:
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
                      <strong className="text-foreground">Respect:</strong> Respect the other person's boundaries and pace
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <div>
                      <strong className="text-foreground">Mental Health:</strong> If you're obsessing over signals, consider talking to a trusted friend or professional
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