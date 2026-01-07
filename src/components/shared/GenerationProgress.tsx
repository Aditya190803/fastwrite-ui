import { CheckCircle2, Circle, Loader2, XCircle, Activity, ShieldCheck, Zap } from "lucide-react";
import { ProgressStep } from "@/types/documentation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GenerationProgressProps {
  steps: ProgressStep[];
  currentStep?: string;
}

export function GenerationProgress({ steps, currentStep }: GenerationProgressProps) {
  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-2">
         <div className="flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-primary">STATUS</span>
         </div>
         <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">ACTIVE</span>
      </div>

      {steps.map((step, index) => {
        const isActive = step.id === currentStep || step.status === "in-progress";
        const isCompleted = step.status === "completed";
        const isError = step.status === "error";

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex items-center gap-4 p-4 border transition-all",
              isActive ? "bg-primary/5 border-primary/20" : "bg-black/20 border-white/5",
              isCompleted && "opacity-60",
              isError && "bg-red-500/5 border-red-500/20"
            )}
          >
            {/* Step Number */}
            <div className="text-[9px] text-white/20 font-bold absolute top-1 left-1">
               0{index + 1}
            </div>

            <div className="flex-shrink-0 relative">
              {isCompleted ? (
                <div className="w-6 h-6 rounded-full border border-primary/40 flex items-center justify-center text-primary">
                  <CheckCircle2 size={14} />
                </div>
              ) : isError ? (
                <div className="w-6 h-6 rounded-full border border-red-500/40 flex items-center justify-center text-red-500">
                  <XCircle size={14} />
                </div>
              ) : isActive ? (
                <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center text-primary">
                  <Loader2 size={14} className="animate-spin" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-white/10">
                  <Circle size={14} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p
                  className={cn(
                    "text-[10px] uppercase tracking-widest font-black",
                    isActive ? "text-primary" : "text-white/40",
                    isCompleted && "text-white/60",
                    isError && "text-red-500"
                  )}
                >
                  {step.label.toUpperCase()}
                </p>
                {isActive && (
                   <motion.span 
                     animate={{ opacity: [1, 0.4, 1] }}
                     transition={{ repeat: Infinity, duration: 1 }}
                     className="text-[8px] text-primary"
                   >
                     PROCESSING
                   </motion.span>
                )}
              </div>
              
              {/* Technical sub-bit */}
              <div className="font-mono text-[8px] uppercase tracking-widest text-white/20 flex gap-4">
                 <span>Type: {step.id.split('-')[0] || "Global"}</span>
              </div>
            </div>

            {/* Kinetic corner for active step */}
            {isActive && (
               <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

interface SimpleProgressProps {
  progress: number;
  label?: string;
}

export function SimpleProgress({ progress, label }: SimpleProgressProps) {
  return (
    <div className="space-y-3 font-mono">
      {label && (
        <div className="flex justify-between items-end">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <Zap size={10} className="text-primary" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/60">{label.toUpperCase()}</span>
             </div>
          </div>
          <span className="text-xs font-black text-white tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      <div className="relative h-6 bg-black border border-white/5 p-1 overflow-hidden">
        {/* Progress Grid Overlay */}
        <div className="absolute inset-0 z-10 flex gap-[2px] pointer-events-none opacity-20">
           {Array.from({ length: 40 }).map((_, i) => (
             <div key={i} className="h-full w-[1px] bg-white/10" />
           ))}
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="relative h-full bg-primary overflow-hidden"
        >
           {/* Progress Scanline */}
           <div className="absolute inset-0 bg-white/20 skew-x-[-20deg] translate-x-[-10%]" />
           <motion.div 
             className="absolute top-0 bottom-0 w-12 bg-white/30 skew-x-[-20deg]"
             animate={{ left: ["-20%", "120%"] }}
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
           />
        </motion.div>
      </div>

      <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/20">
         <span>Input_Stream_Alpha</span>
         <span>Latency: 12ms</span>
      </div>
    </div>
  );
}
