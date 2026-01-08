
import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardSectionProps {
  title: string;
  tooltip: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  collapsibleOnMobile?: boolean;
}

export const CardSection = ({ 
  title, 
  tooltip, 
  children, 
  defaultCollapsed = false,
  collapsibleOnMobile = false 
}: CardSectionProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  
  const shouldCollapse = collapsibleOnMobile && isMobile;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative mb-12"
    >
      <div className="flex items-center justify-between mb-0 border border-white/5 bg-white/[0.01] py-6 px-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[2px] h-full bg-primary/20 group-hover:bg-primary transition-colors" />
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => shouldCollapse && setIsOpen(!isOpen)}
        >
          <div className="flex flex-col">
             <div className="flex items-center gap-3 mb-1">
               <span className="text-[10px] font-mono text-primary/70 tracking-[0.4em] uppercase">MODULE_PRTCL</span>
               <div className="w-12 h-[1px] bg-primary/40" />
             </div>
             <h2 className="text-2xl md:text-3xl font-heading font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors flex items-center gap-4 italic underline-offset-8">
               {title}
               {shouldCollapse && (
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <ChevronDown className="h-5 w-5 text-primary" />
                  </motion.div>
               )}
             </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end opacity-40 group-hover:opacity-80 transition-opacity">
             <span className="text-[8px] font-mono text-white/60 tracking-[0.3em] uppercase mb-1">SEC_ID // {title.substring(0, 3).toUpperCase()}</span>
             <div className="flex gap-1.5">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 border border-primary/50" />)}
             </div>
          </div>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="p-2 border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/40 cursor-help transition-all group/info">
                  <InfoIcon className="h-4 w-4 text-white/60 group-hover/info:text-primary transition-colors" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black border border-primary/20 text-white font-mono text-[10px] uppercase tracking-wider p-4 rounded-none max-w-xs">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-black/40 border border-white/5 p-8 relative group border-t-0">
              <div className="absolute top-0 right-0 p-2 opacity-[0.04] pointer-events-none select-none">
                <span className="text-[80px] font-heading font-black italic">{title.substring(0,1)}</span>
              </div>
              
              <div className="relative z-10 w-full font-body">
                {children}
              </div>

              {/* Decorative data label */}
              <div className="absolute bottom-2 right-4 text-[7px] font-mono text-white/20 uppercase tracking-[0.4em] pointer-events-none select-none">
                System_Interface_Module_Active // 0x2A9F
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
