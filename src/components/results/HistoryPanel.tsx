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
import { storage } from "@/lib/storage";

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

  const loadHistory = async () => {
    try {
      const entries = await storage.get<HistoryEntry[]>(STORAGE_KEYS.HISTORY);
      if (entries) {
        entries.sort((a, b) => b.generatedAt - a.generatedAt);
        setHistory(entries);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const deleteEntry = async (id: string) => {
    const updated = history.filter((entry) => entry.id !== id);
    setHistory(updated);
    await storage.set(STORAGE_KEYS.HISTORY, updated);
    toast.success("Entry deleted");
  };

  const clearHistory = async () => {
    setHistory([]);
    await storage.remove(STORAGE_KEYS.HISTORY);
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
          className="h-12 rounded-none border-white/10 hover:border-primary/40 bg-zinc-950 hover:bg-primary/5 text-[10px] font-mono uppercase tracking-[0.4em] px-8 group relative overflow-hidden industrial-border shadow-lg transition-all duration-300"
        >
          <History className="h-4 w-4 mr-3 group-hover:rotate-[-45deg] transition-transform text-white/40 group-hover:text-primary" />
          HISTORY_ARCHIVE
          {history.length > 0 && (
            <span className="ml-4 px-2 py-0.5 bg-primary text-black text-[9px] font-bold">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-black border-l border-white/10 w-full sm:max-w-2xl p-0 flex flex-col selection:bg-primary selection:text-black shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
        {/* Decorative background grid */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none opacity-[0.03] z-0">
          <div className="absolute inset-0 bg-[size:30px_30px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
        </div>

        <div className="p-10 border-b border-white/5 bg-white/[0.02] relative z-10">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-1.5 h-10 bg-primary" />
              <SheetTitle className="font-heading uppercase text-4xl font-black tracking-tighter text-white italic">ARCHIVE_LOG</SheetTitle>
           </div>
           <SheetDescription className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/40 leading-relaxed font-bold">
             // PERSISTENT_STORAGE_ACCESS_GRANTED
             <br />
             // READY_TO_FETCH_PREVIOUS_BUFS
           </SheetDescription>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-10 relative z-10">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10 grayscale">
              <Database size={64} className="mb-8" />
              <p className="font-heading font-black uppercase tracking-widest text-3xl">NULL_POINTER</p>
              <p className="font-mono text-[10px] uppercase mt-4 tracking-[0.4em]">NO_RECORDS_FOUND_IN_LOC_STORAGE</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-primary animate-pulse rounded-full" />
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ACTIVE_SESSIONS</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearHistory}
                  className="text-[9px] font-mono text-white/20 hover:text-red-500 uppercase tracking-widest hover:bg-transparent transition-colors"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  PURGE_ALL
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-6 custom-scrollbar">
                <div className="space-y-4 pb-12">
                  {history.map((entry) => (
                    <div 
                      key={entry.id}
                      className="group relative bg-white/[0.02] border border-white/5 p-6 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 cursor-pointer industrial-border overflow-hidden"
                      onClick={() => handleSelect(entry)}
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="text-[8px] font-mono text-primary animate-pulse font-bold tracking-widest">LOAD_PTR</div>
                      </div>

                      <div className="flex gap-6 items-start relative z-10">
                        <div className="w-12 h-12 flex-shrink-0 bg-black border border-white/5 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                          {entry.sourceType === "github" ? (
                            <Github className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                          ) : entry.sourceType === "zip" ? (
                            <FolderArchive className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                          ) : (
                            <FileText className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-heading font-black text-lg uppercase tracking-tight text-white/80 group-hover:text-white truncate pr-4 italic">
                               {entry.sourceName}
                             </h4>
                             <span className="text-[9px] font-mono text-white/20 whitespace-nowrap">
                               {formatDistanceToNow(entry.generatedAt, { addSuffix: true }).toUpperCase()}
                             </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="px-2 py-0.5 border border-white/5 bg-black text-[8px] font-mono text-white/40 group-hover:text-primary group-hover:border-primary/20 transition-colors">
                              {entry.provider?.toUpperCase()} / {entry.model?.toUpperCase()}
                            </div>
                            <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">
                              CRC: {entry.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-none opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
        
        <div className="p-8 border-t border-white/5 bg-white/[0.01] text-center z-10 relative">
            <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-white/10 font-bold">ENCRYPTION_STANDARD: AES-256_GCM_PROTOCOL</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Utility function to save a new entry to history
 */
export async function saveToHistory(
  result: DocumentationResult,
  sourceType: "github" | "zip",
  sourceName: string,
  provider: string,
  model: string
): Promise<void> {
  try {
    const stored = await storage.get<HistoryEntry[]>(STORAGE_KEYS.HISTORY);
    let history: HistoryEntry[] = stored || [];

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

    await storage.set(STORAGE_KEYS.HISTORY, history);
  } catch (error) {
    console.error("Failed to save to history:", error);
  }
}
