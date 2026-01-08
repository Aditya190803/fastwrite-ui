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
    <div className="bg-black border border-white/5 relative overflow-hidden group industrial-border shadow-2xl">
      {/* Dynamic scanline */}
      <div className="absolute inset-0 pointer-events-none z-20 animate-scan-slow opacity-10 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-20" />
      
      {/* Header Label */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.03] border-b border-white/5 relative z-10">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary animate-pulse rounded-full" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-[0.4em] font-bold">LIVE_PROMPT_BUFFER</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-white/50 uppercase tracking-[0.2em]">{prompt.length} BYTES</span>
            <div className="flex gap-0.5">
               {[1,2,3].map(i => <div key={i} className="w-1.5 h-3 bg-white/20" />)}
            </div>
         </div>
      </div>
      
      <ScrollArea className={`${isMobile ? 'h-64' : 'h-80'} w-full bg-black/60 relative z-10 custom-scrollbar`}>
        <div className="p-8 relative">
           {/* CRT Grid effect */}
           <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[size:20px_20px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
           
           <pre className="text-[11px] md:text-[12px] font-mono whitespace-pre-wrap leading-relaxed text-primary/80 group-hover:text-primary transition-colors uppercase tracking-widest relative z-10 selection:bg-primary selection:text-black">
             {prompt || ">> STATUS: WAITING_FOR_INPUT_VECTOR\n>> ROUTE: 0x2A9F\n>> ENCRYPTION: AES-256-GCM"}
           </pre>
        </div>
      </ScrollArea>

      {/* Footer Decoration */}
      <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-10">
        <div className="flex gap-4">
          <span className="text-[8px] font-mono text-white/60 uppercase">CRC32: 0x8F2D1A</span>
          <span className="text-[8px] font-mono text-white/60 uppercase">PARITY: ODD</span>
        </div>
        <div className="text-[8px] font-mono text-primary/60 uppercase">READY_TO_STREAM</div>
      </div>
    </div>
  );
};
