
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

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sourceType, setSourceType] = useState<"github" | "zip">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // AI model state
  const [selectedAiProvider, setSelectedAiProvider] = useState<string>("openai");
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

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
      
      setIsLoading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("sourceType", sourceType);
      
      if (sourceType === "github") {
        formData.append("githubUrl", githubUrl);
      } else if (zipFile) {
        formData.append("zipFile", zipFile);
      }
      
      formData.append("projectDescription", projectDescription);
      formData.append("codeSections", JSON.stringify(selectedCodeSections));
      formData.append("reportSections", JSON.stringify(selectedReportSections));
      formData.append("literatureSource", literatureSource);
      formData.append("manualReferences", manualReferences);
      formData.append("aiProvider", selectedAiProvider);
      formData.append("aiModel", selectedAiModel);
      
      // Add API key if provided for the selected provider
      if (apiKeys[selectedAiProvider]) {
        formData.append("apiKey", apiKeys[selectedAiProvider]);
      }
      
      // In a real app, we would send this to the backend
      console.log("Submitting form data:", Object.fromEntries(formData));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Documentation generated successfully!");
      
      // Navigate to results page
      navigate("/results");
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to generate documentation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-4 md:py-8 text-slate-200">
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
            <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6 bg-slate-700">
              <TabsTrigger value="code" className="data-[state=active]:bg-slate-600">Code Documentation</TabsTrigger>
              <TabsTrigger value="report" className="data-[state=active]:bg-slate-600">Academic Report</TabsTrigger>
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
