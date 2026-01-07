import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, X, Upload, Key, ExternalLink, AlertTriangle, CheckCircle2, Loader2, Github, Cpu, Database, Network } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateZipFile, ZipValidationResult } from "@/lib/zipValidation";
import { STORAGE_KEYS, AI_PROVIDERS, getProviderById, getProviderModels } from "@/lib/constants";

interface SourceInputProps {
  sourceType: "github" | "zip";
  setSourceType: (type: "github" | "zip") => void;
  githubUrl: string;
  setGithubUrl: (url: string) => void;
  githubBranch?: string;
  setGithubBranch?: (branch: string) => void;
  zipFile: File | null;
  setZipFile: (file: File | null) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  selectedAiProvider: string;
  setSelectedAiProvider: (provider: string) => void;
  selectedAiModel: string;
  setSelectedAiModel: (model: string) => void;
}

const SectorHeader = ({ title, icon: Icon, sub }: { title: string, icon: any, sub: string }) => (
  <div className="flex items-center justify-between mb-8 border-b border-primary/20 pb-4">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center bg-primary text-black">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="font-heading text-lg uppercase tracking-widest text-white leading-none mb-1">{title}</h3>
        <p className="text-[10px] font-mono text-primary/60 uppercase tracking-tighter">{sub}</p>
      </div>
    </div>
    <div className="hidden md:flex flex-col items-end">
       <div className="flex gap-1 mb-1">
         {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-primary/20" />)}
       </div>
       <span className="text-[8px] font-mono text-muted-foreground uppercase opacity-40">Verified</span>
    </div>
  </div>
);

export const SourceInput = ({
  sourceType,
  setSourceType,
  githubUrl,
  setGithubUrl,
  githubBranch = "",
  setGithubBranch,
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
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN) || "");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const currentProvider = getProviderById(selectedAiProvider);
  const currentModels = getProviderModels(selectedAiProvider);

  useEffect(() => {
    const models = getProviderModels(selectedAiProvider);
    if (models.length > 0 && !models.some(m => m.id === selectedAiModel)) {
      setSelectedAiModel(models[0].id);
    }
    const savedApiKey = localStorage.getItem(`apiKey_${selectedAiProvider}`);
    if (savedApiKey) setApiKey(savedApiKey);
    else setApiKey("");
  }, [selectedAiProvider, setSelectedAiModel, selectedAiModel]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setZipFile(file);
        toast.success("File uploaded");
      } else {
        toast.error("Invalid file format");
      }
    }
  };

  const handleApiKeySave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(`apiKey_${selectedAiProvider}`, apiKey);
      toast.success(`Key saved for ${selectedAiProvider}`);
      setShowApiKey(false);
    } else {
      toast.error("Invalid key");
    }
  };

  return (
    <div className="space-y-16">
      <section>
        <SectorHeader title="CODE" icon={Database} sub="REPOSITORY" />
        
        <RadioGroup 
          value={sourceType} 
          onValueChange={(v) => setSourceType(v as "github" | "zip")}
          className="grid grid-cols-2 gap-4 mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative transition-all border p-1 ${sourceType === 'github' ? 'border-primary bg-primary/5' : 'border-white/10 opacity-60'}`}
          >
             <RadioGroupItem value="github" id="github" className="sr-only" />
             <Label htmlFor="github" className="flex flex-col items-center justify-center py-12 cursor-pointer border border-transparent hover:border-primary/20 transition-colors">
                <Github size={32} className={sourceType === 'github' ? 'text-primary' : 'text-white/40'} />
                <span className="font-heading uppercase text-sm tracking-widest text-white mt-4">GitHub</span>
                <span className="text-[8px] font-mono mt-1 text-primary/60 uppercase">Remote</span>
             </Label>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative transition-all border p-1 ${sourceType === 'zip' ? 'border-primary bg-primary/5' : 'border-white/10 opacity-60'}`}
          >
             <RadioGroupItem value="zip" id="zip" className="sr-only" />
             <Label htmlFor="zip" className="flex flex-col items-center justify-center py-12 cursor-pointer border border-transparent hover:border-primary/20 transition-colors">
                <Upload size={32} className={sourceType === 'zip' ? 'text-primary' : 'text-white/40'} />
                <span className="font-heading uppercase text-sm tracking-widest text-white mt-4">ZIP</span>
                <span className="text-[8px] font-mono mt-1 text-primary/60 uppercase">Local</span>
             </Label>
          </motion.div>
        </RadioGroup>

        <AnimatePresence mode="wait">
          {sourceType === "github" ? (
            <motion.div 
              key="github-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">URL</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center">
                      <Github size={20} className="text-primary/40 group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/user/repo"
                      className="bg-black/40 border-white/10 rounded-none h-14 pl-12 font-mono text-sm focus-visible:ring-primary focus-visible:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Branch</Label>
                   <Input 
                    value={githubBranch}
                    onChange={(e) => setGithubBranch?.(e.target.value)}
                    placeholder="main"
                    className="bg-black/40 border-white/10 rounded-none h-14 font-mono uppercase text-xs tracking-widest text-center"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                   <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Token (optional)</Label>
                   <span className="text-[8px] font-mono text-muted-foreground/40 italic">Local</span>
                 </div>
                 <div className="relative">
                   <Input 
                    type="password"
                    value={githubToken}
                    onChange={(e) => {
                      const t = e.target.value;
                      setGithubToken(t);
                      if (t) localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, t);
                      else localStorage.removeItem(STORAGE_KEYS.GITHUB_TOKEN);
                    }}
                    placeholder="Personal Access Token"
                    className="bg-black/40 border-white/10 rounded-none h-14 font-mono text-sm tracking-widest"
                  />
                  <Key className="absolute right-4 top-4 text-white/20" size={18} />
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="zip-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed h-48 flex flex-col items-center justify-center transition-all relative ${dragActive ? 'border-primary bg-primary/5' : 'border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files?.[0] && setZipFile(e.target.files[0])}
                className="hidden" 
                accept=".zip"
              />
              {zipFile ? (
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 flex items-center justify-center bg-primary text-black font-black uppercase text-xl relative">
                      ZIP
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-black border border-primary" />
                   </div>
                   <div className="text-center">
                      <p className="text-white font-mono uppercase text-sm tracking-wider">{zipFile.name}</p>
                      <button onClick={() => setZipFile(null)} className="text-[10px] text-red-500 uppercase font-mono tracking-widest mt-1 hover:text-red-400 group flex items-center justify-center gap-1 mx-auto">
                        <X size={10} /> REMOVE
                      </button>
                   </div>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <Upload className="text-primary/40 mb-4 group-hover:text-primary transition-colors" size={32} />
                  <p className="text-[12px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">Drop ZIP or <span className="text-primary">Click to Upload</span></p>
                  <span className="text-[8px] font-mono text-muted-foreground/30 mt-2 uppercase">Max 100MB</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section>
        <SectorHeader title="AI" icon={Cpu} sub="MODEL" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-950/40 p-10 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
             <Network size={40} className="text-primary" />
          </div>
          
          <div className="space-y-4">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Provider</Label>
            <Select value={selectedAiProvider} onValueChange={setSelectedAiProvider}>
              <SelectTrigger className="bg-black border-white/10 rounded-none h-14 font-heading tracking-widest hover:border-primary/40 transition-colors">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 rounded-none uppercase font-mono text-xs">
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Model</Label>
            <Select value={selectedAiModel} onValueChange={setSelectedAiModel}>
              <SelectTrigger className="bg-black border-white/10 rounded-none h-14 font-mono tracking-tighter hover:border-primary/40 transition-colors">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 rounded-none font-mono text-xs">
                {currentModels.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
             <div className="flex justify-between items-center">
                <Label className="text-[10px] font-mono uppercase tracking-widest text-primary/60">API KEY</Label>
                <a 
                  href={currentProvider?.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
                >
                  <ExternalLink size={10} /> GET KEY
                </a>
             </div>
             
             {showApiKey ? (
                <div className="flex gap-2">
                   <Input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ENTER KEY..."
                    className="bg-black border-white/10 h-12 font-mono"
                   />
                   <Button onClick={handleApiKeySave} className="h-12 bg-primary text-black rounded-none px-6 font-heading uppercase text-xs tracking-widest">Store</Button>
                   <Button variant="ghost" onClick={() => setShowApiKey(false)} className="h-12 font-mono text-[10px] uppercase">Cancel</Button>
                </div>
             ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setShowApiKey(true)}
                  className="w-full h-12 border-primary/20 bg-primary/5 text-primary rounded-none font-heading uppercase text-xs tracking-[0.2em] relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Key size={14} className="mr-2" />
                  {localStorage.getItem(`apiKey_${selectedAiProvider}`) ? 'UPDATE KEY' : 'SET KEY'}
                </Button>
             )}
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectorHeader title="CONTEXT" icon={CheckCircle2} sub="SUMMARY" />
        <div className="relative group">
          <div className="absolute top-4 left-4 pointer-events-none opacity-20">
             <InfoIcon size={20} className="text-primary" />
          </div>
          <Textarea 
            placeholder="Describe the project goals and architecture..."
            className="min-h-[250px] bg-black border-white/10 rounded-none p-10 font-mono text-sm leading-relaxed focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/20 resize-none transition-all hover:bg-black/60"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <div className="flex justify-between mt-2 px-1">
             <div className="flex gap-4">
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">BUFFER</span>
                <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">ASCII</span>
             </div>
             <span className="text-[8px] font-mono text-primary/40 uppercase tracking-widest">V0.1</span>
          </div>
        </div>
      </section>
    </div>
  );
};
