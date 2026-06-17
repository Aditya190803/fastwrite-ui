
import React from "react";
import { Github, Mail } from "lucide-react";

export const MainFooter = () => {
  return (
    <footer className="bg-[#1C2D41] text-white py-6 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-heading font-black uppercase tracking-tighter mb-3">FASTWRITE</h3>
            <p className="text-xs font-mono uppercase tracking-tight text-gray-400">
              Technical documentation generator.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-heading font-black uppercase tracking-tighter mb-3">LINKS</h3>
            <ul className="space-y-2 font-mono text-[10px] uppercase tracking-widest">
              <li>
                <a 
                  href="https://fastwrite-py.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  Project
                </a>
              </li>
              <li>
                <a 
                  href="https://pypi.org/project/fastwrite" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  PyPi
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-heading font-black uppercase tracking-tighter mb-3">SOCIAL</h3>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/R-G-KJSIT/FastWrite/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:info@fastwrite.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-[#F6B72E] transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              © {new Date().getFullYear()} FastWrite. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

