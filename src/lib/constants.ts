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
  GITHUB_TOKEN: "fastwrite_github_token",  GENERATION_IN_PROGRESS: "fastwrite_gen_in_progress",
  PROGRESS_STATE: "fastwrite_progress_state",  GENERATION_META: "fastwrite_generation_meta",
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
      { id: "gpt-5.2", name: "GPT-5.2", description: "Latest and most capable" },
      { id: "gpt-5.2-pro", name: "GPT-5.2 Pro", description: "Smartest and most precise" },
      { id: "gpt-5-mini", name: "GPT-5 Mini", description: "Fast and cost-efficient" },
      { id: "gpt-5-nano", name: "GPT-5 Nano", description: "Fastest, most cost-efficient" },
      { id: "custom", name: "Custom", description: "Enter your own model ID" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    apiKeyPlaceholder: "AI...",
    models: [
      { id: "gemini-3-pro", name: "Gemini 3 Pro", description: "Most intelligent, best for agentic tasks" },
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", description: "Most balanced, speed & scale" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Best price-performance" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", description: "Ultra fast, cost-efficient" },
      { id: "custom", name: "Custom", description: "Enter your own model ID" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    apiKeyUrl: "https://console.groq.com/keys",
    apiKeyPlaceholder: "gsk_...",
    models: [
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 (8B)", description: "Fast and efficient" },
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 (70B)", description: "More capable" },
      { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", description: "OpenAI open-weight 120B" },
      { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", description: "OpenAI open-weight 20B" },
      { id: "custom", name: "Custom", description: "Enter your own model ID" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyUrl: "https://openrouter.ai/settings/keys",
    apiKeyPlaceholder: "sk-or-...",
    models: [
      { id: "xiaomi/mimo-v2-flash:free", name: "MiMo-V2-Flash", description: "Top open-source, free" },
      { id: "mistralai/devstral-2512:free", name: "Devstral 2", description: "Agentic coding, free" },
      { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", description: "Balanced performance, free" },
      { id: "tngtech/tng-r1t2-chimera:free", name: "TNG R1T Chimera", description: "Creative storytelling, free" },
      { id: "custom", name: "Custom", description: "Enter your own model ID" },
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
