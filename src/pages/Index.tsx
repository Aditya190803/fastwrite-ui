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
import { storage } from "@/lib/storage";
import { getArxivReferencesForProject } from "@/lib/arxiv";
import Confetti from 'react-confetti';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";


const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sourceType, setSourceType] = useState<"github" | "zip">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
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
  const [interruptedSession, setInterruptedSession] = useState(false);
  const [requestQueue, setRequestQueue] = useState<number>(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
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
    const loadSavedFormData = async () => {
      try {
        const formData = await storage.get<any>(STORAGE_KEYS.FORM_DATA);
        if (formData) {
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

    // Check for interrupted session
    const checkInterrupted = async () => {
      const inProgress = await storage.get<string>(STORAGE_KEYS.GENERATION_IN_PROGRESS);
      if (inProgress === "true") {
        setInterruptedSession(true);
        const steps = await storage.get<ProgressStep[]>(STORAGE_KEYS.PROGRESS_STATE);
        if (steps) {
          try {
            setProgressSteps(steps);
          } catch (e) {
            console.error("Failed to restore progress steps", e);
          }
        }
      }
    };
    
    checkInterrupted();
  }, []);

  useEffect(() => {
    const saveFormData = async () => {
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
        
        await storage.set(STORAGE_KEYS.FORM_DATA, formData);
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
    setProgressSteps((prev) => {
      const newSteps = prev.map((step) => (step.id === stepId ? { ...step, status } : step));
      storage.set(STORAGE_KEYS.PROGRESS_STATE, newSteps).catch(console.error);
      return newSteps;
    });
    if (status === "in-progress") {
      setCurrentStep(stepId);
    }
  };

  const resetProgress = () => {
    const freshSteps = [...GENERATION_STEPS].map(s => ({ ...s, status: "not-started" as const }));
    setProgressSteps(freshSteps);
    storage.set(STORAGE_KEYS.PROGRESS_STATE, freshSteps).catch(console.error);
    setCurrentStep("");
  };

  const handleApplyTemplate = (codeSections: string[], reportSections: string[]) => {
    setSelectedCodeSections(codeSections);
    setSelectedReportSections(reportSections);
  };

  const handleSubmit = async () => {
    if (isLoading) {
      setRequestQueue(prev => prev + 1);
      toast.info("Request added to queue.");
      return;
    }

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
      
      // Validate custom model has an actual ID entered
      if (selectedAiModel.startsWith("custom:") && selectedAiModel === "custom:") {
        toast.error("Please enter a custom model ID");
        return;
      }
      
      const apiKey = await storage.get<string>(`apiKey_${selectedAiProvider}`);
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
      setInterruptedSession(false);
      await storage.set(STORAGE_KEYS.GENERATION_IN_PROGRESS, "true");
      
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
      const githubToken = await storage.get<string>(STORAGE_KEYS.GITHUB_TOKEN) || undefined;
      
      // Extract actual model ID from custom format if needed
      const actualModelId = selectedAiModel.startsWith("custom:") 
        ? selectedAiModel.replace("custom:", "") 
        : selectedAiModel;
      
      const payload = {
        github_url: sourceType === "github" ? githubUrl : "NULL",
        zip_file: sourceType === "zip" ? zipFileData : "NULL",
        llm_provider: selectedAiProvider,
        llm_model: actualModelId,
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
          
          await storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, fallbackResult);
          
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
        
        await storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, documentationResult);
        
        const generationMetadata = {
          provider: selectedAiProvider,
          model: selectedAiModel,
          prompt: promptText,
          generatedAt: Date.now(),
          sourceType,
          sourceName,
        };
        await storage.set(STORAGE_KEYS.GENERATION_META, generationMetadata);

        // Save to history
        await saveToHistory(documentationResult, sourceType, sourceName, selectedAiProvider, selectedAiModel);
        
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

      await storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, fallbackResult);

      setGenerationError(errorMessage);
      toast.error(errorMessage === "Unknown error" ? "Failed to generate documentation." : errorMessage);

      // Don't navigate on error, show in current page
      // navigate("/results");
    } finally {
      setIsLoading(false);
      await storage.remove(STORAGE_KEYS.GENERATION_IN_PROGRESS);
      await storage.remove(STORAGE_KEYS.PROGRESS_STATE);
      
      if (requestQueue > 0) {
        setRequestQueue(prev => prev - 1);
        setTimeout(() => handleSubmit(), 500);
      }
    }
  };

  return (
    <div className="relative overflow-x-clip">
      {runConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          onConfettiComplete={() => setRunConfetti(false)}
        />
      )}
      
      <Header 
        title="HYPER"
        description="DOCUMENTATION_GEN_CORE"
      />

      <div className="max-w-[1400px] mx-auto px-10 mt-12">
        {generationError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 rounded-none industrial-border">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="flex flex-col gap-2 ml-4">
                <span className="font-heading text-sm uppercase tracking-widest font-black italic">GENERATION_FAILURE</span>
                <AlertDescription className="font-mono text-xs uppercase tracking-widest leading-relaxed text-red-400">
                  {generationError}
                </AlertDescription>
                <Button 
                  onClick={() => setGenerationError(null)}
                  variant="ghost"
                  className="w-fit h-auto p-0 text-[10px] uppercase font-mono tracking-widest hover:bg-transparent hover:text-white"
                >
                  DISMISS_TRACE
                </Button>
              </div>
            </Alert>
          </motion.div>
        )}

        {interruptedSession && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 p-8 industrial-border border-primary/40 bg-primary/5 flex flex-col md:flex-row justify-between items-center gap-8 group"
          >
            <div className="flex gap-6 items-center">
              <div className="w-12 h-12 flex items-center justify-center border border-primary/40 bg-primary/10">
                <Activity className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-primary uppercase tracking-[0.4em]">SESSION_INTERRUPTED_0x8F</div>
                <p className="text-xs text-white/80 uppercase tracking-widest leading-relaxed">
                  A previous generation process was interrupted by a browser refresh.
                </p>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button 
                onClick={async () => {
                  setInterruptedSession(false);
                  await storage.remove(STORAGE_KEYS.GENERATION_IN_PROGRESS);
                  await storage.remove(STORAGE_KEYS.PROGRESS_STATE);
                }}
                variant="outline"
                className="flex-1 md:flex-none border-white/10 text-[10px] uppercase font-mono tracking-widest rounded-none h-12 px-8 hover:bg-white/5"
              >
                DISCARD
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 md:flex-none bg-primary text-black text-[10px] uppercase font-mono font-bold tracking-widest rounded-none h-12 px-8 industrial-border"
              >
                RESUME_SESSION
              </Button>
            </div>
          </motion.div>
        )}

        {/* Engineering markers */}
        <div className="flex justify-between mb-8 opacity-20 pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 industrial-border" />
            <span className="text-[10px] font-mono tracking-widest uppercase">COORD_X_0.231</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono tracking-widest uppercase">ZONE_B</span>
            <div className="w-4 h-4 industrial-border" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
          {/* Main Form Area */}
          <div className="flex-1 space-y-16">
            <CardSection 
              title="INGESTION" 
              tooltip="Provide source code via GitHub URL or secure ZIP upload. All data remains in memory."
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
              title="SCHEMA" 
              tooltip="Define the scope of documentation and academic analysis. Multi-layer configuration."
            >
              <div className="mb-16">
                <TemplateSelector
                  selectedCodeSections={selectedCodeSections}
                  selectedReportSections={selectedReportSections}
                  onApplyTemplate={handleApplyTemplate}
                />
              </div>
              <Tabs defaultValue="code" className="w-full">
                <TabsList className="bg-white/[0.02] border border-white/5 p-1 mb-10 inline-flex h-14 w-full sm:w-auto rounded-none">
                  <TabsTrigger 
                    value="code" 
                    className="px-10 data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-xs tracking-widest rounded-none transition-all flex items-center gap-3 italic"
                  >
                    <div className="w-1 h-4 bg-current" />
                    TECHNICAL_SPEC
                  </TabsTrigger>
                  <TabsTrigger 
                    value="report" 
                    className="px-10 data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-xs tracking-widest rounded-none transition-all flex items-center gap-3 italic"
                  >
                    <div className="w-1 h-4 bg-current" />
                    INTEL_REPORT
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
                queueCount={requestQueue}
              />
            </div>
          </div>

          {/* Side Info / Preview Area - Fixed on desktop */}
          <div className="w-full lg:w-[400px] space-y-8 lg:pt-0 lg:sticky lg:top-24 lg:self-start">
            <CardSection 
              title="TELEMETRY" 
              tooltip="Real-time construction of the documentation prompt. Live protocol stream."
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary/40 p-8 industrial-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono text-primary uppercase tracking-[0.5em]">PROCESS_ACTIVE</span>
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-100" />
                    <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-200" />
                  </div>
                </div>
                <GenerationProgress steps={progressSteps} currentStep={currentStep} />
                
                <div className="mt-8 pt-6 border-t border-primary/20 flex justify-between items-center">
                   <span className="text-[10px] font-mono text-primary/40 uppercase">Memory: 512MB Buffer</span>
                   {requestQueue > 0 && (
                     <span className="text-[10px] font-mono text-primary animate-pulse uppercase tracking-widest">
                       Queue: {requestQueue} Pending
                     </span>
                   )}
                   <span className="text-[10px] font-mono text-primary/40 uppercase">Latency: 42ms</span>
                </div>
              </motion.div>
            )}

            {!projectDescription && !isLoading && (
              <div className="p-8 industrial-border border-yellow-500/30 bg-yellow-500/5 flex gap-6 items-start overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 opacity-5 font-mono text-[60px] leading-none pointer-events-none select-none italic font-black">!</div>
                <AlertTriangle className="h-6 w-6 text-yellow-500 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="space-y-3 relative z-10">
                  <div className="text-[10px] font-mono text-yellow-500 uppercase tracking-[0.4em]">INIT_WARNING_0x2</div>
                  <p className="text-xs text-muted-foreground leading-relaxed uppercase tracking-wider">
                    Context required. Missing project description disrupts semantic mapping.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Baseline Footer Visualization */}
      <div className="mt-20 border-t border-white/5 py-8 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
           <div className="space-y-4">
              <div className="font-heading font-black text-3xl md:text-5xl text-white/20 uppercase select-none tracking-tighter leading-none">
                FASTWRITE
              </div>
              <div className="flex gap-1">
                 {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="w-4 h-1 bg-primary/20" />)}
              </div>
           </div>

           {/* Footer Links */}
           <div className="flex flex-wrap gap-8 md:gap-12">
             <div className="space-y-3">
               <span className="text-[9px] font-mono text-primary uppercase tracking-[0.4em] font-bold">NAVIGATION</span>
               <div className="flex flex-col gap-2">
                 <a href="/" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">Home</a>
                 <a href="/results" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">Results</a>
               </div>
             </div>
             <div className="space-y-3">
               <span className="text-[9px] font-mono text-primary uppercase tracking-[0.4em] font-bold">RESOURCES</span>
               <div className="flex flex-col gap-2">
                 <a href="https://github.com/aditya190803/fastwrite-ui" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">GitHub</a>
                 <a href="https://fastwrite.kjsieit.com/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">Documentation</a>
               </div>
             </div>
             <div className="space-y-3">
               <span className="text-[9px] font-mono text-primary uppercase tracking-[0.4em] font-bold">LEGAL</span>
               <div className="flex flex-col gap-2">
                 <a href="/privacy" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">Privacy</a>
                 <a href="/terms" className="text-[10px] font-mono text-white/60 uppercase tracking-widest hover:text-primary transition-colors">Terms</a>
               </div>
             </div>
           </div>
           
           <div className="font-mono text-[8px] text-white/50 uppercase tracking-[0.3em] flex flex-col gap-2">
             <div className="flex justify-between gap-12 border-b border-white/10 pb-1">
                <span>TIME</span>
                <span className="text-white/80">{new Date().toISOString().split('T')[1].split('.')[0]}</span>
             </div>
             <div className="flex justify-between gap-12 border-b border-white/10 pb-1">
                <span>STATUS</span>
                <span className="text-primary/90">READY</span>
             </div>
             <div className="flex justify-between gap-12 pt-2">
                <span>© 2026</span>
                <span className="text-white/80">FASTWRITE</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
