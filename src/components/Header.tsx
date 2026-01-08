
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_CONFIG } from "@/lib/constants";

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(API_CONFIG.BASE_URL, { method: "GET", mode: "no-cors" });
        setApiStatus("online");
      } catch (e) {
        setApiStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 pt-16 pb-20 px-10 overflow-hidden border-b border-border bg-transparent"
    >
      <div className="absolute inset-0 grid-bg-fine opacity-10" />
      
      <div className="max-w-[1400px] mx-auto relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="flex flex-col items-start gap-6">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              className="h-[1px] w-48 bg-primary origin-left mb-2 opacity-50"
            />
            
            <div className="relative">
              <div className="absolute -top-12 left-0 flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${
                   apiStatus === 'online' ? 'bg-primary shadow-[0_0_8px_rgba(180,255,0,0.5)]' : 
                   apiStatus === 'offline' ? 'bg-red-500 animate-pulse' : 'bg-white/20'
                 }`} />
                 <span className="text-[8px] font-mono uppercase tracking-[0.3em]">
                   {apiStatus === 'online' ? 'UPLINK_STABLE' : 
                    apiStatus === 'offline' ? 'UPLINK_OFFLINE' : 'DETERMINING_STABILITY...'}
                 </span>
              </div>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-8 left-0 text-[10px] font-mono text-primary/60 uppercase tracking-[0.5em]"
              >
                Project_Initialization//Documentation_Layer
              </motion.span>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-black leading-[0.8] tracking-[calc(-0.05em)] text-white uppercase italic">
                {title.split(" ").map((word, i) => (
                  <motion.span 
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.1), duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block mr-6"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>
            </div>
          </div>

          {description && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="flex flex-col items-start lg:items-end gap-6 max-w-xl lg:text-right"
            >
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-8 h-[1px] bg-white/10" />)}
              </div>
              <p className="text-white/90 text-sm md:text-base font-body leading-relaxed uppercase tracking-[0.15em] border-l lg:border-l-0 lg:border-r border-primary/40 pl-6 lg:pl-0 lg:pr-6 py-2">
                {description}
              </p>
              <div className="font-mono text-[9px] text-white/60 uppercase tracking-[0.3em]">
                Status: Operational // Protocol: 0x2A9F
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Precision elements */}
      <div className="absolute top-0 right-[15%] w-[1px] h-full bg-white/5" />
      <div className="absolute top-0 right-[15.5%] w-[1px] h-full bg-white/5" />
      <div className="absolute bottom-0 left-[20%] w-[1px] h-24 bg-primary/30" />
      
      <div className="absolute top-1/2 -right-20 transform -translate-y-1/2 rotate-90 flex items-center gap-4">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-[1em]">SYSTEM_VERSION_1.0.1</span>
        <div className="w-48 h-[1px] bg-white/5" />
      </div>
    </motion.header>
  );
};
