
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, ArrowRight, Activity } from "lucide-react";

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  text: string;
  loadingText: string;
}

export const SubmitButton = ({ onClick, isLoading, text, loadingText }: SubmitButtonProps) => {
  return (
    <div className="relative w-full group">
      {/* Decorative scanline effect */}
      <div className="absolute -top-6 left-0 right-0 flex justify-between px-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <Activity size={10} className="text-primary animate-pulse" />
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-primary/40">READY</span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-primary/40">CLEAR</span>
      </div>

      <motion.button
        whileHover={!isLoading ? { scale: 1.01 } : {}}
        whileTap={!isLoading ? { scale: 0.99 } : {}}
        onClick={onClick}
        disabled={isLoading}
        className="relative w-full py-8 md:py-12 bg-primary text-black font-heading font-black text-2xl md:text-4xl uppercase tracking-tighter overflow-hidden border border-primary transition-all disabled:opacity-80 disabled:cursor-wait"
      >
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        
        {/* Kinetic scan overlay */}
        <motion.div 
          className="absolute inset-x-0 h-1/2 bg-white/20 pointer-events-none skew-y-[-2deg] -translate-y-full"
          animate={isLoading ? { translateY: ["100%", "300%"] } : {}}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />

        <div className="relative z-10 flex items-center justify-center gap-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4"
              >
                <Loader2 size={32} className="animate-spin" />
                <span>{loadingText.toUpperCase()}</span>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4"
              >
                <span>{text.toUpperCase()}</span>
                <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-black/20" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-black/20" />
        
        {/* Bottom Technical Bar */}
        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-black/10 flex">
           <motion.div 
             className="h-full bg-black/40"
             animate={isLoading ? { width: ["0%", "100%"] } : { width: "100%" }}
             transition={isLoading ? { repeat: Infinity, duration: 2 } : {}}
           />
        </div>
      </motion.button>
      
      {/* Footer labels */}
      <div className="mt-4 flex justify-between items-center opacity-40">
         <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest text-primary">
            <span>Core_Active</span>
            <span className="text-white/40">|</span>
            <span>Latency_0.02ms</span>
         </div>
         <div className="w-24 h-[1px] bg-primary/20" />
      </div>
    </div>
  );
};
