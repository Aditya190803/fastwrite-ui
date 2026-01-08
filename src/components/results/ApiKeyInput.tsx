
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
import { Key, ExternalLink, ShieldCheck, Cpu, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string, model: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4-turbo");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  
  useEffect(() => {
    const loadKey = async () => {
      const savedApiKey = await storage.get<string>(`apiKey_${selectedProvider}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
      } else {
        setApiKey("");
      }
    };
    loadKey();
  }, [selectedProvider]);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      toast.error("API Key required");
      return;
    }
    
    await storage.set(`apiKey_${selectedProvider}`, apiKey);
    onApiKeySubmit(apiKey, selectedModel);
    toast.success("API Key saved");
  };

  const providerLinks = {
    openai: "https://platform.openai.com/api-keys",
    google: "https://aistudio.google.com/app/apikey",
    groq: "https://console.groq.com/keys",
    openrouter: "https://openrouter.ai/settings/keys"
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 rounded-none border-white/10 hover:border-primary/40 bg-zinc-950 hover:bg-primary/5 text-[10px] font-mono uppercase tracking-[0.2em] px-4 group relative"
        >
          <Key className="h-3 w-3 mr-2 group-hover:scale-110 transition-transform" />
          API KEY
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-white/10 rounded-none p-10 max-w-md overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl pointer-events-none" />
        
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-7 bg-primary" />
            <DialogTitle className="font-heading uppercase text-2xl font-black tracking-tighter text-white">SETTINGS</DialogTitle>
          </div>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
            Enter your API keys to enable generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 my-8 relative">
          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-primary/60 flex items-center gap-2">
              <Globe size={10} />
              PROVIDER
            </Label>
            <select
              id="provider"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-none h-12 px-4 font-mono text-xs uppercase text-white focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
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
              className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-primary/40 hover:text-primary transition-colors mt-2"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              GET KEY
            </a>
          </div>

          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-primary/60 flex items-center gap-2">
              <ShieldCheck size={10} />
              API KEY
            </Label>
            <div className="relative group/input">
              <Input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="SK-********************"
                className="bg-black border-white/10 h-12 rounded-none font-mono text-sm tracking-widest uppercase focus-visible:ring-0 focus-visible:border-primary/40 pl-4"
              />
              <div className="absolute top-0 left-0 w-[1px] h-full bg-primary/20 group-focus-within/input:bg-primary transition-colors" />
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/20">
              LOCAL
            </p>
          </div>

          <div className="space-y-3">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-primary/60 flex items-center gap-2">
              <Cpu size={10} />
              MODEL
            </Label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-none h-12 px-4 font-mono text-xs uppercase text-white focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
            >
              {selectedProvider === "openai" && (
                <>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o mini</option>
                  <option value="gpt-5">GPT-5</option>
                </>
              )}
              {selectedProvider === "google" && (
                <>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                </>
              )}
              {selectedProvider === "groq" && (
                <>
                  <option value="llama-3-8b">Llama 3 8B</option>
                  <option value="llama-3-70b">Llama 3 70B</option>
                  <option value="mixtral-8x7b">Mixtral 8x7B</option>
                </>
              )}
              {selectedProvider === "openrouter" && (
                <>
                  <option value="minimax/minimax-m2:free">MiniMax M2</option>
                  <option value="tngtech/deepseek-r1t2-chimera:free">DeepSeek</option>
                </>
              )}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-4">
           <DialogClose asChild>
             <Button variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest px-8">Cancel</Button>
           </DialogClose>
           <Button onClick={handleSubmit} className="rounded-none bg-primary text-black font-heading font-black tracking-widest uppercase text-xs px-10 h-12">Save</Button>
        </DialogFooter>
        
        {/* Bottom indicator */}
        <div className="mt-8 flex items-center gap-4 opacity-20">
           <div className="flex-1 h-[1px] bg-white/40" />
           <div className="font-mono text-[8px] uppercase tracking-[0.3em]">Encrypted</div>
           <div className="flex-1 h-[1px] bg-white/40" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyInput;
