export interface CSVRow {
  Task: string;
  Description: string;
  Actions: string;
  Objects: string;
}

export interface SearchResult {
  item: CSVRow;
  score?: number;
  matches?: any[];
  instructions?: string;
}

export interface UploadState {
  isUploading: boolean;
  isUploaded: boolean;
  error: string | null;
  fileName: string | null;
}

export interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface TogetherResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export type AIProvider = 'groq' | 'gemini' | 'mistral' | 'together' | 'deepseek';

export interface AIProviderOption {
  id: AIProvider;
  name: string;
  description: string;
}