import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { List, ChevronRight, Hash, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    headings.push({ id, text, level });
  }

  return headings;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    setHeadings(extractHeadings(content));
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className={cn("hidden lg:block", className)}>
      <div className="bg-zinc-950 border border-white/5 p-6 relative overflow-hidden group">
        {/* Dynamic accent line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="flex items-center gap-3 mb-6">
           <Layers size={14} className="text-primary" />
           <h3 className="font-heading font-black text-xs uppercase tracking-[0.3em] text-white">
              SECTOR_INDEX
           </h3>
        </div>

        <div className="space-y-1">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            
            return (
              <button
                key={`${heading.id}-${index}`}
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "w-full text-left group/item flex items-center gap-3 py-2 px-3 transition-all relative overflow-hidden",
                  isActive ? "bg-primary/10 text-primary" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                )}
                style={{
                  paddingLeft: `${(heading.level - 1) * 12 + 12}px`
                }}
              >
                {isActive && (
                   <motion.div 
                     layoutId="toc-active"
                     className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                   />
                )}
                
                <div className="font-mono text-[9px] opacity-20 group-hover/item:opacity-40 transition-opacity">
                   {index < 10 ? `0${index}` : index}
                </div>
                
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-widest truncate transition-all",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {heading.text}
                </span>

                {isActive && (
                   <div className="ml-auto">
                      <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                   </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Technical Labels */}
        <div className="mt-8 pt-4 border-t border-white/5 flex flex-col gap-2">
           <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/20">
              <span>Nodes_Mapped</span>
              <span>{headings.length}</span>
           </div>
           <div className="flex justify-between font-mono text-[8px] uppercase tracking-widest text-white/20">
              <span>Scroll_Sync</span>
              <span className="text-primary/40">Active</span>
           </div>
        </div>
      </div>
    </nav>
  );
}
