// types/index.ts
// Shared type definitions

export interface AnalysisResult {
    score: number;
    overallAssessment: string;
}

export interface AnalysisError {
    error: string;
    details?: string;
}