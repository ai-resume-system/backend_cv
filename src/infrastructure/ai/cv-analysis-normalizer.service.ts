import { Injectable } from '@nestjs/common';
import {
  IAiAnalysisEducation,
  IAiAnalysisExperience,
  IAiAnalysisProject,
  IAiAnalysisResult,
  IAiAnalysisScoreBreakdown,
  IAiAnalysisSkill,
  IAiCareerCategorySuggestion,
  IAiOtherDetectedSkill,
} from './ai-analysis.types';

const SKILL_ALIAS_MAP: Record<string, string> = {
  'node.js': 'nodejs',
  'node js': 'nodejs',
  nodejs: 'nodejs',
  'react.js': 'reactjs',
  'react js': 'reactjs',
  reactjs: 'reactjs',
  'next.js': 'nextjs',
  'next js': 'nextjs',
  nextjs: 'nextjs',
  'vue.js': 'vuejs',
  'vue js': 'vuejs',
  vuejs: 'vuejs',
  typescript: 'typescript',
  javascript: 'javascript',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  'c#': 'csharp',
  'c sharp': 'csharp',
  dotnet: '.net',
  '.net core': '.net',
};

@Injectable()
export class CVAnalysisNormalizerService {
  normalize(result: IAiAnalysisResult): IAiAnalysisResult {
    return {
      summary: String(result.summary || '').trim(),
      resumeQualityScore: this.normalizeScore(result.resumeQualityScore),
      scoreBreakdown: this.normalizeScoreBreakdown(result.scoreBreakdown),
      primaryRole: this.normalizeOptionalText(result.primaryRole),
      seniorityLevel: this.normalizeSeniorityLevel(result.seniorityLevel),
      careerCategorySuggestion: this.normalizeCareerCategorySuggestion(
        result.careerCategorySuggestion,
      ),
      matchedSkills: this.normalizeSkills(result.matchedSkills),
      otherDetectedSkills: this.normalizeOtherDetectedSkills(
        result.otherDetectedSkills,
      ),
      keywords: this.normalizeStringArray(result.keywords, 20),
      relatedJobTitles: this.normalizeStringArray(result.relatedJobTitles, 8),
      strengths: this.normalizeStringArray(result.strengths, 8),
      weaknesses: this.normalizeStringArray(result.weaknesses, 8),
      improvementSuggestions: this.normalizeStringArray(
        result.improvementSuggestions,
        10,
      ),
      education: this.normalizeEducation(result.education),
      experience: this.normalizeExperience(result.experience),
      projects: this.normalizeProjects(result.projects),
      atsNotes: this.normalizeStringArray(result.atsNotes, 10),
      provider: result.provider?.trim(),
      model: result.model?.trim(),
      confidenceFlags: Array.isArray(result.confidenceFlags)
        ? result.confidenceFlags
            .map((item) => String(item || '').trim())
            .filter(Boolean)
        : [],
    };
  }

  private normalizeSkills(skills: IAiAnalysisSkill[] = []): IAiAnalysisSkill[] {
    const unique = new Map<string, IAiAnalysisSkill>();
    for (const skill of skills) {
      const rawName = String(skill?.name || '').trim();
      if (!rawName) continue;
      const systemSkillSlug = this.normalizeOptionalText(skill.systemSkillSlug);
      const normalizedName = this.normalizeSkillName(
        skill.normalizedName || systemSkillSlug || rawName,
      );
      const existing = unique.get(normalizedName);
      const next: IAiAnalysisSkill = {
        name: rawName,
        systemSkillSlug,
        normalizedName,
        confidence: this.normalizeConfidence(skill.confidence),
        level: this.normalizeSkillLevel(skill.level),
        evidence: this.normalizeOptionalText(skill.evidence),
      };
      if (!existing || (next.confidence || 0) > (existing.confidence || 0)) {
        unique.set(normalizedName, next);
      }
    }
    return Array.from(unique.values());
  }

  private normalizeOtherDetectedSkills(
    skills: IAiOtherDetectedSkill[] = [],
  ): IAiOtherDetectedSkill[] {
    const unique = new Map<string, IAiOtherDetectedSkill>();
    for (const skill of skills) {
      const rawName = String(skill?.name || '').trim();
      if (!rawName) continue;
      const normalizedName = this.normalizeSkillName(
        skill.normalizedName || rawName,
      );
      const existing = unique.get(normalizedName);
      const next: IAiOtherDetectedSkill = {
        name: rawName,
        normalizedName,
        confidence: this.normalizeConfidence(skill.confidence),
        evidence: this.normalizeOptionalText(skill.evidence),
      };
      if (!existing || (next.confidence || 0) > (existing.confidence || 0)) {
        unique.set(normalizedName, next);
      }
    }
    return Array.from(unique.values());
  }

