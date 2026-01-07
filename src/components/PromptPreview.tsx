import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateDocumentationPrompt } from "@/lib/prompts";
import { Terminal, Shield } from "lucide-react";

interface PromptPreviewProps {
  sourceType: "github" | "zip";
  githubUrl: string;
  selectedCodeSections: string[];
  selectedReportSections: string[];
  literatureSource: "auto" | "manual";
  manualReferences?: string;
}

export const PromptPreview = ({
  sourceType,
  githubUrl,
  selectedCodeSections,
  selectedReportSections,
  literatureSource,
  manualReferences
}: PromptPreviewProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const generatedPrompt = generateDocumentationPrompt({
      sourceType,
      githubUrl,
      selectedCodeSections,
      selectedReportSections,
      literatureSource,
      manualReferences,
    });

    setPrompt(generatedPrompt);
  }, [sourceType, githubUrl, selectedCodeSections, selectedReportSections, literatureSource, manualReferences]);

  return (
    <div className="bg-black/80 border border-white/5 relative overflow-hidden group">
      {/* Header Label */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5">
         <div className="flex items-center gap-2">
            <Terminal size={10} className="text-primary" />
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">Prompt Preview</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-primary/40 uppercase">Read Only</span>
            <Shield size={10} className="text-primary/20" />
         </div>
      </div>
      
      <ScrollArea className={`${isMobile ? 'h-40' : 'h-60'} w-full bg-black/40`}>
        <div className="p-4 md:p-6">
           <pre className="text-[10px] md:text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-white/50 group-hover:text-white/70 transition-colors uppercase tracking-wider">
             {prompt || "WAITING_FOR_INPUT_PARAMETERS..."}
           </pre>
        </div>
      </ScrollArea>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
