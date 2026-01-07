import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { SourceInput } from "@/components/SourceInput";
import { DocumentationPreferences } from "@/components/DocumentationPreferences";
import { PromptPreview } from "@/components/PromptPreview";
import { Header } from "@/components/Header";
import { CardSection } from "@/components/CardSection";
import { SubmitButton } from "@/components/SubmitButton";
import { TemplateSelector } from "@/components/TemplateSelector";
import { GenerationProgress } from "@/components/shared/GenerationProgress";
import { DocumentationResult, ProgressStep, GENERATION_STEPS, GenerateResponseSchema } from "@/types/documentation";
import { cleanGeneratedText } from "@/lib/documentation";
import { generateDocumentationPrompt } from "@/lib/prompts";
import { API_CONFIG, STORAGE_KEYS } from "@/lib/constants";
import { saveToHistory } from "@/components/results/HistoryPanel";
import { getArxivReferencesForProject } from "@/lib/arxiv";
import Confetti from 'react-confetti';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sourceType, setSourceType] = useState<"github" | "zip">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubBranch, setGithubBranch] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([...GENERATION_STEPS]);
  const [currentStep, setCurrentStep] = useState<string>("");
  
  const [selectedAiProvider, setSelectedAiProvider] = useState<string>("google");
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");

  const [selectedCodeSections, setSelectedCodeSections] = useState<string[]>([
    
  ]);
  
  const [selectedReportSections, setSelectedReportSections] = useState<string[]>([
    "overview",
    "features",
    "architecture"
  ]);
  
  const [literatureSource, setLiteratureSource] = useState<"auto" | "manual">("auto");
  const [manualReferences, setManualReferences] = useState("");
  
  // Only show confetti once per session
  const [runConfetti, setRunConfetti] = useState(() => {
    const hasShown = sessionStorage.getItem(STORAGE_KEYS.CONFETTI_SHOWN);
    return !hasShown;
  });

  // Mark confetti as shown when it runs
  useEffect(() => {
    if (runConfetti) {
      sessionStorage.setItem(STORAGE_KEYS.CONFETTI_SHOWN, "true");
    }
  }, [runConfetti]);

  useEffect(() => {
    const loadSavedFormData = () => {
      try {
        const savedFormData = sessionStorage.getItem(STORAGE_KEYS.FORM_DATA);
        if (savedFormData) {
          const formData = JSON.parse(savedFormData);
          
          if (formData.sourceType) setSourceType(formData.sourceType);
          if (formData.githubUrl) setGithubUrl(formData.githubUrl);
          if (formData.githubBranch) setGithubBranch(formData.githubBranch);
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

  useEffect(() => {
    const saveFormData = () => {
      try {
        const formData = {
          sourceType,
          githubUrl,
          githubBranch,
          projectDescription,
          selectedAiProvider,
          selectedAiModel,
          selectedCodeSections,
          selectedReportSections,
          literatureSource,
          manualReferences
        };
        
        sessionStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
      } catch (error) {
        console.error("Error saving form data:", error);
      }
    };

    saveFormData();
  }, [
    sourceType,
    githubUrl,
    githubBranch,
    projectDescription,
    selectedAiProvider,
    selectedAiModel,
    selectedCodeSections,
    selectedReportSections,
    literatureSource,
    manualReferences
  ]);

  const updateStepStatus = (stepId: string, status: ProgressStep["status"]) => {
    setProgressSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    );
    if (status === "in-progress") {
      setCurrentStep(stepId);
    }
  };

  const resetProgress = () => {
    setProgressSteps([...GENERATION_STEPS]);
    setCurrentStep("");
  };

  const handleApplyTemplate = (codeSections: string[], reportSections: string[]) => {
    setSelectedCodeSections(codeSections);
    setSelectedReportSections(reportSections);
  };

  const handleSubmit = async () => {
    try {
      if (sourceType === "github" && !githubUrl) {
        toast.error("Please enter a GitHub repository URL");
        return;
      }
      
      if (sourceType === "zip" && !zipFile) {
        toast.error("Please upload a ZIP file");
        return;
      }

      // Validate ZIP file size (max 100MB)
      if (sourceType === "zip" && zipFile && zipFile.size > API_CONFIG.MAX_ZIP_SIZE_MB * 1024 * 1024) {
        toast.error(`ZIP file size exceeds ${API_CONFIG.MAX_ZIP_SIZE_MB}MB limit. Please upload a smaller file.`);
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
      
      const apiKey = localStorage.getItem(`apiKey_${selectedAiProvider}`);
      if (!apiKey) {
        toast.error(`Please set an API key for ${selectedAiProvider}`);
        return;
      }

      // Warn if project description is empty but don't block
      if (!projectDescription.trim()) {
        toast.warning("Adding a project description helps generate better documentation", {
          duration: 4000,
        });
      }
      
      setIsLoading(true);
      resetProgress();
      updateStepStatus("validate", "in-progress");
      
      // Convert ZIP file to Base64 if sourceType is "zip"
      let zipFileData: string | null = null;
      if (sourceType === "zip" && zipFile) {
        zipFileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Extract base64 part (remove data:application/zip;base64, prefix)
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(zipFile);
        });
      }

      updateStepStatus("validate", "completed");
      updateStepStatus("analyze", "in-progress");
      
      // Search arXiv if literature_survey is selected with auto mode
      let arxivReferences: string | undefined;
      const shouldSearchArxiv = 
        selectedReportSections.includes("literature_survey") && 
        literatureSource === "auto";
      
      // Complete analyze step before moving to literature
      updateStepStatus("analyze", "completed");
      
      if (shouldSearchArxiv) {
        updateStepStatus("literature", "in-progress");
        
        try {
          const arxivResult = await getArxivReferencesForProject(
            sourceType === "github" ? githubUrl : undefined,
            projectDescription,
            5 // max 5 papers
          );
          
          arxivReferences = arxivResult.formattedText;
          
          if (arxivResult.papers.length > 0) {
            toast.success(`Found ${arxivResult.papers.length} relevant papers on arXiv`);
          } else {
            toast.info("No papers found on arXiv. AI will search based on topic.");
          }
        } catch (error) {
          console.warn("arXiv search failed:", error);
          toast.warning("Could not search arXiv. Continuing without literature references.");
        }
        
        updateStepStatus("literature", "completed");
      } else {
        // Skip literature step if not needed
        updateStepStatus("literature", "completed");
      }
      
      // Generate prompt using the centralized module
      const promptText = generateDocumentationPrompt({
        sourceType,
        githubUrl,
        projectDescription,
        selectedCodeSections,
        selectedReportSections,
        literatureSource,
        manualReferences: literatureSource === "manual" ? manualReferences : undefined,
        arxivReferences,
        branch: githubBranch || undefined,
      });

      // Get GitHub token if available
      const githubToken = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || undefined;
      
      const payload = {
        github_url: sourceType === "github" ? githubUrl : "NULL",
        zip_file: sourceType === "zip" ? zipFileData : "NULL",
        llm_provider: selectedAiProvider,
        llm_model: selectedAiModel,
        api_key: apiKey,
        prompt: promptText,
        ...(githubToken && { github_token: githubToken }),
        ...(githubBranch && { branch: githubBranch }),
        ...(literatureSource === "manual" && manualReferences && { manual_references: manualReferences }),
      };
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.GENERATE_ENDPOINT}`;
      const REQUEST_TIMEOUT_MS = API_CONFIG.REQUEST_TIMEOUT_MS;
      const MAX_RETRIES = API_CONFIG.MAX_RETRIES;

      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      updateStepStatus("generate", "in-progress");

      const sendGenerateRequest = async (attempt = 0): Promise<unknown> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!response.ok) {
            const isRateLimited = response.status === 429;
            const isServerError = response.status >= 500 && response.status < 600;
            const errorData = await response.json().catch(() => ({ message: "Unknown server error" }));
            const message = isRateLimited
              ? "Rate limit exceeded. Please try again later."
              : errorData.message || `Server error: ${response.status}`;

            if (isServerError && attempt < MAX_RETRIES) {
              console.warn(`Generate request failed with ${response.status}. Retrying…`);
              toast.info("The server hiccupped. Trying again…");
              await sleep(API_CONFIG.RETRY_DELAY_MS);
              return sendGenerateRequest(attempt + 1);
            }

            throw new Error(message);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          const shouldRetry = attempt < MAX_RETRIES;

          if (error instanceof Error && error.name === "AbortError") {
            if (shouldRetry) {
              console.warn("Generate request timed out. Retrying…");
              toast.info("Request timed out. Retrying…");
              await sleep(API_CONFIG.RETRY_DELAY_MS);
              return sendGenerateRequest(attempt + 1);
            }
            throw new Error("Request timed out. The server might be overloaded.");
          }

          if (shouldRetry) {
            console.warn("Generate request failed. Retrying…", error);
            toast.info("Temporary issue detected. Trying again…");
            await sleep(API_CONFIG.RETRY_DELAY_MS);
            return sendGenerateRequest(attempt + 1);
          }

          throw error instanceof Error ? error : new Error("Failed to contact the documentation service.");
        } finally {
          clearTimeout(timeoutId);
        }
      };

      const rawResult = await sendGenerateRequest();
      
      // Validate API response using Zod
      const parseResult = GenerateResponseSchema.safeParse(rawResult);
      if (!parseResult.success) {
        console.warn("API response validation failed:", parseResult.error);
      }
      const result = parseResult.success ? parseResult.data : (rawResult as { text_content?: string; documentation?: string; visual_content?: string; diagram?: string });

      updateStepStatus("generate", "completed");
      updateStepStatus("diagrams", "in-progress");

      if (!result.text_content && !result.documentation) {
          console.warn("API returned success but no content, using fallback");
          updateStepStatus("diagrams", "completed");
          updateStepStatus("finalize", "in-progress");
          
          const fallbackResult: DocumentationResult = {
            textContent: `# Documentation Generated Offline\n\n## Project Overview\n\nThis is an offline documentation of ${sourceType === "github" ? `the GitHub repository at ${githubUrl}` : "the uploaded code"}.\n\n## Features\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n## Implementation Details\n\nThis documentation was generated offline due to API connectivity issues. Please try again later for a complete documentation.`,
            visualContent: "",
            generatedAt: Date.now(),
            sourceType,
            sourceName: sourceType === "github" ? githubUrl : zipFile?.name || "unknown",
          };
          
          localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(fallbackResult));
          
          updateStepStatus("finalize", "completed");
          toast.success("Documentation generated in offline mode");
          
          navigate("/results");
          return;
        }
        updateStepStatus("diagrams", "completed");
        updateStepStatus("finalize", "in-progress");

        const cleanedText = cleanGeneratedText(result.text_content || result.documentation || "");

        const sourceName = sourceType === "github" ? githubUrl : (zipFile?.name || "uploaded.zip");
        
        const documentationResult: DocumentationResult = {
          textContent: cleanedText || "No text content was generated.",
          visualContent: result.visual_content || result.diagram || "",
          generatedAt: Date.now(),
          sourceType,
          sourceName,
        };
        
        localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(documentationResult));
        
        const generationMetadata = {
          provider: selectedAiProvider,
          model: selectedAiModel,
          prompt: promptText,
          generatedAt: Date.now(),
          sourceType,
          sourceName,
        };
        localStorage.setItem(STORAGE_KEYS.GENERATION_META, JSON.stringify(generationMetadata));

        // Save to history
        saveToHistory(documentationResult, sourceType, sourceName, selectedAiProvider, selectedAiModel);
        
        updateStepStatus("finalize", "completed");
        toast.success("Documentation generated successfully!");
        
        navigate("/results");
      
    } catch (error) {
      console.error("Error submitting form:", error);
      
      // Mark current step as error
      setProgressSteps((prev) =>
        prev.map((step) =>
          step.status === "in-progress" ? { ...step, status: "error" as const } : step
        )
      );

      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const fallbackText = `# Documentation Generation Failed\n\n## Error Information\n\nFailed to generate documentation: ${errorMessage}\n\n## Troubleshooting\n\n- Check your internet connection\n- Verify your API key is correct\n- Try a different AI provider\n- The API service might be temporarily unavailable\n\n## Next Steps\n\nYou can try again later or contact support if the issue persists.`;

      const fallbackResult: DocumentationResult = {
        textContent: cleanGeneratedText(fallbackText) || fallbackText,
        visualContent: "",
        generatedAt: Date.now(),
        sourceType,
        sourceName: sourceType === "github" ? githubUrl : (zipFile?.name || "unknown"),
      };

      localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(fallbackResult));

      toast.error(errorMessage === "Unknown error" ? "Failed to generate documentation. Using offline mode." : errorMessage);

      navigate("/results");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 relative overflow-x-hidden">
      {runConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          onConfettiComplete={() => setRunConfetti(false)}
        />
      )}
      
      <Header 
        title="WRITE"
        description="DOCUMENTATION"
      />

      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Form Area */}
          <div className="flex-1 space-y-24">
            <CardSection 
              title="SOURCE" 
              tooltip="Provide source code via GitHub URL or secure ZIP upload."
            >
              <SourceInput 
                sourceType={sourceType}
                setSourceType={setSourceType}
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                githubBranch={githubBranch}
                setGithubBranch={setGithubBranch}
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
              title="CONFIG" 
              tooltip="Define the scope of documentation and academic analysis."
            >
              <div className="mb-12">
                <TemplateSelector
                  selectedCodeSections={selectedCodeSections}
                  selectedReportSections={selectedReportSections}
                  onApplyTemplate={handleApplyTemplate}
                />
              </div>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="bg-black border border-white/5 p-1 mb-8 inline-flex h-12 w-full sm:w-auto rounded-none">
                  <TabsTrigger 
                    value="code" 
                    className="px-8 data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest rounded-none transition-all flex items-center gap-2"
                  >
                    <div className="w-1 h-3 bg-current" />
                    TECHNICAL
                  </TabsTrigger>
                  <TabsTrigger 
                    value="report" 
                    className="px-8 data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest rounded-none transition-all flex items-center gap-2"
                  >
                    <div className="w-1 h-3 bg-current" />
                    REPORT
                  </TabsTrigger>
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

            <div className="pt-8">
              <SubmitButton 
                onClick={handleSubmit}
                isLoading={isLoading}
                text="GENERATE"
                loadingText="WRITING..."
              />
            </div>
          </div>

          {/* Side Info / Preview Area */}
          <div className="w-full lg:w-96 space-y-12">
            <CardSection 
              title="PREVIEW" 
              tooltip="Real-time construction of the documentation prompt."
              collapsibleOnMobile
            >
              <PromptPreview 
                sourceType={sourceType}
                githubUrl={githubUrl}
                selectedCodeSections={selectedCodeSections}
                selectedReportSections={selectedReportSections}
                literatureSource={literatureSource}
              />
            </CardSection>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono text-primary uppercase">WORKING</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-primary animate-ping" />
                    <div className="w-1 h-1 bg-primary animate-ping delay-75" />
                    <div className="w-1 h-1 bg-primary animate-ping delay-150" />
                  </div>
                </div>
                <GenerationProgress steps={progressSteps} currentStep={currentStep} />
              </motion.div>
            )}

            {!projectDescription && !isLoading && (
              <div className="p-6 border border-yellow-500/20 bg-yellow-500/5 flex gap-4 items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-yellow-500 uppercase">WARNING</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Missing project description. Context improves results.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Baseline Footer Visualization */}
      <div className="mt-32 border-t border-white/5 py-12 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <div className="font-heading font-black text-4xl md:text-6xl text-white/5 uppercase select-none tracking-tighter leading-none">
                FASTWRITE
              </div>
              <div className="flex gap-1">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-4 h-1 bg-primary/20" />)}
              </div>
           </div>
           
           <div className="font-mono text-[8px] text-white/20 uppercase tracking-[0.3em] flex flex-col gap-2">
             <div className="flex justify-between gap-12 border-b border-white/5 pb-1">
                <span>TIME</span>
                <span className="text-white/40">{new Date().toISOString().split('T')[1].split('.')[0]}</span>
             </div>
             <div className="flex justify-between gap-12 border-b border-white/5 pb-1">
                <span>STATUS</span>
                <span className="text-primary/60">READY</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
