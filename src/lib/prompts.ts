// Centralized prompt generation module for FastWrite

import { CODE_SECTION_MAP, REPORT_SECTION_MAP } from "./constants";

interface PromptOptions {
  sourceType: "github" | "zip";
  githubUrl?: string;
  projectDescription?: string;
  selectedCodeSections: string[];
  selectedReportSections: string[];
  literatureSource: "auto" | "manual";
  manualReferences?: string;
  arxivReferences?: string; // Pre-fetched arXiv papers formatted as text
  branch?: string;
}

/**
 * Generates the documentation prompt based on user selections
 */
export const generateDocumentationPrompt = (options: PromptOptions): string => {
  const {
    sourceType,
    projectDescription,
    selectedCodeSections,
    selectedReportSections,
    literatureSource,
    manualReferences,
    arxivReferences,
  } = options;

  const sourceText = sourceType === "github"
    ? "Source code from the repository"
    : "Source code from the uploaded ZIP file";

  // Get full section details for selected code sections
  const selectedCodeSectionDetails = selectedCodeSections.map(id => {
    const section = CODE_SECTION_MAP[id];
    if (section) {
      return `- ${section.label}: ${section.description}`;
    }
    return `- ${id}`;
  });

  // Get full section details for selected report sections
  const selectedReportSectionDetails = selectedReportSections.map(id => {
    const section = REPORT_SECTION_MAP[id];
    if (section) {
      return `- ${section.label}: ${section.description}`;
    }
    return `- ${id}`;
  });

  // Literature source handling
  let literatureText = "";
  if (selectedReportSections.includes("literature_survey")) {
    if (literatureSource === "auto") {
      if (arxivReferences && arxivReferences.trim()) {
        // Use pre-fetched arXiv papers
        literatureText = arxivReferences;
      } else {
        // Fallback if arXiv search wasn't performed
        literatureText = "Search for and include relevant academic papers based on the repository topic. Focus on recent publications in computer science and software engineering.";
      }
    } else if (manualReferences && manualReferences.trim()) {
      literatureText = `Use the following manually provided references for the literature survey:\n${manualReferences}`;
    } else {
      literatureText = "Use the manually provided references for the literature survey.";
    }
  }

  const visualizationText = "Include visual elements such as code structure diagrams, class hierarchy, or data flow visualizations where appropriate. Format any visual output in Mermaid.js format.";

  const prompt = `
You are a highly skilled software documentation expert. Generate comprehensive documentation for the following project:

Project Description:
${projectDescription || "No project description provided."}

${sourceText}

Generate the following code documentation sections:
${selectedCodeSectionDetails.length > 0
    ? selectedCodeSectionDetails.join('\n')
    : "No code documentation sections selected"}

Generate the following academic report sections:
${selectedReportSectionDetails.length > 0
    ? selectedReportSectionDetails.join('\n')
    : "No academic report sections selected"}

${literatureText ? `\nFor literature review: ${literatureText}` : ""}

${visualizationText}

Format the documentation in a clear, professional style with appropriate headings, examples, and references. Include code snippets where relevant to illustrate key concepts.
`.trim();

  return prompt;
};

/**
 * Generates a repair prompt for failed Mermaid diagrams
 */
export const generateDiagramRepairPrompt = (
  originalDiagram: string,
  contextPrompt?: string
): string => {
  return `You previously generated a Mermaid.js diagram that failed to render. Please correct the diagram syntax while preserving its meaning. Return only the fixed Mermaid code block with no extra commentary.

Context: ${contextPrompt ?? "Documentation generation"}

Original diagram:
\`\`\`mermaid
${originalDiagram}
\`\`\``;
};

/**
 * Gets section names for display in UI
 */
export const getCodeSectionNames = (): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(CODE_SECTION_MAP).map(([id, section]) => [id, section.label])
  );
};

/**
 * Gets report section names for display in UI
 */
export const getReportSectionNames = (): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(REPORT_SECTION_MAP).map(([id, section]) => [id, section.label])
  );
};
