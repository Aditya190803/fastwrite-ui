
import React from "react";
import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  description?: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 pt-16 pb-20 px-6 overflow-hidden border-b border-border bg-background"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-start gap-4">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1, ease: "circOut" }}
          className="h-1 w-24 bg-primary origin-left mb-4"
        />
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[6rem] font-heading font-extrabold leading-[0.85] tracking-tighter text-white">
          {title.split(" ").map((word, i) => (
            <motion.span 
              key={i}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-2"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-muted-foreground text-sm md:text-base font-body max-w-2xl mt-8 leading-relaxed uppercase tracking-[0.2em] border-l-2 border-primary pl-6"
          >
            {description}
          </motion.p>
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-1/4 w-px h-full bg-border/50 hidden md:block" />
      <div className="absolute top-0 right-3/4 w-px h-full bg-border/20 hidden md:block" />
      <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 overflow-hidden">
        <span className="text-[10px] font-mono text-primary rotate-90 origin-right translate-y-full animate-in fade-in slide-in-from-bottom-2 duration-1000">EST. 2026</span>
        <span className="text-[10px] font-mono text-muted-foreground rotate-90 origin-right translate-y-full animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-150">v0.1.0</span>
      </div>
    </motion.header>
  );
};