  private normalizeEducation(
    education: IAiAnalysisEducation[] = [],
  ): IAiAnalysisEducation[] {
    return education.map((item) => ({
      school: this.normalizeOptionalText(item.school),
      degree: this.normalizeOptionalText(item.degree),
      fieldOfStudy: this.normalizeOptionalText(item.fieldOfStudy),
      startDate: this.normalizeOptionalText(item.startDate),
      endDate: this.normalizeOptionalText(item.endDate),
      description: this.normalizeOptionalText(item.description),
    }));
  }

  private normalizeExperience(
    experience: IAiAnalysisExperience[] = [],
  ): IAiAnalysisExperience[] {
    return experience.map((item) => ({
      company: this.normalizeOptionalText(item.company),
      title: this.normalizeOptionalText(item.title),
      startDate: this.normalizeOptionalText(item.startDate),
      endDate: this.normalizeOptionalText(item.endDate),
      durationMonths: this.normalizeNonNegativeNumber(item.durationMonths),
      description: this.normalizeOptionalText(item.description),
      achievements: this.normalizeStringArray(item.achievements, 10),
    }));
  }

  private normalizeProjects(
    projects: IAiAnalysisProject[] = [],
  ): IAiAnalysisProject[] {
    return projects.map((item) => ({
      name: this.normalizeOptionalText(item.name),
      role: this.normalizeOptionalText(item.role),
      description: this.normalizeOptionalText(item.description),
      technologies: this.normalizeStringArray(item.technologies, 12),
      outcomes: this.normalizeStringArray(item.outcomes, 10),
    }));
  }

  private normalizeSkillName(value: string): string {
    const normalized = value.toLowerCase().replace(/\s+/g, ' ').trim();
    return SKILL_ALIAS_MAP[normalized] || normalized;
  }

  private normalizeScore(score: number): number {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Number(score.toFixed(2))));
  }

  private normalizeScoreBreakdown(
    scoreBreakdown?: IAiAnalysisScoreBreakdown,
  ): IAiAnalysisScoreBreakdown {
    return {
      roleClarity: this.normalizeScore(scoreBreakdown?.roleClarity || 0),
      skillCoverage: this.normalizeScore(scoreBreakdown?.skillCoverage || 0),
      experienceQuality: this.normalizeScore(
        scoreBreakdown?.experienceQuality || 0,
      ),
      impactEvidence: this.normalizeScore(scoreBreakdown?.impactEvidence || 0),
      educationRelevance: this.normalizeScore(
        scoreBreakdown?.educationRelevance || 0,
      ),
      atsReadiness: this.normalizeScore(scoreBreakdown?.atsReadiness || 0),
      presentationClarity: this.normalizeScore(
        scoreBreakdown?.presentationClarity || 0,
      ),
    };
  }

  private normalizeConfidence(confidence?: number): number | undefined {
    if (typeof confidence !== 'number' || Number.isNaN(confidence)) {
      return undefined;
    }
    return Math.max(0, Math.min(1, Number(confidence.toFixed(4))));
  }

  private normalizeOptionalText(value?: string): string | undefined {
    const normalized = String(value || '').trim();
    return normalized || undefined;
  }

  private normalizeStringArray(values: string[] = [], max = 10): string[] {
    return values
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, max);
  }

  private normalizeNonNegativeNumber(value?: number): number | undefined {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      return undefined;
    }
    return Math.round(value);
  }

  private normalizeSeniorityLevel(
    value?: IAiAnalysisResult['seniorityLevel'],
  ): IAiAnalysisResult['seniorityLevel'] {
    const allowed = new Set([
      'intern',
      'fresher',
      'junior',
      'middle',
      'senior',
      'lead',
      'manager',
      'unknown',
    ]);
    if (!value || !allowed.has(value)) {
      return 'unknown';
    }
    return value;
  }

  private normalizeSkillLevel(
    value?: IAiAnalysisSkill['level'],
  ): IAiAnalysisSkill['level'] {
    const allowed = new Set([
      'beginner',
      'intermediate',
      'advanced',
      'expert',
      'unknown',
    ]);
    if (!value || !allowed.has(value)) {
      return 'unknown';
    }
    return value;
  }

  private normalizeCareerCategorySuggestion(
    value?: IAiCareerCategorySuggestion,
  ): IAiCareerCategorySuggestion | undefined {
    if (!value) {
      return undefined;
    }

    const slug = this.normalizeOptionalText(value.slug);
    const name = this.normalizeOptionalText(value.name);
    if (!slug || !name) {
      return undefined;
    }

    return {
      name,
      slug,
      confidence: this.normalizeScore(value.confidence),
    };
  }
}
