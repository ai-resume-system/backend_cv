export interface IPreviewTempCVAnalysisDto {
  tempFileKey: string;
  requestedProvider?: 'groq' | 'gemini' | 'glm';
}

export interface ISaveTempCVAnalysisDto {
  tempFileKey: string;
  title?: string;
}
