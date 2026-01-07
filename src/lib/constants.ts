// Centralized constants for FastWrite UI

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "https://fastwrite-api.onrender.com",
  GENERATE_ENDPOINT: "/generate",
  REQUEST_TIMEOUT_MS: parseInt(import.meta.env.VITE_API_TIMEOUT_MS || "300000", 10), // 5 minutes default
  MAX_ZIP_SIZE_MB: parseInt(import.meta.env.VITE_MAX_ZIP_SIZE_MB || "50", 10),
  MAX_RETRIES: parseInt(import.meta.env.VITE_MAX_RETRIES || "3", 10),
  RETRY_DELAY_MS: parseInt(import.meta.env.VITE_RETRY_DELAY_MS || "2000", 10),
};

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  DOCUMENTATION_RESULT: "fastwrite_documentation_result",
  CONFETTI_SHOWN: "fastwrite_confetti_shown",
  HISTORY: "fastwrite_history",
  TEMPLATES: "fastwrite_templates",
  THEME: "fastwrite_theme",
  API_KEY: "fastwrite_api_key",
  LAST_PROVIDER: "fastwrite_last_provider",
  LAST_MODEL: "fastwrite_last_model",
  FORM_DATA: "fastwrite_form_data",
  GITHUB_TOKEN: "fastwrite_github_token",
  GENERATION_META: "fastwrite_generation_meta",
};

// ============================================
// Code Documentation Sections
// ============================================

export interface SectionDefinition {
  id: string;
  label: string;
  description: string;
}

export const CODE_SECTIONS: SectionDefinition[] = [
  {
    id: "code_overview",
    label: "OVERVIEW",
    description: "High-level summary of the codebase structure, architecture, and main components",
  },
  {
    id: "api_endpoints",
    label: "API",
    description: "Documentation of REST/GraphQL endpoints, request/response formats",
  },
  {
    id: "function_reference",
    label: "FUNCTIONS",
    description: "Detailed documentation of functions, methods, and their parameters",
  },
  {
    id: "class_reference",
    label: "CLASSES",
    description: "Documentation of classes, interfaces, and type definitions",
  },
  {
    id: "data_flow",
    label: "DATA FLOW",
    description: "How data moves through the application, including diagrams",
  },
  {
    id: "code_complexity",
    label: "COMPLEXITY",
    description: "Analysis of code complexity, dependencies, and potential improvements",
  },
  {
    id: "setup_guide",
    label: "SETUP",
    description: "Installation and configuration instructions for developers",
  },
  {
    id: "testing_guide",
    label: "TESTS",
    description: "How to run tests, testing conventions, and test coverage",
  },
  {
    id: "deployment_guide",
    label: "DEPLOY",
    description: "Deployment instructions, CI/CD configuration, and environment setup",
  },
];

// Map for quick lookup by ID
export const CODE_SECTION_MAP: Record<string, SectionDefinition> = CODE_SECTIONS.reduce(
  (acc, section) => ({ ...acc, [section.id]: section }),
  {}
);

// ============================================
// Report Documentation Sections
// ============================================

export const REPORT_SECTIONS: SectionDefinition[] = [
  {
    id: "overview",
    label: "OVERVIEW",
    description: "Executive summary of the project, its purpose, and key features",
  },
  {
    id: "features",
    label: "FEATURES",
    description: "Detailed breakdown of product features and capabilities",
  },
  {
    id: "architecture",
    label: "ARCHITECTURE",
    description: "Technical architecture, system design, and component relationships",
  },
  {
    id: "technology_stack",
    label: "STACK",
    description: "Languages, frameworks, libraries, and tools used",
  },
  {
    id: "literature_survey",
    label: "LITERATURE",
    description: "Related work, research papers, and academic references",
  },
  {
    id: "methodology",
    label: "METHODOLOGY",
    description: "Development approach, methodologies, and processes used",
  },
  {
    id: "implementation",
    label: "IMPLEMENTATION",
    description: "Technical implementation specifics and code walkthroughs",
  },
  {
    id: "results",
    label: "RESULTS",
    description: "Project outcomes, metrics, and analysis",
  },
  {
    id: "future_work",
    label: "FUTURE",
    description: "Planned improvements, roadmap, and potential enhancements",
  },
  {
    id: "conclusion",
    label: "CONCLUSION",
    description: "Summary of findings and final thoughts",
  },
];

// Map for quick lookup by ID
export const REPORT_SECTION_MAP: Record<string, SectionDefinition> = REPORT_SECTIONS.reduce(
  (acc, section) => ({ ...acc, [section.id]: section }),
  {}
);

// ============================================
// Valid Code File Extensions for ZIP Validation
// ============================================

