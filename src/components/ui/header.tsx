
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code, FileText, Github, Package } from "lucide-react";
import { motion } from "framer-motion";

export const MainHeader = () => {
  return (
    <nav className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="max-w-[1400px] mx-auto flex justify-between items-center relative">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center group relative"
          >
            <div className="relative industrial-border p-2 mr-4 transition-all duration-500 bg-primary/10 group-hover:bg-primary/20">
               <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-heading font-black uppercase tracking-tighter text-white group-hover:text-primary transition-colors">FASTWRITE</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-white/30 leading-none uppercase tracking-widest mt-1">RESEARCH_CORE</span>
                <span className="text-[9px] font-mono text-primary leading-none uppercase tracking-widest mt-1 opacity-80">v1.0.1</span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center space-x-16 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
          <a 
            href="https://fastwrite.kjsieit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-all flex items-center gap-2 relative group py-2"
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            DOCUMENTATION
          </a>
          <Link to="/results" className="hover:text-primary transition-all flex items-center gap-2 relative group py-2">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            RESULTS
          </Link>
          <a 
            href="https://github.com/R-G-KJSIT/FastWrite/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-all flex items-center gap-2 relative group py-2"
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            SOURCE_CODE
          </a>
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden xl:flex flex-col items-end border-r border-white/5 pr-8">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] mb-1">STATION_04</span>
              <div className="flex gap-1.5">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="w-1.5 h-1.5 border border-primary/30 group-hover:border-primary/60 transition-colors" />
                 ))}
              </div>
           </div>
           
           <button className="h-10 px-6 bg-primary/10 border border-primary/30 hover:border-primary hover:bg-primary/20 text-primary transition-all font-mono text-[11px] uppercase tracking-[0.2em] relative group">
             <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary opacity-0 group-hover:opacity-100 transition-opacity" />
             <span className="relative z-10 flex items-center gap-2">
               <Code className="w-3 h-3" />
               INITIALIZE
             </span>
           </button>
        </div>
      </div>
    </nav>
  );
};

