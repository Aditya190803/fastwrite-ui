
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code, FileText, Github, Package } from "lucide-react";

export const MainHeader = () => {
  return (
    <header className="bg-[#1C2D41] text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <a 
            href="https://fastwrite.kjsieit.com" 
            className="flex items-center"
          >
            <BookOpen className="h-6 w-6 mr-2 text-[#F6B72E]" />
            <span className="text-xl font-bold">FastWrite UI</span>
          </a>
        </div>
        
        <nav className="flex items-center space-x-6">
          <a 
            href="https://fastwrite.kjsieit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:text-[#F6B72E] transition-colors"
          >
            <Code className="h-4 w-4 mr-1" />
            <span>Documentation</span>
          </a>
          <Link to="/results" className="flex items-center text-sm hover:text-[#F6B72E] transition-colors">
            <FileText className="h-4 w-4 mr-1" />
            <span>Results</span>
          </Link>
          <a 
            href="https://github.com/R-G-KJSIT/FastWrite/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:text-[#F6B72E] transition-colors"
          >
            <Github className="h-4 w-4 mr-1" />
            <span>GitHub</span>
          </a>
          <a 
            href="https://pypi.org/project/fastwrite/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:text-[#F6B72E] transition-colors"
          >
            <Package className="h-4 w-4 mr-1" />
            <span>PyPI</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

