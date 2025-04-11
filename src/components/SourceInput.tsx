
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, X, Upload, Key } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SourceInputProps {
  sourceType: "github" | "zip";
  setSourceType: (type: "github" | "zip") => void;
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  zipFile: File | null;
  setZipFile: (file: File | null) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  selectedAiProvider: string;
  setSelectedAiProvider: (provider: string) => void;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;
}

export const SourceInput = ({
  sourceType,
  setSourceType,
  githubUrl,
  setGithubUrl,
  zipFile,
  setZipFile,
  projectDescription,
  setProjectDescription,
  selectedAiProvider,
  setSelectedAiProvider,
  selectedAiModel,
  setSelectedAiModel
}: SourceInputProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiModels, setAiModels] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Define available models for each provider
  const providerModels: Record<string, string[]> = {
    "openai": ["GPT-4o", "GPT-4o-mini", "GPT-4-turbo"],
    "google": ["Gemini Pro", "Gemini Ultra", "Gemini Flash"],
    "groq": ["LLama-3-8B", "LLama-3-70B", "Mixtral-8x7B"],
    "openrouter": ["Claude-3-Opus", "Mistral-Large", "Phi-3"]
  };

  // Load API key from localStorage when provider changes
  useEffect(() => {
    if (selectedAiProvider) {
      // Update available models
      setAiModels(providerModels[selectedAiProvider] || []);
      
      // Set the first model as default when changing provider
      if (providerModels[selectedAiProvider]?.length > 0) {
        setSelectedAiModel(providerModels[selectedAiProvider][0]);
      }
      
      // Load API key for this provider from localStorage
      const savedApiKey = localStorage.getItem(`apiKey_${selectedAiProvider}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setApiKey(""); // Clear if no key exists for this provider
      }
    }
  }, [selectedAiProvider, setSelectedAiModel]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        setZipFile(file);
        setSourceType("zip");
      } else {
        toast.error("Please upload a ZIP file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        setZipFile(file);
        setSourceType("zip");
      } else {
        toast.error("Please upload a ZIP file.");
      }
    }
  };

  const handleFileUploadClick = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      // Save API key to localStorage based on provider
      localStorage.setItem(`apiKey_${selectedAiProvider}`, apiKey);
      toast.success(`API key saved for ${selectedAiProvider}`);
      setShowApiKey(false);
    } else {
      toast.error("Please enter a valid API key");
    }
  };

  // Function to check if an API key exists for the current provider
  const hasApiKey = (provider: string) => {
    return !!localStorage.getItem(`apiKey_${provider}`);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Source Type</Label>
        <RadioGroup
          value={sourceType}
          onValueChange={(value) => setSourceType(value as "github" | "zip")}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="github" id="github" />
            <Label htmlFor="github" className="cursor-pointer">GitHub Repository</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="zip" id="zip" />
            <Label htmlFor="zip" className="cursor-pointer">Upload ZIP</Label>
          </div>
        </RadioGroup>
      </div>

      {sourceType === "github" ? (
        <div className="space-y-2">
          <Label htmlFor="github-url">GitHub Repository URL</Label>
          <Input
            id="github-url"
            placeholder="https://github.com/username/repository"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <p className="text-sm text-slate-500">Example: https://github.com/facebook/react</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Upload ZIP File</Label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleFileUploadClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive 
                ? "border-blue-400 bg-blue-50" 
                : zipFile 
                  ? "border-green-400 bg-green-50" 
                  : "border-slate-300 hover:border-slate-400"
            }`}
          >
            {zipFile ? (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-600 truncate max-w-xs">{zipFile.name}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setZipFile(null);
                  }}
                  className="rounded-full h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-slate-400 mx-auto" />
                <p className="text-slate-600">Drag & drop your ZIP file here or click to browse</p>
                <p className="text-sm text-slate-500">Max file size: 50MB</p>
              </div>
            )}
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
              ref={fileInputRef}
            />
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="project-description" className="text-base font-medium">
            Project Description (Optional)
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Provide additional context about your project to help guide the documentation generation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="project-description"
          placeholder="Enter a brief description of your project..."
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="min-h-24"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label htmlFor="ai-provider" className="text-base font-medium">
            AI Provider
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select which AI provider to use for generating documentation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select value={selectedAiProvider} onValueChange={setSelectedAiProvider}>
          <SelectTrigger>
            <SelectValue placeholder="Select AI Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="groq">Groq</SelectItem>
            <SelectItem value="openrouter">OpenRouter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedAiProvider && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="ai-model" className="text-base font-medium">
              AI Model
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Select which model to use from the chosen provider.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select value={selectedAiModel} onValueChange={setSelectedAiModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {aiModels.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedAiProvider && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="api-key" className="text-base font-medium">
              API Key for {selectedAiProvider}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Your API key will be stored locally on your device and never sent to our servers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {showApiKey ? (
            <div className="space-y-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${selectedAiProvider} API key`}
                className="font-mono"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowApiKey(false)}
                  className="w-1/2"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApiKeySave}
                  className="w-1/2"
                >
                  Save API Key
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant={hasApiKey(selectedAiProvider) ? "outline" : "default"}
              size="sm" 
              onClick={() => setShowApiKey(true)}
              className="flex items-center gap-1 w-full"
            >
              <Key className="h-4 w-4" />
              {hasApiKey(selectedAiProvider) ? "Update API Key" : "Set API Key"}
            </Button>
          )}
          {hasApiKey(selectedAiProvider) && !showApiKey && (
            <p className="text-sm text-green-600">API key for {selectedAiProvider} is set and stored locally</p>
          )}
        </div>
      )}
    </div>
  );
};
