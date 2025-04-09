
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
      ? `Repository: ${githubUrl || "[GitHub URL]"}` 
      : "Source code from the uploaded ZIP file";
    
    const codeSectionNames: Record<string, string> = {
      inline_comments: "Inline Comments",
      function_summaries: "Function Summaries",
      class_overviews: "Class Overviews",
      data_flow: "Data Flow Description",
      code_complexity: "Code Complexity Estimates"
    };
    
    const reportSectionNames: Record<string, string> = {
      abstract: "Abstract",
      introduction: "Introduction",
      literature_survey: "Literature Survey",
      methodology: "Methodology",
      proposed_system: "Proposed System",
      expected_results: "Expected Results",
      conclusion: "Conclusion",
      future_scope: "Future Scope",
      references: "References"
    };
    
    const selectedCodeSectionNames = selectedCodeSections.map(id => codeSectionNames[id] || id);
    const selectedReportSectionNames = selectedReportSections.map(id => reportSectionNames[id] || id);
    
    const literatureText = selectedReportSections.includes("literature_survey")
      ? literatureSource === "auto"
        ? "Automatically search arXiv for relevant papers based on the repository topic."
        : "Use the manually provided references for the literature survey."
      : "";

    // Include indication that visual elements should be generated for the documentation
    const visualizationText = "Include visual elements such as code structure diagrams, class hierarchy, or data flow visualizations where appropriate. Format any visual output in Graphviz DOT format.";

    const generatedPrompt = `
You are a highly skilled software documentation expert. Generate comprehensive documentation for the following project:

${sourceText}

Generate the following code documentation sections:
${selectedCodeSectionNames.length > 0 
  ? selectedCodeSectionNames.map(name => `- ${name}`).join('\n') 
  : "No code documentation sections selected"}

Generate the following academic report sections:
${selectedReportSectionNames.length > 0 
  ? selectedReportSectionNames.map(name => `- ${name}`).join('\n') 
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
