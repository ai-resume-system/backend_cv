import { Injectable } from '@nestjs/common';
import {
  IAiAnalysisEducation,
  IAiAnalysisExperience,
  IAiAnalysisResult,
  IAiAnalysisSkill,
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
      score: this.normalizeScore(result.score),
      skills: this.normalizeSkills(result.skills),
      education: this.normalizeEducation(result.education),
      experience: this.normalizeExperience(result.experience),
      suggestions: this.normalizeSuggestions(result.suggestions),
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
      const normalizedName = this.normalizeSkillName(
        skill.normalizedName || rawName,
      );
      const existing = unique.get(normalizedName);
      const next: IAiAnalysisSkill = {
        name: rawName,
        normalizedName,
        confidence: this.normalizeConfidence(skill.confidence),
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
      description: this.normalizeOptionalText(item.description),
    }));
  }

  private normalizeSuggestions(suggestions: string[] = []): string[] {
    return suggestions
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 10);
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
}
