
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, ArrowRight, Activity } from "lucide-react";

interface SubmitButtonProps {
  onClick: () => void;
  isLoading: boolean;
  text: string;
  loadingText: string;
  queueCount?: number;
}

export const SubmitButton = ({ onClick, isLoading, text, loadingText, queueCount = 0 }: SubmitButtonProps) => {
  return (
    <div className="relative w-full group">
      {/* Decorative scanline effect */}
      <div className="absolute -top-10 left-0 right-0 flex justify-between px-4 pointer-events-none">
        <div className="flex items-center gap-4">
          <Activity size={14} className="text-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary">SYS_STABLE</span>
            <div className="h-[1px] w-full bg-primary/30" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/70">BUFFER_0x00</span>
            <div className="h-[1px] w-full bg-white/30" />
          </div>
          <Zap size={14} className="text-white/60" />
        </div>
      </div>

      <motion.button
        whileHover={!isLoading ? { y: -4, scale: 1.005 } : {}}
        whileTap={!isLoading ? { scale: 0.995 } : {}}
        onClick={onClick}
        disabled={isLoading}
        className="relative w-full py-12 md:py-16 bg-primary text-black font-heading font-black text-4xl md:text-6xl uppercase tracking-[calc(-0.02em)] overflow-hidden border-2 border-primary transition-all disabled:grayscale disabled:cursor-wait italic"
      >
        {/* Deep Industrial Textures */}
        <div className="absolute inset-0 opacity-10 pointer-events-none grid-bg" />
        
        {/* Kinetic scan overlay */}
        <motion.div 
          className="absolute inset-x-0 h-[200px] bg-white/40 pointer-events-none skew-y-[-10deg] -translate-y-[200px]"
          animate={isLoading ? { translateY: ["-100%", "400%"] } : {}}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        />

        {/* Corner markers */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-black" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-black" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-black" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-black" />

        <div className="relative z-10 flex items-center justify-center gap-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-8"
              >
                <Loader2 size={48} className="animate-spin stroke-[3px]" />
                <div className="flex flex-col items-start leading-none">
                  <span className="drop-shadow-sm">{loadingText.toUpperCase()}</span>
                  {queueCount > 0 && (
                    <span className="text-[10px] font-mono tracking-widest mt-2">{queueCount} Q_PENDING</span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-8"
              >
                <span className="drop-shadow-sm">{text.toUpperCase()}</span>
                <ArrowRight size={48} className="stroke-[3px] group-hover:translate-x-4 transition-transform duration-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Bottom Status bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] flex justify-between gap-4 pointer-events-none">
           {[1,2,3,4,5,6,7,8].map(i => (
             <div key={i} className={`flex-1 h-1 ${isLoading ? 'bg-black/40 animate-pulse' : 'bg-black/10'}`} style={{ animationDelay: `${i * 100}ms` }} />
           ))}
        </div>
      </motion.button>

      {/* Footer labels */}
      <div className="mt-4 flex justify-between items-center opacity-70">
         <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
            <span>Core_Active</span>
            <span className="text-white/60">|</span>
            <span>Latency_0.02ms</span>
         </div>
         <div className="w-24 h-[1px] bg-primary/40" />
      </div>
    </div>
  );
};
