import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, X, Upload, Key, ExternalLink, AlertTriangle, CheckCircle2, Loader2, Github, Cpu, Database, Network, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateZipFile, ZipValidationResult } from "@/lib/zipValidation";
import { STORAGE_KEYS, AI_PROVIDERS, getProviderById, getProviderModels } from "@/lib/constants";
import { storage } from "@/lib/storage";

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
  <div className="flex items-center justify-between mb-8 border-b-2 border-white/5 pb-6 overflow-hidden relative group">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 industrial-border flex items-center justify-center bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-black">
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="font-heading text-2xl uppercase tracking-widest text-white leading-none mb-2 italic">{title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em]">{sub}</span>
          <div className="w-12 h-[1px] bg-primary/20" />
        </div>
      </div>
    </div>
    <div className="hidden lg:flex flex-col items-end">
       <div className="flex gap-2 mb-2">
         {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-4 bg-primary/20 transition-colors group-hover:bg-primary/40" />)}
       </div>
       <span className="text-[9px] font-mono text-white/50 uppercase tracking-[0.5em] group-hover:text-white/70 transition-colors">NODE_CONNECTED // 0xAF4</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary/0 group-hover:bg-primary/50 transition-all duration-700 -translate-x-full group-hover:translate-x-0" />
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
  const [githubToken, setGithubToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const currentProvider = getProviderById(selectedAiProvider);
  const currentModels = getProviderModels(selectedAiProvider);

  useEffect(() => {
    const loadTokens = async () => {
      const savedToken = await storage.get<string>(STORAGE_KEYS.GITHUB_TOKEN);
      if (savedToken) setGithubToken(savedToken);

      const savedApiKey = await storage.get<string>(`apiKey_${selectedAiProvider}`);
      if (savedApiKey) {
        setApiKey(savedApiKey);
        setHasApiKey(true);
      } else {
        setApiKey("");
        setHasApiKey(false);
      }
    };

    loadTokens();
  }, [selectedAiProvider]);

  useEffect(() => {
    const models = getProviderModels(selectedAiProvider);
    if (models.length > 0 && !models.some(m => m.id === selectedAiModel)) {
      setSelectedAiModel(models[0].id);
    }
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

  const handleApiKeySave = async () => {
    if (apiKey.trim()) {
      await storage.set(`apiKey_${selectedAiProvider}`, apiKey);
      setHasApiKey(true);
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
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className={`relative transition-all ${sourceType === 'github' ? 'industrial-border bg-primary/5 shadow-[0_0_30px_rgba(212,255,0,0.05)]' : 'border border-white/5 opacity-40 grayscale'} p-0 overflow-hidden`}
          >
             <RadioGroupItem value="github" id="github" className="sr-only" />
             <Label htmlFor="github" className="flex flex-col items-center justify-center py-20 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group">
                <Github size={48} className={`transition-all duration-500 ${sourceType === 'github' ? 'text-primary scale-110 drop-shadow-[0_0_15px_rgba(212,255,0,0.4)]' : 'text-white/60'}`} />
                <span className="font-heading uppercase text-2xl tracking-[0.2em] text-white mt-6 italic font-black">GITHUB_SRC</span>
                <span className="font-mono text-[10px] mt-2 text-primary/70 uppercase tracking-[0.4em]">REMOTE_SYNC_PROTO</span>
                
                <div className="absolute top-2 left-2 flex gap-1 opacity-20">
                  <div className="w-1 h-1 bg-white" />
                  <div className="w-6 h-[1px] bg-white self-center" />
                </div>
                
                {sourceType === 'github' && (
                  <motion.div layoutId="active-indicator" className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-primary" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-primary" />
                    <span className="absolute top-2 right-2 text-[8px] font-mono text-primary uppercase">ACTIVE</span>
                  </motion.div>
                )}
             </Label>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className={`relative transition-all ${sourceType === 'zip' ? 'industrial-border bg-primary/5 shadow-[0_0_30px_rgba(212,255,0,0.05)]' : 'border border-white/5 opacity-40 grayscale'} p-0 overflow-hidden`}
          >
             <RadioGroupItem value="zip" id="zip" className="sr-only" />
             <Label htmlFor="zip" className="flex flex-col items-center justify-center py-20 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group">
                <Upload size={48} className={`transition-all duration-500 ${sourceType === 'zip' ? 'text-primary scale-110 drop-shadow-[0_0_15px_rgba(212,255,0,0.4)]' : 'text-white/60'}`} />
                <span className="font-heading uppercase text-2xl tracking-[0.2em] text-white mt-6 italic font-black">BINARY_ZIP</span>
                <span className="font-mono text-[10px] mt-2 text-primary/70 uppercase tracking-[0.4em]">LOCAL_BUF_UPLOAD</span>
                
                <div className="absolute top-2 left-2 flex gap-1 opacity-20">
                  <div className="w-1 h-1 bg-white" />
                  <div className="w-6 h-[1px] bg-white self-center" />
                </div>

                {sourceType === 'zip' && (
                  <motion.div layoutId="active-indicator" className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-primary" />
                    <div className="absolute top-0 right-0 w-[1px] h-full bg-primary" />
                    <span className="absolute top-2 right-2 text-[8px] font-mono text-primary uppercase">ACTIVE</span>
                  </motion.div>
                )}
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
                   <a 
                     href="https://github.com/settings/tokens/new?scopes=repo&description=FastWrite" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-[8px] font-mono text-primary uppercase tracking-widest hover:bg-primary/20 hover:border-primary/50 transition-all flex items-center gap-1.5"
                   >
                     Get Token
                   </a>
                 </div>
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] font-mono text-muted-foreground/40 italic">Local</span>
                   <span className="text-[8px] font-mono text-muted-foreground/40 italic">Personal Access Token</span>
                 </div>
                 <div className="relative">
                   <Input 
                    type="password"
                    value={githubToken}
                    onChange={async (e) => {
                      const t = e.target.value;
                      setGithubToken(t);
                      if (t) await storage.set(STORAGE_KEYS.GITHUB_TOKEN, t);
                      else await storage.remove(STORAGE_KEYS.GITHUB_TOKEN);
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
        <SectorHeader title="COMPUTE" icon={Network} sub="AI_CORE_ROUTING" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/[0.01] p-10 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
             <Cpu size={120} className="text-primary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-[11px] font-mono uppercase tracking-[0.4em] text-primary/60">Provider_Selection</Label>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-2 h-[2px] bg-primary/20" />)}
              </div>
            </div>
            <Select value={selectedAiProvider} onValueChange={setSelectedAiProvider}>
              <SelectTrigger className="bg-black border-white/10 rounded-none h-16 font-heading tracking-widest hover:border-primary/40 focus:ring-primary transition-all">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent className="bg-black border-primary/20 rounded-none font-mono uppercase text-xs">
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id} className="focus:bg-primary focus:text-black transition-colors rounded-none py-3">
                    {provider.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-[11px] font-mono uppercase tracking-[0.4em] text-primary/60">Model_Selection</Label>
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-2 h-[2px] bg-primary/20" />)}
              </div>
            </div>
            <Select 
              value={selectedAiModel.startsWith("custom:") ? "custom" : selectedAiModel} 
              onValueChange={(value) => {
                if (value === "custom") {
                  setSelectedAiModel("custom:");
                } else {
                  setSelectedAiModel(value);
                }
              }}
            >
              <SelectTrigger className="bg-black border-white/10 rounded-none h-16 font-mono tracking-widest hover:border-primary/40 focus:ring-primary transition-all">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent className="bg-black border-primary/20 rounded-none font-mono text-xs">
                {currentModels.map(m => (
                  <SelectItem key={m.id} value={m.id} className="focus:bg-primary focus:text-black transition-colors rounded-none py-3">
                    {m.name.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAiModel.startsWith("custom:") && (
              <Input 
                type="text"
                value={selectedAiModel.replace("custom:", "")}
                onChange={(e) => setSelectedAiModel("custom:" + e.target.value)}
                placeholder="Enter custom model ID..."
                className="bg-black/60 border-primary/20 h-14 font-mono text-sm tracking-widest focus:ring-primary rounded-none mt-3"
              />
            )}
          </div>

          <div className="md:col-span-2 space-y-6 pt-8 border-t border-white/5">
             <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <Label className="text-[11px] font-mono uppercase tracking-[0.4em] text-primary/60 mb-2">AUTH_GATE</Label>
                  <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Hardware ID: {Math.floor(Math.random() * 1000).toString(16).toUpperCase()}</p>
                </div>
                <a 
                  href={currentProvider?.apiKeyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary/5 border border-primary/20 text-[10px] font-mono text-primary hover:bg-primary/10 transition-all flex items-center gap-2 uppercase tracking-widest"
                >
                  <ExternalLink size={12} /> ACQUIRE_KEY
                </a>
             </div>
             
             {showApiKey ? (
                <div className="flex gap-4">
                   <Input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="INPUT_KEY_VECTOR..."
                    className="bg-black/60 border-primary/20 h-14 font-mono text-sm tracking-widest focus:ring-primary rounded-none"
                   />
                   <Button onClick={handleApiKeySave} className="h-14 bg-primary text-black rounded-none px-10 font-heading font-black uppercase text-sm tracking-widest hover:px-14 transition-all">ESTABLISH</Button>
                   <Button variant="ghost" onClick={() => setShowApiKey(false)} className="h-14 font-mono text-[11px] uppercase tracking-widest text-white/40 hover:text-white">CANCEL</Button>
                </div>
             ) : (
                <Button 
                  onClick={() => setShowApiKey(true)}
                  className="w-full h-16 bg-primary/5 border border-primary/30 hover:border-primary text-primary rounded-none font-heading font-black uppercase text-xs tracking-[0.3em] relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                  <Key size={16} className="mr-3 group-hover:rotate-45 transition-transform" />
                  {hasApiKey ? 'RECALIBRATE_ACCESS//' : 'INITIALIZE_AUTH_LAYER//'}
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
