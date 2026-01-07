
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code, FileText, Github, Package } from "lucide-react";
import { motion } from "framer-motion";

export const MainHeader = () => {
  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-3 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center group relative"
          >
            <div className="bg-primary p-1.5 mr-3 transition-all duration-500 group-hover:px-4">
               <BookOpen className="h-4 w-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-heading font-black uppercase tracking-tighter text-white">FASTWRITE</span>
              <span className="text-[8px] font-mono text-primary leading-none uppercase tracking-widest mt-0.5 opacity-50">v1.0.0</span>
            </div>
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center space-x-12 font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
          <a 
            href="https://fastwrite.kjsieit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-all flex items-center gap-2 relative group"
          >
            <div className="absolute -left-4 w-1 h-1 bg-primary scale-0 group-hover:scale-100 transition-transform rounded-full" />
            DOCS
          </a>
          <Link to="/results" className="hover:text-primary transition-all flex items-center gap-2 relative group">
            <div className="absolute -left-4 w-1 h-1 bg-primary scale-0 group-hover:scale-100 transition-transform rounded-full" />
            HISTORY
          </Link>
          <a 
            href="https://github.com/R-G-KJSIT/FastWrite/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-all flex items-center gap-2 relative group"
          >
            <div className="absolute -left-4 w-1 h-1 bg-primary scale-0 group-hover:scale-100 transition-transform rounded-full" />
            GITHUB
          </a>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex flex-col items-end">
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">System</span>
              <div className="flex gap-1 mt-1">
                 {[1,2,3].map(i => <div key={i} className="w-2 h-1 bg-primary" />)}
              </div>
           </div>
           
           <button className="h-9 px-4 bg-white/[0.03] border border-white/10 hover:border-primary hover:bg-primary/10 text-white hover:text-primary transition-all font-mono text-[10px] uppercase tracking-widest relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
             <span className="relative z-10">START</span>
           </button>
        </div>
      </div>
    </nav>
  );
};

