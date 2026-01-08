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
    <div className="space-y-6 font-mono">
      <div className="flex items-center justify-between mb-8 pb-4 relative overflow-hidden">
         <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5" />
         <div className="absolute bottom-0 left-0 w-24 h-[1px] bg-primary animate-scan-fast" />
         
         <div className="flex items-center gap-4 relative z-10">
            <Activity size={12} className="text-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold italic">GEN_STRATUM_STATUS</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">UPLINK_ESTABLISHED</span>
         </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep || step.status === "in-progress";
          const isCompleted = step.status === "completed";
          const isError = step.status === "error";

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative flex items-center gap-6 p-5 border transition-all duration-500 industrial-border overflow-hidden",
                isActive ? "bg-white/[0.04] border-primary/30" : "bg-black/40 border-white/5",
                isCompleted && "bg-black/20 border-white/5 grayscale-[0.5]",
                isError && "bg-red-500/5 border-red-500/30"
              )}
            >
              {/* Dynamic scanline for active */}
              {isActive && (
                <div className="absolute inset-x-0 h-[100%] top-0 bg-primary/5 pointer-events-none animate-scan-slow opacity-20" />
              )}

              {/* Step Number Decoration */}
              <div className="text-[8px] font-mono text-white/10 absolute top-2 right-4 tracking-[0.4em] font-bold">
                 MODULE_0{index + 1}
              </div>

              <div className="flex-shrink-0 relative z-10">
                {isCompleted ? (
                  <div className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary bg-primary/5 text-glow">
                    <CheckCircle2 size={18} />
                  </div>
                ) : isError ? (
                  <div className="w-10 h-10 border border-red-500/40 flex items-center justify-center text-red-500 bg-red-500/5">
                    <XCircle size={18} />
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(46,108,246,0.3)]">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                ) : (
                  <div className="w-10 h-10 border border-white/5 flex items-center justify-center text-white/10 bg-white/[0.02]">
                    <Circle size={18} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className={cn(
                      "text-[11px] uppercase tracking-[0.2em] font-black italic",
                      isActive ? "text-primary text-glow" : "text-white/70",
                      isCompleted && "text-white/80",
                      isError && "text-red-500"
                    )}
                  >
                    {step.label.toUpperCase()}
                  </p>
                  {isActive && (
                     <div className="flex items-center gap-2">
                        <motion.div 
                           animate={{ scaleX: [1, 2, 1] }}
                           transition={{ repeat: Infinity, duration: 0.8 }}
                           className="w-4 h-[1px] bg-primary"
                        />
                        <span className="text-[8px] font-bold text-primary tracking-widest bg-primary/10 px-2 py-0.5">
                           PROCESSING_V3
                        </span>
                     </div>
                  )}
                </div>
                
                <div className="font-mono text-[8px] uppercase tracking-widest text-white/50 flex gap-6 italic">
                   <span className="flex items-center gap-2">
                      <Zap size={8} className={isActive ? "text-primary" : "text-white/30"} />
                      INST_ID: {step.id.toUpperCase()}
                   </span>
                   {isCompleted && <span className="text-primary/60">VECTOR_READY</span>}
                   {isError && <span className="text-red-500/60">CHECKSUM_FAILED</span>}
                </div>
              </div>

              {/* High-impact corner accents for active/error */}
              {isActive && (
                 <>
                   <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
                   <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />
                 </>
              )}
              {isError && (
                 <>
                   <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
                   <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />
                 </>
              )}
            </motion.div>
          );
        })}
      </div>
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

      <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/50">
         <span>Input_Stream_Alpha</span>
         <span>Latency: 12ms</span>
      </div>
    </div>
  );
}
