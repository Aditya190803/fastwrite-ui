
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mermaid } from "@/components/shared/Mermaid";
import { motion } from "framer-motion";
import { Image, Maximize2, RefreshCw } from "lucide-react";

interface VisualViewerProps {
  visualContent?: string;
  isMobile?: boolean;
}

const VisualViewer = ({ visualContent, isMobile = false }: VisualViewerProps) => {
  return (
    <div className="bg-black border border-white/5 h-full flex flex-col relative overflow-hidden group industrial-border shadow-2xl">
      {/* Sector Header Overlay */}
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary animate-pulse" />
          <div className="flex flex-col">
            <h3 className="font-heading font-black text-sm uppercase tracking-[0.2em] text-white italic">
              ARCHITECTURAL_SCHEMATIC
            </h3>
            <span className="font-mono text-[8px] text-primary/40 uppercase tracking-widest font-bold">CORE_VECTOR_PROJECTION</span>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-primary text-black text-[9px] font-mono font-bold uppercase tracking-widest">
              <Maximize2 size={10} />
              FULL_MAP
           </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-12 flex items-center justify-center min-h-full relative">
          {/* Blueprint Grid Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[size:20px_20px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
          
          {visualContent ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="w-full h-full flex items-center justify-center relative z-10"
            >
              <div className="bg-white/[0.03] backdrop-blur-md p-12 border border-white/10 relative shadow-2xl">
                 {/* Precision corner markers */}
                 <div className="absolute -top-2 -left-2 w-8 h-8 pointer-events-none">
                    <div className="absolute top-2 left-2 w-6 h-px bg-primary" />
                    <div className="absolute top-2 left-2 w-px h-6 bg-primary" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 pointer-events-none rotate-180">
                    <div className="absolute top-2 left-2 w-6 h-px bg-primary" />
                    <div className="absolute top-2 left-2 w-px h-6 bg-primary" />
                 </div>
                 
                 <div className="overflow-auto max-w-full selection:bg-primary/20">
                    <Mermaid chart={visualContent} />
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-32 text-center opacity-10 group-hover:opacity-20 transition-all duration-700 grayscale">
              <div className="relative">
                <Image size={80} strokeWidth={1} />
                <div className="absolute inset-0 animate-pulse bg-primary/20 blur-2xl rounded-full" />
              </div>
              <div className="space-y-3">
                 <p className="font-heading font-black text-2xl uppercase tracking-[0.3em] text-white italic">VISUAL_BUF_NULL</p>
                 <p className="font-mono text-[10px] uppercase tracking-widest font-bold truncate max-w-[300px]">NO_ARCHITECTURAL_SIGNALS_DETECTED_IN_STRATUM</p>
                 <div className="flex justify-center gap-1 opacity-50">
                    {[1,2,3,4,5].map(i => <div key={i} className="w-4 h-[2px] bg-primary" />)}
                 </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Technical Footer */}
      <div className="p-4 px-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center group/footer">
         <div className="flex gap-8 font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 group-hover:text-primary/40 transition-colors">
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
               SCALE: 1:1_VECTOR
            </span>
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
               MODE: SYNTHESIS_ACTIVE
            </span>
         </div>
         <div className="flex gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-3 h-3 bg-white/5 industrial-border group-hover:bg-primary/20 transition-all duration-300" />
            ))}
         </div>
      </div>
    </div>
  );
};

export default VisualViewer;
