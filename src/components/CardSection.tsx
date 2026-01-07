
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
      className="relative mb-8"
    >
      <div className="flex items-center justify-between mb-0 border-l-[3px] border-primary pl-4 bg-white/[0.02] py-4 pr-4">
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => shouldCollapse && setIsOpen(!isOpen)}
        >
          <div className="flex flex-col">
             <span className="text-[9px] font-mono text-primary/60 mb-1 tracking-[0.3em] uppercase">Section</span>
             <h2 className="text-xl md:text-2xl font-heading font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors flex items-center gap-3">
               {title}
               {shouldCollapse && (
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <ChevronDown className="h-4 w-4 text-primary/40" />
                  </motion.div>
               )}
             </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex flex-col items-end opacity-20 group-hover:opacity-40 transition-opacity">
             <span className="text-[7px] font-mono text-white uppercase tracking-widest">Logic_Gate::0x{Math.floor(Math.random() * 1000).toString(16).toUpperCase()}</span>
             <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="w-1.5 h-1 bg-primary" />)}
             </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="p-2 border border-white/5 hover:border-primary/50 transition-colors bg-black">
                  <InfoIcon className="h-3 w-3 text-primary/60" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-primary/40 text-primary font-mono text-[9px] rounded-none uppercase tracking-widest p-3">
                <p className="max-w-[200px]">{tooltip}</p>
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
            <div className="bg-black/40 border border-white/5 p-6 md:p-8 relative group border-t-0">
              {/* Scanline pattern */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
              
              <div className="relative z-10 w-full">
                {children}
              </div>

              {/* Decorative data label */}
              <div className="absolute bottom-2 right-4 text-[7px] font-mono text-white/5 uppercase tracking-[0.4em] pointer-events-none select-none">
                System_Interface_Module_Active
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
