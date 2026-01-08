import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_CONFIG, STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionRegeneratorProps {
  sectionTitle: string;
  sectionContent: string;
  onRegenerated: (newContent: string) => void;
}

/**
 * Component that allows regenerating a specific section of documentation
 */
export function SectionRegenerator({
  sectionTitle,
  sectionContent,
  onRegenerated,
}: SectionRegeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleRegenerate = async () => {
    setIsRegenerating(true);

    try {
      const metadata = await storage.get<any>(STORAGE_KEYS.GENERATION_META);
      if (!metadata) {
        toast.error("Missing generation metadata. Please regenerate the full documentation.");
        return;
      }

      const apiKey = await storage.get<string>(`apiKey_${metadata.provider}`);
      
      if (!apiKey) {
        toast.error(`No API key found for ${metadata.provider}`);
        return;
      }

      const regeneratePrompt = customPrompt.trim() 
        ? `Regenerate the following documentation section titled "${sectionTitle}" with these instructions: ${customPrompt}\n\nCurrent content:\n${sectionContent}\n\nProvide only the improved content for this section, maintaining markdown formatting.`
        : `Improve and expand the following documentation section titled "${sectionTitle}":\n\n${sectionContent}\n\nProvide only the improved content for this section, maintaining markdown formatting. Make it more detailed, clearer, and more professional.`;

      const payload = {
        github_url: "NULL",
        zip_file: "NULL",
        llm_provider: metadata.provider,
        llm_model: metadata.model,
        api_key: apiKey,
        prompt: regeneratePrompt,
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT_MS);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.GENERATE_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const newContent = data.text_content || data.documentation || "";

      if (newContent.trim()) {
        onRegenerated(newContent.trim());
        toast.success(`Section "${sectionTitle}" regenerated successfully`);
        setIsOpen(false);
        setCustomPrompt("");
      } else {
        toast.error("Received empty response from API");
      }
    } catch (error) {
      console.error("Section regeneration failed:", error);
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error("Failed to regenerate section");
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-7 w-7 p-0 rounded-none border border-white/5 hover:bg-primary/10 hover:border-primary/50 text-white/40 hover:text-primary"
          title="Regenerate this section"
        >
          <RefreshCw className={cn("h-3 w-3", isRegenerating && "animate-spin")} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-white/5 sm:max-w-[500px] p-0 rounded-none overflow-hidden">
        {/* Sector Header */}
        <div className="bg-white/[0.03] border-b border-white/5 py-4 px-6 flex items-center gap-3">
           <div className="w-1.5 h-6 bg-primary" />
           <div>
              <DialogTitle className="text-sm font-heading font-black text-white uppercase tracking-[0.2em]">NODE_SYNTHESIS_MODIFIER</DialogTitle>
              <DialogDescription className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1">
                Target_Sector: {sectionTitle}
              </DialogDescription>
           </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="custom-prompt" className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] ml-1">Improvements_Directive</Label>
            <Textarea
              id="custom-prompt"
              placeholder="ENTER SPECIFIC SYNTHESIS INSTRUCTIONS (OPTIONAL)..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[120px] bg-black border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-none font-mono text-xs uppercase tracking-widest text-white/70 placeholder:text-white/10 transition-all"
            />
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              Leave empty for general improvement, or provide specific instructions
            </p>
          </div>
          
          <div className="p-4 bg-white/[0.02] border border-white/5">
            <p className="text-[8px] font-mono text-primary/40 uppercase tracking-[0.2em] mb-2 font-bold">Current_Buffer_Preview:</p>
            <p className="text-[10px] font-mono text-white/40 line-clamp-2 uppercase tracking-tight">{sectionContent.slice(0, 150)}...</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-none"
          >
            ABORT_COMMAND
          </Button>
          <Button 
            onClick={handleRegenerate} 
            disabled={isRegenerating}
            className="bg-primary text-black hover:bg-primary/90 font-mono text-[10px] font-bold uppercase tracking-widest rounded-none h-11 px-8 relative overflow-hidden group"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                EXECUTE_SYNTHESIS
              </>
            )}
            {/* Scanline decoration */}
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
          </Button>
        </div>

        {/* Footer info */}
        <div className="bg-white/[0.02] border-t border-white/5 py-2 px-6 flex justify-between items-center">
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">Protocol: RFC-992-X</span>
            <div className="flex gap-1">
               {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-primary/20" />)}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Parses markdown content into sections by headings
 */
export function parseMarkdownSections(content: string): Array<{
  title: string;
  level: number;
  content: string;
  fullSection: string;
}> {
  const lines = content.split("\n");
  const sections: Array<{
    title: string;
    level: number;
    content: string;
    fullSection: string;
    startLine: number;
  }> = [];

  let currentSection: {
    title: string;
    level: number;
    lines: string[];
    startLine: number;
  } | null = null;

  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        const sectionContent = currentSection.lines.join("\n").trim();
        sections.push({
          title: currentSection.title,
          level: currentSection.level,
          content: sectionContent,
          fullSection: `${"#".repeat(currentSection.level)} ${currentSection.title}\n\n${sectionContent}`,
          startLine: currentSection.startLine,
        });
      }
      
      // Start new section
      currentSection = {
        title: headingMatch[2].trim(),
        level: headingMatch[1].length,
        lines: [],
        startLine: index,
      };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  });

  // Save last section
  if (currentSection) {
    const sectionContent = currentSection.lines.join("\n").trim();
    sections.push({
      title: currentSection.title,
      level: currentSection.level,
      content: sectionContent,
      fullSection: `${"#".repeat(currentSection.level)} ${currentSection.title}\n\n${sectionContent}`,
      startLine: currentSection.startLine,
    });
  }

  return sections;
}
