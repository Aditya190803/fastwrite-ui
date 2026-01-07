import { z } from "zod";

export interface DocumentationResult {
  textContent: string;
  visualContent?: string;
  generatedAt?: number;
  sourceType?: "github" | "zip";
  sourceName?: string;
}

// Zod schema for API response validation
export const GenerateResponseSchema = z.object({
  text_content: z.string().optional(),
  documentation: z.string().optional(),
  visual_content: z.string().optional(),
  diagram: z.string().optional(),
  message: z.string().optional(),
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// API request payload type
export interface GeneratePayload {
  github_url: string;
  zip_file: string | null;
  llm_provider: string;
  llm_model: string;
  api_key: string;
  prompt: string;
  github_token?: string;
  branch?: string;
  manual_references?: string;
}

// Template type
export interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  codeSections: string[];
  reportSections: string[];
  createdAt?: number;
  isCustom?: boolean;
}

// History entry type
export interface HistoryEntry {
  id: string;
  result: DocumentationResult;
  sourceName: string;
  sourceType: "github" | "zip";
  generatedAt: number;
  provider: string;
  model: string;
}

// Generation metadata type
export interface GenerationMetadata {
  provider: string;
  model: string;
  prompt: string;
  generatedAt: number;
  sourceType?: "github" | "zip";
  sourceName?: string;
}

// Progress step for generation
export interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

export const GENERATION_STEPS: ProgressStep[] = [
  { id: "validate", label: "VALIDATE", status: "pending" },
  { id: "analyze", label: "ANALYZE", status: "pending" },
  { id: "literature", label: "RESEARCH", status: "pending" },
  { id: "generate", label: "WRITE", status: "pending" },
  { id: "diagrams", label: "DIAGRAMS", status: "pending" },
  { id: "finalize", label: "FINISH", status: "pending" },
];
