import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PromptPreviewProps {
  sourceType: "github" | "zip";
  githubUrl: string;
  selectedCodeSections: string[];
  selectedReportSections: string[];
  literatureSource: "auto" | "manual";
}

export const PromptPreview = ({
  sourceType,
  githubUrl,
  selectedCodeSections,
  selectedReportSections,
  literatureSource
}: PromptPreviewProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    // Generate the prompt based on selected options
    const sourceText = sourceType === "github" 
      ? "Source code from the repository" 
      : "Source code from the uploaded ZIP file";
    
    // Code sections with descriptions - use the same data as DocumentationPreferences
    const codeSectionNames: Record<string, { label: string, description: string }> = {
      code_overview: { 
        label: "Code Overview", 
        description: "High-level summary of the codebase structure and organization" 
      },
      api_endpoints: { 
        label: "API Endpoints", 
        description: "Document API routes, methods, parameters, and responses" 
      },
      function_reference: { 
        label: "Function Reference", 
        description: "Detailed documentation of key functions and methods" 
      },
      component_library: { 
        label: "Component Library", 
        description: "Catalog of UI components with props and usage examples" 
      },
      data_models: { 
        label: "Data Models", 
        description: "Document database schema, types, and data flow" 
      },
      config_options: { 
        label: "Configuration Options", 
        description: "Document environment variables and configuration settings" 
      },
      setup_guide: { 
        label: "Setup Guide", 
        description: "Instructions for setting up development environment" 
      },
      troubleshooting: { 
        label: "Troubleshooting", 
        description: "Common issues and their solutions" 
      },
      code_examples: { 
        label: "Code Examples", 
        description: "Practical examples for common use cases" 
      }
    };
    
    // Report sections with descriptions - use the same data as DocumentationPreferences
    const reportSectionNames: Record<string, { label: string, description: string }> = {
      abstract: { 
        label: "Abstract", 
        description: "Brief summary of the entire project" 
      },
      introduction: { 
        label: "Introduction", 
        description: "Overview of the problem and solution" 
      },
      literature_survey: { 
        label: "Literature Survey", 
        description: "Review of related work and technologies" 
      },
      methodology: { 
        label: "Methodology", 
        description: "Approach and methods used" 
      },
      proposed_system: { 
        label: "Proposed System", 
        description: "Detailed description of the system architecture" 
      },
      expected_results: { 
        label: "Expected Results", 
        description: "Expected outcomes and performance" 
      },
      conclusion: { 
        label: "Conclusion", 
        description: "Summary of findings and implementation" 
      },
      future_scope: { 
        label: "Future Scope", 
        description: "Potential future improvements and extensions" 
      },
      references: { 
        label: "References", 
        description: "Citations and references used" 
      }
    };
    
    const selectedCodeSectionDetails = selectedCodeSections.map(id => {
      const section = codeSectionNames[id] || { label: id, description: "" };
      return `- ${section.label}: ${section.description}`;
    });
    
    const selectedReportSectionDetails = selectedReportSections.map(id => {
      const section = reportSectionNames[id] || { label: id, description: "" };
      return `- ${section.label}: ${section.description}`;
    });
    
    const literatureText = selectedReportSections.includes("literature_survey")
      ? literatureSource === "auto"
        ? "Automatically search arXiv for relevant papers based on the repository topic."
        : "Use the manually provided references for the literature survey."
      : "";

    // Include indication that visual elements should be generated for the documentation
    const visualizationText = "Include visual elements such as code structure diagrams, class hierarchy, or data flow visualizations where appropriate. Format any visual output in Mermaid.js format.";

    const generatedPrompt = `
You are a highly skilled software documentation expert. Generate comprehensive documentation for the following project:

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

    setPrompt(generatedPrompt);
  }, [sourceType, githubUrl, selectedCodeSections, selectedReportSections, literatureSource]);

  return (
    <div className="border rounded-md bg-slate-50 p-2 md:p-3">
      <ScrollArea className={`${isMobile ? 'h-36' : 'h-48'} w-full rounded`}>
        <pre className="text-xs md:text-sm font-mono whitespace-pre-wrap p-2 text-slate-800">{prompt}</pre>
      </ScrollArea>
    </div>
  );
};