export const VALID_CODE_EXTENSIONS: string[] = [
  // JavaScript/TypeScript
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  // Python
  ".py", ".pyw", ".pyx", ".pxd", ".pyi",
  // Java/Kotlin
  ".java", ".kt", ".kts",
  // C/C++
  ".c", ".h", ".cpp", ".hpp", ".cc", ".cxx", ".hxx",
  // C#
  ".cs", ".csx",
  // Go
  ".go",
  // Rust
  ".rs",
  // Ruby
  ".rb", ".rake", ".gemspec",
  // PHP
  ".php", ".phtml", ".php3", ".php4", ".php5", ".phps",
  // Swift
  ".swift",
  // Scala
  ".scala", ".sc",
  // Dart
  ".dart",
  // Shell
  ".sh", ".bash", ".zsh", ".fish",
  // PowerShell
  ".ps1", ".psm1", ".psd1",
  // SQL
  ".sql",
  // Web
  ".html", ".htm", ".css", ".scss", ".sass", ".less",
  // Config
  ".json", ".yaml", ".yml", ".toml", ".xml", ".ini", ".conf", ".config",
  // Documentation
  ".md", ".mdx", ".rst", ".txt",
  // Other
  ".vue", ".svelte", ".astro", ".r", ".R", ".jl", ".lua", ".pl", ".pm", ".ex", ".exs",
  ".elm", ".hs", ".ml", ".mli", ".clj", ".cljs", ".edn", ".erl", ".hrl", ".f90", ".f95",
];

// ============================================
// Default Templates
// ============================================

export interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  codeSections: string[];
  reportSections: string[];
  isBuiltIn: boolean;
}

export const DEFAULT_TEMPLATES: DocumentationTemplate[] = [
  {
    id: "quick-readme",
    name: "Quick README",
    description: "Generate a comprehensive README for your project",
    codeSections: ["code_overview", "setup_guide"],
    reportSections: ["overview", "features", "technology_stack"],
    isBuiltIn: true,
  },
  {
    id: "api-docs",
    name: "API Documentation",
    description: "Focus on API endpoints and function references",
    codeSections: ["api_endpoints", "function_reference", "class_reference"],
    reportSections: ["overview", "architecture"],
    isBuiltIn: true,
  },
  {
    id: "academic-report",
    name: "Academic Report",
    description: "Full academic-style documentation with literature survey",
    codeSections: ["code_overview", "data_flow", "code_complexity"],
    reportSections: [
      "overview",
      "literature_survey",
      "methodology",
      "implementation",
      "results",
      "conclusion",
    ],
    isBuiltIn: true,
  },
  {
    id: "developer-guide",
    name: "Developer Guide",
    description: "Complete guide for developers joining the project",
    codeSections: [
      "code_overview",
      "function_reference",
      "class_reference",
      "setup_guide",
      "testing_guide",
      "deployment_guide",
    ],
    reportSections: ["overview", "architecture", "technology_stack"],
    isBuiltIn: true,
  },
  {
    id: "comprehensive",
    name: "Comprehensive Documentation",
    description: "Include all available sections for complete documentation",
    codeSections: CODE_SECTIONS.map((s) => s.id),
    reportSections: REPORT_SECTIONS.map((s) => s.id),
    isBuiltIn: true,
  },
];

// ============================================
// History Configuration
// ============================================

export const HISTORY_CONFIG = {
  MAX_ITEMS: 20,
  PREVIEW_LENGTH: 200,
};

// ============================================
// Mermaid Chart Configuration
// ============================================

export const MERMAID_CONFIG = {
  MAX_REPAIR_ATTEMPTS: 3,
  THEME: "default",
  SECURITY_LEVEL: "loose" as const,
};

// ============================================
// AI Provider Configuration
// ============================================

export interface AIModel {
  id: string;
  name: string;
  description?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyUrl: string;
  apiKeyPlaceholder?: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    apiKeyPlaceholder: "sk-...",
    models: [
      { id: "gpt-5", name: "GPT-5", description: "Latest and most capable" },
      { id: "gpt-4o", name: "GPT-4o", description: "Optimized multimodal model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and cost-effective" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
      { id: "gpt-4o-realtime-preview", name: "GPT-4o Realtime Preview", description: "Preview version" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    apiKeyPlaceholder: "AI...",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Most capable Gemini" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast responses" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", description: "Lightweight and fast" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Previous generation flash" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    apiKeyPlaceholder: "gsk_...",
    models: [
      { id: "llama-3-8b", name: "Llama 3 (8B)", description: "Fast and efficient" },
      { id: "llama-3-70b", name: "Llama 3 (70B)", description: "More capable" },
      { id: "mixtral-8x7b", name: "Mixtral 8x7B", description: "Mixture of experts" },
      { id: "groq-1", name: "Groq-1", description: "Groq's native model" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    apiKeyPlaceholder: "sk-or-...",
    models: [
      { id: "minimax/minimax-m2:free", name: "Minimax M2", description: "Free tier" },
      { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1T2 Chimera", description: "Free tier" },
      { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Free tier" },
      { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder", description: "Free tier, coding focused" },
    ],
  },
];

// Helper functions for AI providers
export const getProviderById = (id: string): AIProvider | undefined =>
  AI_PROVIDERS.find((p) => p.id === id);

export const getModelById = (providerId: string, modelId: string): AIModel | undefined =>
  getProviderById(providerId)?.models.find((m) => m.id === modelId);

export const getProviderModels = (providerId: string): AIModel[] =>
  getProviderById(providerId)?.models ?? [];
