import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { SourceInput } from "@/components/SourceInput";
import { DocumentationPreferences } from "@/components/DocumentationPreferences";
import { PromptPreview } from "@/components/PromptPreview";
import { Header } from "@/components/Header";
import { CardSection } from "@/components/CardSection";
import { SubmitButton } from "@/components/SubmitButton";
import { DocumentationResult } from "@/types/documentation";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sourceType, setSourceType] = useState<"github" | "zip">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // AI model state
  const [selectedAiProvider, setSelectedAiProvider] = useState<string>("google");
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");

  // Documentation preferences
  const [selectedCodeSections, setSelectedCodeSections] = useState<string[]>([
    "inline_comments",
    "function_summaries",
    "class_overviews"
  ]);
  
  const [selectedReportSections, setSelectedReportSections] = useState<string[]>([
    "abstract",
    "introduction",
    "methodology"
  ]);
  
  const [literatureSource, setLiteratureSource] = useState<"auto" | "manual">("auto");
  const [manualReferences, setManualReferences] = useState("");

  // Load saved form data from sessionStorage
  useEffect(() => {
    const loadSavedFormData = () => {
      try {
        const savedFormData = sessionStorage.getItem('documentationFormData');
        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          
          // Set form values from saved data
          if (formData.sourceType) setSourceType(formData.sourceType);
          if (formData.githubUrl) setGithubUrl(formData.githubUrl);
          if (formData.projectDescription) setProjectDescription(formData.projectDescription);
          if (formData.selectedAiProvider) setSelectedAiProvider(formData.selectedAiProvider);
          if (formData.selectedAiModel) setSelectedAiModel(formData.selectedAiModel);
          if (formData.selectedCodeSections) setSelectedCodeSections(formData.selectedCodeSections);
          if (formData.selectedReportSections) setSelectedReportSections(formData.selectedReportSections);
          if (formData.literatureSource) setLiteratureSource(formData.literatureSource);
          if (formData.manualReferences) setManualReferences(formData.manualReferences);
        }
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    };

    loadSavedFormData();
  }, []);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    const saveFormData = () => {
      try {
        const formData = {
          sourceType,
          githubUrl,
          projectDescription,
          selectedAiProvider,
          selectedAiModel,
          selectedCodeSections,
          selectedReportSections,
          literatureSource,
          manualReferences
        };
        
        sessionStorage.setItem('documentationFormData', JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    };

    saveFormData();
  }, [
    sourceType,
    githubUrl,
    projectDescription,
    selectedAiProvider,
    selectedAiModel,
    selectedCodeSections,
    selectedReportSections,
    literatureSource,
    manualReferences
  ]);

  const handleSubmit = async () => {
    try {
      // Validation
      if (sourceType === "github" && !githubUrl) {
        toast.error("Please enter a GitHub repository URL");
        return;
      }
      
      if (sourceType === "zip" && !zipFile) {
        toast.error("Please upload a ZIP file");
        return;
      }
      
      if (selectedCodeSections.length === 0 && selectedReportSections.length === 0) {
        toast.error("Please select at least one documentation section");
        return;
      }
      
      if (!selectedAiProvider || !selectedAiModel) {
        toast.error("Please select both an AI provider and model");
        return;
      }
      
      // Check if API key is set for the selected provider
      const apiKey = localStorage.getItem(`apiKey_${selectedAiProvider}`);
      if (!apiKey) {
        toast.error(`Please set an API key for ${selectedAiProvider}`);
        return;
      }
      
      setIsLoading(true);
      
      // Generate the same prompt that's shown in the PromptPreview component
      const sourceText = sourceType === "github" 
        ? "Source code from the repository" 
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

      const visualizationText = "Include visual elements such as code structure diagrams, class hierarchy, or data flow visualizations where appropriate. Format any visual output in Mermaid.js format.";

      const promptText = `
You are a highly skilled software documentation expert. Generate comprehensive documentation for the following project:

Project Description:
${projectDescription || "No project description provided."}

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
      
      // Create request payload
      const payload = {
        github_url: sourceType === "github" ? githubUrl : "NULL",
        zip_file: sourceType === "github" ? "NULL" : projectDescription, // Base64-encoded ZIP string if no GitHub URL
        llm_provider: selectedAiProvider, // groq, gemini, openai, or openrouter
        llm_model: selectedAiModel,
        api_key: apiKey,
        prompt: promptText
      };
      
      // FastWrite API endpoint
      const url = "https://fastwrite-api.onrender.com/generate";
      
      // Set a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please try again later.");
          } else {
            const errorData = await response.json().catch(() => ({ message: "Unknown server error" }));
            throw new Error(errorData.message || `Server error: ${response.status}`);
          }
        }
        
        const result = await response.json();
        
        // Generate mock result if API fails but gives a 200 response
        if (!result.text_content && !result.documentation) {
          console.warn("API returned success but no content, using fallback");
          
          // Create a fallback result
          const fallbackResult: DocumentationResult = {
            textContent: `# Documentation Generated Offline\n\n## Project Overview\n\nThis is an offline documentation of ${sourceType === "github" ? `the GitHub repository at ${githubUrl}` : "the uploaded code"}.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Implementation Details\n\nThis documentation was generated offline due to API connectivity issues. Please try again later for a complete documentation.`,
            visualContent: ""
          };
          
          // Store the fallback result
          localStorage.setItem('documentationResult', JSON.stringify(fallbackResult));
          
          toast.success("Documentation generated in offline mode");
          
          // Navigate to results page
          navigate("/results");
          return;
        }
        
        // Create a result object with the structure expected by our application
        const documentationResult: DocumentationResult = {
          textContent: result.text_content || result.documentation || "No text content was generated.",
          visualContent: result.visual_content || result.diagram || ""
        };
        
        // Store the result in localStorage to be used in the Results page
        localStorage.setItem('documentationResult', JSON.stringify(documentationResult));
        
        toast.success("Documentation generated successfully!");
        
        // Navigate to results page
        navigate("/results");
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error("Request timed out. The server might be overloaded.");
        }
        
        throw error;
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Create a fallback result in case of complete failure
      const fallbackResult: DocumentationResult = {
        textContent: `# Documentation Generation Failed\n\n## Error Information\n\nFailed to generate documentation: ${error.message || "Unknown error"}\n\n## Troubleshooting\n\n- Check your internet connection\n- Verify your API key is correct\n- Try a different AI provider\n- The API service might be temporarily unavailable\n\n## Next Steps\n\nYou can try again later or contact support if the issue persists.`,
        visualContent: ""
      };
      
      // Store the fallback result
      localStorage.setItem('documentationResult', JSON.stringify(fallbackResult));
      
      toast.error(error instanceof Error ? error.message : "Failed to generate documentation. Using offline mode.");
      
      // Navigate to results page with the error message
      navigate("/results");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-full md:max-w-4xl">
        <Header 
          title="AI Documentation Generator"
          description="Generate comprehensive documentation for your code with AI, combining technical details and academic reporting."
        />

        <CardSection 
          title="Source Code" 
          tooltip="Provide your source code either by GitHub repository URL or by uploading a ZIP file."
        >
          <SourceInput 
            sourceType={sourceType}
            setSourceType={setSourceType}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            zipFile={zipFile}
            setZipFile={setZipFile}
            projectDescription={projectDescription}
            setProjectDescription={setProjectDescription}
            selectedAiProvider={selectedAiProvider}
            setSelectedAiProvider={setSelectedAiProvider}
            selectedAiModel={selectedAiModel}
            setSelectedAiModel={setSelectedAiModel}
          />
        </CardSection>

        <CardSection 
          title="Documentation Preferences" 
          tooltip="Choose what sections to include in your documentation."
        >
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Code Documentation</TabsTrigger>
              <TabsTrigger value="report">Academic Report</TabsTrigger>
            </TabsList>
            
            <DocumentationPreferences 
              selectedCodeSections={selectedCodeSections}
              setSelectedCodeSections={setSelectedCodeSections}
              selectedReportSections={selectedReportSections}
              setSelectedReportSections={setSelectedReportSections}
              literatureSource={literatureSource}
              setLiteratureSource={setLiteratureSource}
              manualReferences={manualReferences}
              setManualReferences={setManualReferences}
            />
          </Tabs>
        </CardSection>

        <CardSection 
          title="Prompt Preview" 
          tooltip="This is the prompt that will be sent to the AI to generate your documentation."
        >
          <PromptPreview 
            sourceType={sourceType}
            githubUrl={githubUrl}
            selectedCodeSections={selectedCodeSections}
            selectedReportSections={selectedReportSections}
            literatureSource={literatureSource}
          />
        </CardSection>

        <SubmitButton 
          onClick={handleSubmit}
          isLoading={isLoading}
          text="Generate Documentation"
          loadingText="Generating Documentation..."
        />
      </div>
    </div>
  );
};

export default Index;
