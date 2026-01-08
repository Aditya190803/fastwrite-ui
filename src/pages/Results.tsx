
import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft, Edit2, Save, X, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import MarkdownExport from "@/components/results/MarkdownExport";
import PdfExport from "@/components/results/PdfExport";
import HtmlExport from "@/components/results/HtmlExport";
import LatexExport from "@/components/results/LatexExport";
import { HistoryPanel } from "@/components/results/HistoryPanel";
import VisualViewer from "@/components/results/VisualViewer";
import { DocumentationResult } from "@/types/documentation";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { TableOfContents } from "@/components/shared/TableOfContents";
import { cleanGeneratedText } from "@/lib/documentation";
import { STORAGE_KEYS } from "@/lib/constants";
import { storage } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "visual">("text");
  const [mobileEditTab, setMobileEditTab] = useState<"edit" | "preview">("edit");
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleNodeClick = (e: any) => {
      const { label } = e.detail;
      if (!label) return;

      // Ensure we're viewing text
      setActiveTab("text");

      // Small delay to allow tab switch to complete if needed
      setTimeout(() => {
        const id = label.toLowerCase().replace(/[^\w]+/g, '-');
        const element = document.getElementById(id);
        
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-black', 'rounded-sm', 'transition-all');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-black');
          }, 3000);
        } else {
          // Alternative search: look for content including the label
          const prose = document.querySelector('.prose');
          if (prose) {
            const children = Array.from(prose.querySelectorAll('h1, h2, h3, h4, p, li'));
            const match = children.find(child => child.textContent?.toLowerCase().includes(label.toLowerCase()));
            if (match) {
              match.scrollIntoView({ behavior: 'smooth', block: 'center' });
              match.classList.add('bg-primary/10', 'transition-colors');
              setTimeout(() => match.classList.remove('bg-primary/10'), 3000);
            }
          }
        }
      }, 100);
    };

    window.addEventListener('mermaid:node-click', handleNodeClick as EventListener);
    return () => window.removeEventListener('mermaid:node-click', handleNodeClick as EventListener);
  }, [activeTab]);

  const loadResult = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedResult = await storage.get<DocumentationResult>(STORAGE_KEYS.DOCUMENTATION_RESULT);

      if (storedResult) {
        const parsedResult = storedResult;
        // Remove any ```markdown tag that might be at the beginning
        if (parsedResult.textContent.startsWith("```markdown\n")) {
          parsedResult.textContent = parsedResult.textContent.replace(/^```markdown\n/, '');
        }
        parsedResult.textContent = cleanGeneratedText(parsedResult.textContent);
        setResult(parsedResult);
        setEditContent(parsedResult.textContent);
      } else {
        setResult(null);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load documentation results");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResult();
  }, [location, loadResult]);

  useEffect(() => {
    const handleDiagramUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ previous: string; next: string }>;
      const { previous, next } = customEvent.detail || {};
      if (!previous || !next) {
        return;
      }

      setResult((current) => {
        if (!current || !current.textContent || !current.textContent.includes(previous)) {
          return current;
        }

        const updatedText = current.textContent.replace(previous, next);
        if (updatedText === current.textContent) {
          return current;
        }

        const updatedResult = { ...current, textContent: updatedText };
        storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, updatedResult).catch(storageError => {
          console.error("Failed to persist updated diagram:", storageError);
        });
        return updatedResult;
      });
    };

    window.addEventListener("documentation:diagram-updated", handleDiagramUpdate as EventListener);
    return () => {
      window.removeEventListener("documentation:diagram-updated", handleDiagramUpdate as EventListener);
    };
  }, []);

  const handleStartEdit = () => {
    if (result) {
      setEditContent(result.textContent);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (result) {
      const updatedResult = { ...result, textContent: editContent };
      setResult(updatedResult);
      await storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, updatedResult);
      setIsEditing(false);
      toast.success("Documentation updated successfully");
    }
  };

  const handleCancelEdit = () => {
    if (result) {
      setEditContent(result.textContent);
    }
    setIsEditing(false);
  };

  const handleSelectFromHistory = async (historyResult: DocumentationResult) => {
    setResult(historyResult);
    setEditContent(historyResult.textContent);
    await storage.set(STORAGE_KEYS.DOCUMENTATION_RESULT, historyResult);
    toast.success("Loaded documentation from history");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse text-lg md:text-xl text-primary/80 font-mono tracking-[0.5em] italic">INITIALIZING_BUFFER...</div>
      </div>
    );
  }

  const RenderHeader = () => (
    <header className="flex justify-between items-center mb-10 flex-wrap gap-8 border-b border-white/5 pb-8 relative group">
      {/* Decorative background label */}
      <div className="absolute -top-6 -left-4 text-[60px] font-black text-white/[0.04] select-none pointer-events-none uppercase tracking-tighter">
        OUTPUT_CORE
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <Link to="/" className="group/back flex items-center gap-3 w-fit">
          <div className="w-8 h-8 rounded-full border border-primary/20 flex items-center justify-center group-hover/back:bg-primary group-hover/back:border-primary transition-all duration-300">
            <ArrowLeft className="h-4 w-4 text-primary group-hover/back:text-black transition-colors" />
          </div>
          <span className="text-[10px] font-mono text-primary/80 group-hover/back:text-primary uppercase tracking-[0.4em] font-bold transition-colors">
            RETURN_TO_CORE
          </span>
        </Link>
        <div className="flex items-baseline gap-4">
           <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter leading-none italic">
            DOCUMENT
          </h1>
          <div className="hidden md:block w-32 h-[2px] bg-primary animate-pulse" />
          <span className="hidden md:block font-mono text-xs text-primary/60 uppercase tracking-widest">v2.0.4_RELEASE</span>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap items-center relative z-10">
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-6 py-3 industrial-border mr-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="font-mono text-[10px] text-primary uppercase tracking-widest">SYSTEM_OPTIMIZED</span>
        </div>
        
        <HistoryPanel onSelectEntry={handleSelectFromHistory} />
        
        <div className="h-10 w-px bg-white/20 mx-2" />
        
        {!isEditing ? (
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleStartEdit} 
            className="border-primary/20 hover:border-primary hover:bg-primary hover:text-black font-mono text-xs tracking-widest px-8 h-12 rounded-none transition-all duration-500 industrial-border group/btn"
          >
            <Edit2 className="h-4 w-4 mr-3 group-hover/btn:rotate-12 transition-transform" />
            MANUAL_OVERRIDE
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleCancelEdit}
              className="border-white/10 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 font-mono text-xs tracking-widest px-8 h-12 rounded-none transition-all duration-500"
            >
              <X className="h-4 w-4 mr-3" />
              ABORT
            </Button>
            <Button 
              size="lg" 
              onClick={handleSaveEdit}
              className="bg-primary hover:bg-white text-black font-mono text-xs tracking-widest px-8 h-12 rounded-none transition-all duration-500"
            >
              <Save className="h-4 w-4 mr-3" />
              COMMIT_CHANGES
            </Button>
          </div>
        )}

        <div className="flex gap-2 ml-4">
          {result && !isEditing && (
            <div className="flex gap-2 bg-white/[0.02] p-1 border border-white/5">
              <MarkdownExport result={result} />
              <LatexExport result={result} />
              <PdfExport result={result} />
              <HtmlExport result={result} />
            </div>
          )}
        </div>
      </div>
    </header>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen py-12 px-6 bg-background relative selection:bg-primary selection:text-black overflow-hidden">
        {/* Background Grid Layer */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
          <div className="absolute inset-0 bg-[size:30px_30px] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]" />
        </div>

        <RenderHeader />
        
        {result ? (
          <div className="space-y-8 relative z-10">
            {result.visualContent && !isEditing && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "visual")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black border border-white/10 p-1 h-12 industrial-border">
                  <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest rounded-none">
                    TEXT_LOG
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest rounded-none">
                    DIAGRAM_RENDER
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 border border-white/5 p-8 relative overflow-hidden industrial-border"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              
              {isEditing ? (
                <div className="relative group">
                  <div className="absolute -top-4 -right-2 font-mono text-[8px] text-primary animate-pulse">LIVE_EDITOR_ACTIVE</div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[70vh] font-mono text-sm bg-transparent border-0 focus-visible:ring-0 resize-none p-0 leading-relaxed text-primary"
                  />
                </div>
              ) : activeTab === "text" || !result.visualContent ? (
                <div className="prose prose-invert prose-primary max-w-none prose-p:text-white/90 prose-headings:italic prose-h1:text-6xl prose-h1:tracking-tighter">
                  <MarkdownRenderer content={result.textContent} />
                </div>
              ) : (
                <VisualViewer visualContent={result.visualContent} isMobile />
              )}
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-12 relative z-10 px-4">
             <div className="w-24 h-24 border-2 border-primary/20 flex items-center justify-center industrial-border bg-primary/5">
                <X className="h-12 w-12 text-primary animate-pulse" />
             </div>
             <div className="space-y-6">
               <h2 className="text-4xl font-heading font-black text-white italic tracking-tighter uppercase leading-tight">NO_RESULTS_DETECTED</h2>
               <div className="w-20 h-[2px] bg-primary/40 mx-auto" />
               <p className="text-white/90 font-mono text-[10px] uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                 The output buffer is currently empty. System requires initial generation protocol.
               </p>
             </div>
             <Link to="/">
                <Button className="bg-primary hover:bg-white text-black font-heading font-black uppercase italic px-12 py-6 text-sm tracking-widest rounded-none industrial-border">
                  INITIALIZE_GENERATOR
                </Button>
             </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-10 bg-background relative selection:bg-primary selection:text-black overflow-hidden">
      {/* Background Grids */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[size:60px_60px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[size:300px_300px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_2px,transparent_2px)]" />
      </div>

      <div className="max-w-[1500px] mx-auto relative z-10">
        <RenderHeader />
        
        {result ? (
          <div className="flex gap-10">
            {!isEditing && activeTab === "text" && (
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block w-80 flex-shrink-0"
              >
                <div className="sticky top-32 space-y-8">
                   <div className="relative">
                      <div className="absolute -left-4 top-0 w-[2px] h-full bg-primary/20" />
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-primary" />
                        <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] font-bold">NAVIGATION_MAP</span>
                      </div>
                      <TableOfContents content={result.textContent} />
                   </div>
                   
                   <div className="pt-8 border-t border-white/10 space-y-4">
                      <div className="flex justify-between items-center text-[8px] font-mono text-white/80 uppercase tracking-widest">
                        <span>ENCODING</span>
                        <span>UTF-8 / NO_BOM</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-mono text-white/80 uppercase tracking-widest">
                        <span>CHECKSUM</span>
                        <span>0xB4A2F1</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}
            
            <div className="flex-1 min-w-0">
              {result.visualContent && !isEditing && (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "visual")} className="mb-12">
                  <TabsList className="bg-black border border-white/5 p-1 inline-flex h-14 industrial-border">
                    <TabsTrigger value="text" className="px-12 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[11px] tracking-[0.3em] rounded-none transition-all duration-300">
                      <FileText className="h-4 w-4 mr-3" />
                      TEXT_BUFFER
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="px-12 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[11px] tracking-[0.3em] rounded-none transition-all duration-300">
                      <Image className="h-4 w-4 mr-3" />
                      VISUAL_SCHEMA
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <div className="relative">
                {activeTab === "text" || !result.visualContent ? (
                  <motion.div 
                    layout
                    className="bg-black/30 border border-white/5 shadow-[0_40px_100px_-10px_rgba(0,0,0,0.8)] relative group industrial-border"
                  >
                    {/* Corner decorative element */}
                    <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-20">
                      <div className="absolute top-8 right-8 w-16 h-px bg-white" />
                      <div className="absolute top-8 right-8 w-px h-16 bg-white" />
                    </div>

                    <div className="relative z-10 p-12 md:p-16 lg:p-24">
                      {isEditing ? (
                        !isMobile ? (
                          <ResizablePanelGroup direction="horizontal" className="min-h-[75vh]">
                            <ResizablePanel defaultSize={45} minSize={30}>
                               <div className="group relative pr-8">
                                  <div className="absolute -top-12 left-0 flex items-center gap-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">UNSAVED_BUFFER</span>
                                  </div>
                                  <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[75vh] w-full font-mono text-base bg-transparent border-0 focus-visible:ring-0 resize-none leading-relaxed text-primary selection:bg-primary selection:text-black placeholder:text-white/20"
                                    placeholder="INITIALIZE INPUT STRATUM..."
                                  />
                               </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle className="bg-white/5 before:bg-primary/20" />
                            <ResizablePanel defaultSize={55} minSize={30}>
                               <div className="pl-8 prose prose-invert prose-primary max-w-none prose-h1:font-heading prose-h1:font-black prose-h1:uppercase prose-h1:tracking-tighter prose-h1:text-5xl prose-h1:italic prose-h1:mb-8 prose-p:text-lg prose-p:leading-relaxed prose-p:text-white/90 prose-h2:font-heading prose-h2:italic prose-h2:text-3xl scrollbar-hide">
                                  <MarkdownRenderer content={editContent} />
                               </div>
                            </ResizablePanel>
                          </ResizablePanelGroup>
                        ) : (
                          <div className="space-y-8">
                            <Tabs value={mobileEditTab} onValueChange={(v) => setMobileEditTab(v as "edit" | "preview")} className="w-full">
                              <TabsList className="bg-black border border-white/5 p-1 w-full h-12 industrial-border mb-6">
                                <TabsTrigger value="edit" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-[0.2em] rounded-none transition-all">
                                  BUFFER_INPUT
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex-1 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-[0.2em] rounded-none transition-all">
                                  LIVE_PREVIEW
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="edit" className="mt-0">
                                <div className="group relative">
                                  <div className="absolute -top-12 left-0 flex items-center gap-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                    <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">UNSAVED_BUFFER</span>
                                  </div>
                                  <Textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="min-h-[60vh] w-full font-mono text-base bg-transparent border-0 focus-visible:ring-0 resize-none leading-relaxed text-primary selection:bg-primary selection:text-black placeholder:text-white/20"
                                    placeholder="INITIALIZE INPUT STRATUM..."
                                  />
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="preview" className="mt-0">
                                <div className="prose prose-invert prose-primary max-w-none prose-h1:font-heading prose-h1:text-4xl prose-p:text-base prose-p:leading-relaxed">
                                  <MarkdownRenderer content={editContent} />
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        )
                      ) : (
                        <div className="prose prose-invert prose-primary max-w-none prose-h1:font-heading prose-h1:font-black prose-h1:uppercase prose-h1:tracking-tighter prose-h1:text-8xl prose-h1:italic prose-h1:mb-16 prose-p:text-xl prose-p:leading-relaxed prose-p:text-white/90 prose-h2:font-heading prose-h2:italic prose-h2:text-5xl">
                          <MarkdownRenderer content={result.textContent} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/30 border border-white/5 p-16 industrial-border min-h-[80vh] flex items-center justify-center overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <VisualViewer visualContent={result.visualContent} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-8 relative z-10 min-h-[60vh]">
             <div className="relative">
                <div className="w-16 h-16 border-2 border-primary/20 flex items-center justify-center industrial-border bg-primary/5">
                   <X className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-black border border-primary/40 flex items-center justify-center text-primary font-mono text-[10px]">!</div>
             </div>
             
             <div className="space-y-4 max-w-2xl mx-auto px-4">
               <h2 className="text-3xl md:text-5xl font-heading font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                 NO_RESULTS_FOUND
               </h2>
               <div className="w-full max-w-md mx-auto h-px bg-primary/40" />
               <p className="text-white/90 font-mono text-xs uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
                 The output core is currently disconnected. System requires documentation input before rendering. 
                 <br/>
                 <span className="text-primary font-bold">Status Code: 0x8A2_NULL_BUFFER</span>
               </p>
             </div>
             
             <div className="flex flex-col md:flex-row gap-6 items-center">
                <Link to="/">
                   <Button className="bg-primary hover:bg-white text-black font-heading font-black uppercase italic px-8 py-4 text-sm tracking-widest rounded-none industrial-border transition-all hover:scale-105 shadow-[0_0_30px_rgba(180,255,0,0.15)]">
                     INITIALIZE_GENERATOR
                   </Button>
                </Link>
                <div className="flex flex-col justify-center text-left border-l border-white/20 pl-6 h-12">
                   <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                     <div className="w-1 h-1 bg-white/40 rounded-full" />
                     System Latency: 0ms
                   </span>
                   <span className="text-[9px] font-mono text-white/60 uppercase tracking-widest flex items-center gap-2">
                     <div className="w-1 h-1 bg-white/40 rounded-full" />
                     Buffer State: Idle
                   </span>
                </div>
             </div>
          </div>
        )}
      </div>
      
      {/* Minimal status bar */}
      <div className="fixed bottom-0 left-0 w-full h-10 bg-black border-t border-white/10 flex items-center px-8 justify-between text-[9px] font-mono text-white/70 uppercase tracking-[0.5em] z-50">
        <div className="flex gap-12 items-center">
           <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              STATUS_OK
           </span>
           <span className="text-white/20">|</span>
           <span>LATENCY: 42MS</span>
           <span className="text-white/20">|</span>
           <span>LOC: {result?.textContent.split('\n').length || 0}</span>
        </div>
        <div className="hidden md:flex gap-8">
          <span>FASTWRITE_OS_v2.0</span>
          <span>(C) 2024 PRECISION_GEN</span>
        </div>
      </div>
    </div>
  );
};

export default Results;
