
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
import { Key } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string, model: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
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
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4o">GPT-4o</option>
                </>
              )}
              {selectedProvider === "google" && (
                <>
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="gemini-ultra">Gemini Ultra</option>
                </>
              )}
              {selectedProvider === "groq" && (
                <>
                  <option value="llama-3">Llama 3</option>
                  <option value="mixtral">Mixtral</option>
                </>
              )}
              {selectedProvider === "openrouter" && (
                <>
                  <option value="claude">Claude</option>
                  <option value="mistral">Mistral</option>
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
