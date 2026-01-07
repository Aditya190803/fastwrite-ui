
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
    <div className="bg-zinc-950 border border-white/5 h-full flex flex-col relative overflow-hidden group">
      {/* Sector Header Overlay */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary" />
          <h3 className="font-heading font-black text-xs uppercase tracking-widest text-white">
            Architecture
          </h3>
        </div>
        <div className="flex gap-2">
           <div className="px-2 py-0.5 border border-primary/20 bg-primary/5 text-[9px] font-mono text-primary uppercase">
              View
           </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 flex items-center justify-center min-h-full bg-[url('/noise.png')] bg-repeat">
          {visualContent ? (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full h-full flex items-center justify-center"
            >
              <div className="bg-white/5 backdrop-blur-sm p-8 border border-white/10 relative">
                 {/* Corner accents */}
                 <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
                 
                 <div className="overflow-auto max-w-full">
                    <Mermaid chart={visualContent} />
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20 text-center opacity-20 group-hover:opacity-40 transition-opacity">
              <Image size={48} />
              <div className="space-y-1">
                 <p className="font-heading font-bold text-sm uppercase tracking-widest">Visual_Buffer_Null</p>
                 <p className="font-mono text-[10px] uppercase">No architectural signals detected</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Technical Footer */}
      <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center">
         <div className="flex gap-4 font-mono text-[8px] uppercase tracking-widest text-white/30">
            <span>Scale: 1:1</span>
            <span>Mode: Vector_Synthesis</span>
         </div>
         <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
            <div className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
         </div>
      </div>
    </div>
  );
};

export default VisualViewer;
