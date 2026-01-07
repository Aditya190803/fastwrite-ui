import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, FileText, Github, FolderArchive, Database, ArrowRight } from "lucide-react";
import { HistoryEntry, DocumentationResult } from "@/types/documentation";
import { STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";

interface HistoryPanelProps {
  onSelectEntry: (result: DocumentationResult) => void;
}

const MAX_HISTORY_ENTRIES = 20;

export function HistoryPanel({ onSelectEntry }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (stored) {
        const entries = JSON.parse(stored) as HistoryEntry[];
        entries.sort((a, b) => b.generatedAt - a.generatedAt);
        setHistory(entries);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter((entry) => entry.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    toast.success("Entry deleted");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    toast.success("History cleared");
  };

  const handleSelect = (entry: HistoryEntry) => {
    onSelectEntry(entry.result);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 rounded-none border-white/10 hover:border-primary/40 bg-zinc-950 hover:bg-primary/5 text-[10px] font-mono uppercase tracking-[0.2em] px-4 group relative"
        >
          <History className="h-3 w-3 mr-2 group-hover:rotate-[-45deg] transition-transform" />
          History
          {history.length > 0 && (
            <span className="ml-3 px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[8px] font-bold">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-zinc-950 border-l border-white/10 w-full sm:max-w-xl p-0 flex flex-col">
        <div className="p-8 border-b border-white/5 bg-black/40">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-7 bg-primary" />
              <SheetTitle className="font-heading uppercase text-2xl font-black tracking-tighter text-white">History</SheetTitle>
           </div>
           <SheetDescription className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
             Access your previous documentation generations and saved results.
           </SheetDescription>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-8">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
              <Database size={48} className="mb-6" />
              <p className="font-heading font-bold uppercase tracking-widest">No History</p>
              <p className="font-mono text-[10px] uppercase mt-2">No generations found in history</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Saved Generations</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="font-mono text-[9px] uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 px-4"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Clear All
                </Button>
              </div>

              <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className="group relative bg-white/5 border border-white/5 p-4 hover:border-primary/40 hover:bg-white/[0.08] transition-all cursor-pointer"
                      onClick={() => handleSelect(entry)}
                    >
                      {/* Technical accents */}
                      <div className="absolute top-0 right-0 w-8 h-[1px] bg-primary/20" />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-black/40 border border-white/5 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                            {entry.sourceType === "github" ? (
                              <Github size={14} />
                            ) : (
                              <FolderArchive size={14} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white truncate max-w-[240px]">
                              {entry.sourceName}
                            </h4>
                            <div className="flex gap-2 font-mono text-[8px] uppercase tracking-widest text-muted-foreground/60 mt-1">
                               <span className="text-primary/60">{entry.provider}</span>
                               <span>•</span>
                               <span>{entry.model}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                         <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">
                            {formatDistanceToNow(entry.generatedAt, { addSuffix: true }).toUpperCase()}
                         </div>
                         <div className="flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Retrieve_State
                            <ArrowRight size={10} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20 text-center">
            <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/20">Encryption_Standard: AES-256_LOCAL</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Utility function to save a new entry to history
 */
export function saveToHistory(
  result: DocumentationResult,
  sourceType: "github" | "zip",
  sourceName: string,
  provider: string,
  model: string
): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    let history: HistoryEntry[] = stored ? JSON.parse(stored) : [];

    const newEntry: HistoryEntry = {
      id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      result,
      sourceName,
      sourceType,
      generatedAt: Date.now(),
      provider,
      model,
    };

    // Add to beginning
    history.unshift(newEntry);

    // Keep only the most recent entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history = history.slice(0, MAX_HISTORY_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
}
