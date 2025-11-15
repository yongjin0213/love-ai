'use client'

import { Heart, Zap, Brain, Lock, BarChart3, MessageSquare, CheckCircle, AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HowItWorks() {
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
                    {/* Removed sign in button */}
                </div>
            </nav>

            {/* Page Header */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold text-foreground mb-4">How LoveData Works</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl">
                        Our advanced AI model analyzes text patterns, emotional language, and engagement indicators to give you data-driven insights into romantic interest.
                    </p>
                </div>
            </section>

            {/* The Process */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="space-y-12">

                    {/* Step 1 */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                            <MessageSquare className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">1. Text Extraction</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            You upload a screenshot or paste the conversation directly. Our system extracts and normalizes the text, removing metadata while preserving message content and context.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                            <Brain className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">2. Pattern Recognition</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Our AI model analyzes dozens of factors including response times, emoji usage, personalization level, vulnerability sharing, initiative in planning, and conversational depth to identify romantic signals.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                            <BarChart3 className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">3. Scoring Algorithm</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            These factors are weighted and aggregated through our proprietary scoring model, which has been trained on thousands of conversations to predict romantic interest with high accuracy.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6">
                            <Zap className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">4. Actionable Results</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            You get a romantic interest percentage, detailed message breakdowns, green flags vs red flags, and recommendations for how to proceed with clarity and confidence.
                        </p>
                    </div>
                </div>
            </section>
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border/40">
                <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Key Factors We Analyze</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { title: "Message Length & Effort", desc: "Longer, thoughtful messages suggest higher investment and interest" },
                        { title: "Question Frequency", desc: "Asking questions shows curiosity and desire to continue talking" },
                        { title: "Conversation Initiative", desc: "Starting chats and reviving threads demonstrates active engagement" },
                        { title: "Tone & Enthusiasm", desc: "Exclamations and expressive language convey excitement and energy" },
                        { title: "Linguistic Markers", desc: "Sharing personal details and feelings indicates trust and openness" },
                        { title: "Emotional Indicators", desc: "Compliments and specific references show genuine attention to you" },
                    ].map((factor, idx) => (
                        <div key={idx} className="bg-card border border-border/40 rounded-xl p-6 backdrop-blur-sm">
                            <h3 className="font-semibold text-foreground mb-2">{factor.title}</h3>
                            <p className="text-sm text-muted-foreground">{factor.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Privacy */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 border-t border-border/40">
                <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">Your Data is Always Private</h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                We never store your conversations, never sell your data, and never use it to train our models. Your analysis is processed and immediately deleted. We process everything with end-to-end encryption and follow strict privacy practices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ethical Considerations */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 border-t border-border/40">
                <h2 className="text-4xl font-bold text-foreground mb-12 text-center">Ethical Considerations</h2>

                <div className="space-y-8">

                    {/* Consent */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <Users className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Respect Consent</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Only analyze conversations you have explicit permission to share. If you're analyzing a text with someone, they should feel comfortable knowing you're looking for romantic signals. Privacy and consent are the foundation of healthy relationships.
                        </p>
                        <div className="bg-muted/30 border border-border/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Best Practice:</strong> Consider if you'd be comfortable telling your crush that you analyzed your conversation together.
                            </p>
                        </div>
                    </div>

                    {/* Communication */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <Brain className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Communication Over Analysis</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            LoveData is a tool for clarity, not a substitute for genuine human connection. Our analysis should empower you to have honest conversations, not replace them. The best relationships are built on direct communication about feelings and intentions.
                        </p>
                        <div className="bg-muted/30 border border-border/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Pro Tip:</strong> Use our insights as a conversation starter, not a decision maker. "I feel like we connect really well, where do you see this going?" is way better than basing decisions solely on text analysis.
                            </p>
                        </div>
                    </div>

                    {/* Context Limitations */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <AlertCircle className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Understand Our Limitations</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Text is just one dimension of human communication. Tone of voice, body language, cultural context, and individual communication styles all matter. Someone might be reserved in text but deeply interested in person. Our algorithm is sophisticated but not infallible.
                        </p>
                        <ul className="space-y-2 text-muted-foreground text-sm">
                            <li>• Neurodivergent individuals may communicate differently</li>
                            <li>• Different cultures have different communication norms</li>
                            <li>• People express themselves differently in different mediums</li>
                            <li>• Stress, work, and external factors affect how people text</li>
                        </ul>
                    </div>

                    {/* Mental Health */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <Heart className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Protect Your Mental Health</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            If you find yourself constantly analyzing every message or obsessing over a score, that's a sign to step back. Healthy relationships don't require this much analysis. If you're struggling with anxiety about someone's interest level, it might be worth talking to a trusted friend or therapist.
                        </p>
                        <div className="bg-muted/30 border border-border/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Remember:</strong> You deserve someone who makes their interest in you clear, and you deserve peace of mind in relationships.
                            </p>
                        </div>
                    </div>

                    {/* Respect */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <CheckCircle className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Respect Their Agency</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            A high interest score doesn't mean you're owed a relationship. A low score doesn't mean you should give up. Respect the other person's right to choose, to change their mind, to be unsure, or to simply not be interested. Use our tool as information, not justification.
                        </p>
                        <div className="bg-muted/30 border border-border/20 rounded-lg p-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                <strong>Key Principle:</strong> Healthy love is never about convincing someone. If they're interested, they'll show it in their actions, not just their texts.
                            </p>
                        </div>
                    </div>

                    {/* Privacy */}
                    <div className="bg-card border border-border/40 rounded-xl p-8 backdrop-blur-sm">
                        <div className="flex gap-4 mb-6">
                            <Lock className="w-8 h-8 text-primary flex-shrink-0 mt-0.5" />
                            <h3 className="text-2xl font-bold text-foreground">Privacy is Non-Negotiable</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Your conversations are yours. We never store them, never analyze them for training purposes, and never sell your data. Your romantic journey is private, and we treat it with the respect it deserves.
                        </p>
                        <ul className="space-y-2 text-muted-foreground text-sm mt-4">
                            <li>✓ End-to-end encryption for all uploads</li>
                            <li>✓ Conversations deleted after analysis</li>
                            <li>✓ No third-party data sharing</li>
                            <li>✓ No ads or targeted marketing</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center border-t border-border/40">
                <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Get Clarity?</h2>
                {/* Changed to Start Analysis button that links to landing page */}
                <a href="/#analysis">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                        Start Analysis
                    </Button>
                </a>
            </section>
        </main>
    )
}
