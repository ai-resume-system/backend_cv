export interface IAiCareerCategoryContext {
  name: string;
  slug: string;
}

export interface IAiSkillContext {
  name: string;
  slug: string;
  careerCategorySlug?: string;
  careerCategoryName?: string;
  parentSlug?: string;
  parentName?: string;
  aliases?: string[];
}

export interface IAiAnalysisScoreBreakdown {
  roleClarity: number;
  skillCoverage: number;
  experienceQuality: number;
  impactEvidence: number;
  educationRelevance: number;
  atsReadiness: number;
  presentationClarity: number;
}

export interface IAiAnalysisSkill {
  name: string;
  systemSkillSlug?: string;
  normalizedName: string;
  confidence?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
  evidence?: string;
}

export interface IAiOtherDetectedSkill {
  name: string;
  normalizedName: string;
  confidence?: number;
  evidence?: string;
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
  durationMonths?: number;
  description?: string;
  achievements?: string[];
}

export interface IAiAnalysisProject {
  name?: string;
  role?: string;
  description?: string;
  technologies?: string[];
  outcomes?: string[];
}

export interface IAiCareerCategorySuggestion {
  name: string;
  slug: string;
  confidence: number;
}

export interface IAiAnalysisResult {
  summary: string;
  resumeQualityScore: number;
  scoreBreakdown: IAiAnalysisScoreBreakdown;
  primaryRole?: string;
  seniorityLevel?:
    | 'intern'
    | 'fresher'
    | 'junior'
    | 'middle'
    | 'senior'
    | 'lead'
    | 'manager'
    | 'unknown';
  careerCategorySuggestion?: IAiCareerCategorySuggestion;
  matchedSkills: IAiAnalysisSkill[];
  otherDetectedSkills: IAiOtherDetectedSkill[];
  keywords: string[];
  relatedJobTitles: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  education: IAiAnalysisEducation[];
  experience: IAiAnalysisExperience[];
  projects: IAiAnalysisProject[];
  atsNotes: string[];
  provider?: string;
  model?: string;
  confidenceFlags?: string[];
}

export interface IAiAnalysisRequest {
  cvId: string;
  rawText: string;
  fileExtension: 'pdf' | 'docx' | 'doc';
  requestedProvider?: 'groq' | 'gemini' | 'glm';
  availableCareerCategories?: IAiCareerCategoryContext[];
  availableSkills?: IAiSkillContext[];
}
