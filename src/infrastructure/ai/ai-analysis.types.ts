export interface IAiAnalysisSkill {
  name: string;
  normalizedName: string;
  confidence?: number;
}

export interface IAiAnalysisEducation {
  school?: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface IAiAnalysisExperience {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface IAiAnalysisResult {
  summary: string;
  score: number;
  skills: IAiAnalysisSkill[];
  education: IAiAnalysisEducation[];
  experience: IAiAnalysisExperience[];
  suggestions: string[];
  provider?: string;
  model?: string;
  confidenceFlags?: string[];
}

export interface IAiAnalysisRequest {
  cvId: string;
  rawText: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  requestedProvider?: 'gemini' | 'openai' | 'groq';
}
