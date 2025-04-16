
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
    
    // Code sections with descriptions
    const codeSectionNames: Record<string, { title: string, description: string }> = {
      inline_comments: { 
        title: "Inline Comments", 
        description: "Explanatory notes for individual lines of code" 
      },
      function_summaries: { 
        title: "Function Summaries", 
        description: "Brief explanations of each function's purpose and behavior" 
      },
      class_overviews: { 
        title: "Class Overviews", 
        description: "Comprehensive documentation of class structures and relationships" 
      },
      data_flow: { 
        title: "Data Flow Description", 
        description: "Explanation of how data moves through the application" 
      },
      code_complexity: { 
        title: "Code Complexity Estimates", 
        description: "Analysis of algorithmic complexity and performance considerations" 
      }
    };
    
    // Report sections with descriptions
    const reportSectionNames: Record<string, { title: string, description: string }> = {
      abstract: { 
        title: "Abstract", 
        description: "A brief summary of the entire project" 
      },
      introduction: { 
        title: "Introduction", 
        description: "Overview of the project's purpose and context" 
      },
      literature_survey: { 
        title: "Literature Survey", 
        description: "Review of related work and existing technologies" 
      },
      methodology: { 
        title: "Methodology", 
        description: "Approach and techniques used in development" 
      },
      proposed_system: { 
        title: "Proposed System", 
        description: "Detailed explanation of the system architecture and design" 
      },
      expected_results: { 
        title: "Expected Results", 
        description: "Anticipated outcomes and performance metrics" 
      },
      conclusion: { 
        title: "Conclusion", 
        description: "Summary of findings and final thoughts" 
      },
      future_scope: { 
        title: "Future Scope", 
        description: "Potential enhancements and future developments" 
      },
      references: { 
        title: "References", 
        description: "Citations and sources used in the documentation" 
      }
    };
    
    const selectedCodeSectionDetails = selectedCodeSections.map(id => {
      const section = codeSectionNames[id] || { title: id, description: "" };
      return `- ${section.title}: ${section.description}`;
    });
    
    const selectedReportSectionDetails = selectedReportSections.map(id => {
      const section = reportSectionNames[id] || { title: id, description: "" };
      return `- ${section.title}: ${section.description}`;
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
