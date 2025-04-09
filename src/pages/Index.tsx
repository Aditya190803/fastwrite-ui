import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceInput } from "@/components/SourceInput";
import { DocumentationPreferences } from "@/components/DocumentationPreferences";
import { PromptPreview } from "@/components/PromptPreview";
import { InfoIcon } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<"github" | "zip">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("openai");

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
      formData.append("aiModel", selectedAiModel);
      
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Documentation Generator</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Generate comprehensive documentation for your code with AI, combining technical details and academic reporting.
          </p>
        </header>

        <Card className="mb-8 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Source Code</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Provide your source code either by GitHub repository URL or by uploading a ZIP file.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <SourceInput 
              sourceType={sourceType}
              setSourceType={setSourceType}
              githubUrl={githubUrl}
              setGithubUrl={setGithubUrl}
              zipFile={zipFile}
              setZipFile={setZipFile}
              projectDescription={projectDescription}
              setProjectDescription={setProjectDescription}
              selectedAiModel={selectedAiModel}
              setSelectedAiModel={setSelectedAiModel}
            />
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Documentation Preferences</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Choose what sections to include in your documentation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
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
          </CardContent>
        </Card>

        <Card className="mb-8 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Prompt Preview</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-5 w-5 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">This is the prompt that will be sent to the AI to generate your documentation.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <PromptPreview 
              sourceType={sourceType}
              githubUrl={githubUrl}
              selectedCodeSections={selectedCodeSections}
              selectedReportSections={selectedReportSections}
              literatureSource={literatureSource}
            />
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
          >
            {isLoading ? "Generating Documentation..." : "Generate Documentation"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
