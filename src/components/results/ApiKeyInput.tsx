
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Key, ExternalLink } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string, model: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  
  // Load API key from localStorage when component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem(`apiKey_${selectedProvider}`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, [selectedProvider]);

  const handleSubmit = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    
    // Save API key to localStorage for this provider
    localStorage.setItem(`apiKey_${selectedProvider}`, apiKey);
    
    onApiKeySubmit(apiKey, selectedModel);
    toast.success(`API key for ${selectedProvider} stored on your device`);
  };

  // API key provider links
  const providerLinks = {
    openai: "https://platform.openai.com/api-keys",
    google: "https://aistudio.google.com/app/apikey",
    groq: "https://console.groq.com/keys",
    openrouter: "https://openrouter.ai/settings/keys"
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Key className="h-4 w-4" />
          Set API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set API Key</DialogTitle>
          <DialogDescription>
            Enter your API key for the selected provider.
            Your key will be stored locally on your device only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="provider" className="text-sm font-medium">
              Select Provider
            </label>
            <select
              id="provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
              <option value="groq">Groq</option>
              <option value="openrouter">OpenRouter</option>
            </select>
            <a 
              href={providerLinks[selectedProvider as keyof typeof providerLinks]} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              Get API key for {selectedProvider}
            </a>
          </div>
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Key
            </label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full"
              type="password"
            />
            <p className="text-xs text-slate-500">
              Your API key is stored only on your device and never sent to our servers.
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="model" className="text-sm font-medium">
              Select Model
            </label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {selectedProvider === "openai" && (
                <>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-5">GPT-5</option>
                </>
              )}
              {selectedProvider === "google" && (
                <>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                </>
              )}
              {selectedProvider === "groq" && (
                <>
                  <option value="llama-3-8b">Llama 3 (8B)</option>
                  <option value="llama-3-70b">Llama 3 (70B)</option>
                  <option value="mixtral-8x7b">Mixtral 8x7B</option>
                  <option value="groq-1">Groq-1</option>
                </>
              )}
              {selectedProvider === "openrouter" && (
                <>
                  <option value="minimax/minimax-m2:free">Minimax M2</option>
                  <option value="tngtech/deepseek-r1t2-chimera:free">DeepSeek R1T2 Chimera</option>
                  <option value="z-ai/glm-4.5-air:free">GLM 4.5 Air</option>
                  <option value="qwen/qwen3-coder:free">Qwen3 Coder</option>
                </>
              )}
            </select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleSubmit}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
