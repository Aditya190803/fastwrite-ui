
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
import { HistoryPanel } from "@/components/results/HistoryPanel";
import VisualViewer from "@/components/results/VisualViewer";
import { DocumentationResult } from "@/types/documentation";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { TableOfContents } from "@/components/shared/TableOfContents";
import { cleanGeneratedText } from "@/lib/documentation";
import { STORAGE_KEYS } from "@/lib/constants";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "visual">("text");
  const isMobile = useIsMobile();

  const loadResult = useCallback(() => {
    try {
      const storedResult = localStorage.getItem(STORAGE_KEYS.DOCUMENTATION_RESULT);

      if (storedResult) {
        const parsedResult = JSON.parse(storedResult) as DocumentationResult;
        // Remove any ```markdown tag that might be at the beginning
        if (parsedResult.textContent.startsWith("```markdown\n")) {
          parsedResult.textContent = parsedResult.textContent.replace(/^```markdown\n/, '');
        }
        parsedResult.textContent = cleanGeneratedText(parsedResult.textContent);
        setResult(parsedResult);
        setEditContent(parsedResult.textContent);
      } else {
        toast.error("No documentation results found. Please generate documentation first.");
        setResult({
          textContent: "# No Documentation Results Found\n\nPlease go back to the generator page and create documentation first.",
          visualContent: ""
        });
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
        try {
          localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(updatedResult));
        } catch (storageError) {
          console.error("Failed to persist updated diagram:", storageError);
        }
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

  const handleSaveEdit = () => {
    if (result) {
      const updatedResult = { ...result, textContent: editContent };
      setResult(updatedResult);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(updatedResult));
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

  const handleSelectFromHistory = (historyResult: DocumentationResult) => {
    setResult(historyResult);
    setEditContent(historyResult.textContent);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(historyResult));
    toast.success("Loaded documentation from history");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg md:text-xl text-slate-600">Loading documentation results...</div>
      </div>
    );
  }

  const RenderHeader = () => (
    <header className="flex justify-between items-center mb-12 flex-wrap gap-6 border-b border-white/10 pb-8">
      <div className="flex flex-col gap-2">
        <Link to="/" className="text-[10px] font-mono text-primary flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          <ArrowLeft className="h-3 w-3" />
          BACK
        </Link>
        <h1 className="text-4xl md:text-6xl font-heading font-black text-white uppercase tracking-tighter">
          DOCUMENT
        </h1>
      </div>
      <div className="flex gap-4 flex-wrap items-center">
        <HistoryPanel onSelectEntry={handleSelectFromHistory} />
        <div className="h-8 w-px bg-white/10 mx-2" />
        {!isEditing ? (
          <Button variant="outline" size="lg" onClick={handleStartEdit} className="border-primary/20 hover:border-primary">
            <Edit2 className="h-4 w-4 mr-2" />
            EDIT
          </Button>
        ) : (
          <>
            <Button variant="outline" size="lg" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              CANCEL
            </Button>
            <Button size="lg" onClick={handleSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              SAVE
            </Button>
          </>
        )}
        <div className="flex gap-2">
          {result && !isEditing && <MarkdownExport result={result} />}
          {result && !isEditing && <PdfExport result={result} />}
          {result && !isEditing && <HtmlExport result={result} />}
        </div>
      </div>
    </header>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen py-8 px-4 bg-background relative selection:bg-primary selection:text-black">
        <RenderHeader />
        {result && (
          <div className="space-y-8">
            {result.visualContent && !isEditing && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "visual")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-kinetic-surface border border-white/5 p-1">
                  <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-bold uppercase text-[10px]">
                    TEXT
                  </TabsTrigger>
                  <TabsTrigger value="visual" className="data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-bold uppercase text-[10px]">
                    DIAGRAM
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-kinetic-surface border border-white/5 p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-3xl rounded-full" />
              {isEditing ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[70vh] font-mono text-sm bg-transparent border-0 focus-visible:ring-0 resize-none"
                />
              ) : activeTab === "text" || !result.visualContent ? (
                <div className="prose prose-invert prose-primary max-w-none">
                  <MarkdownRenderer content={result.textContent} />
                </div>
              ) : (
                <VisualViewer visualContent={result.visualContent} isMobile />
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-8 bg-background relative selection:bg-primary selection:text-black">
      <div className="max-w-[1600px] mx-auto">
        <RenderHeader />
        {result && (
          <div className="flex gap-12">
            {!isEditing && activeTab === "text" && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block w-72 flex-shrink-0"
              >
                <div className="sticky top-32">
                   <div className="text-[10px] font-mono text-primary mb-4 tracking-widest">CONTENTS</div>
                   <TableOfContents content={result.textContent} />
                </div>
              </motion.div>
            )}
            
            <div className="flex-1 min-w-0">
              {result.visualContent && !isEditing && (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "text" | "visual")} className="mb-8">
                  <TabsList className="bg-kinetic-surface border border-white/10 p-1 inline-flex h-12">
                    <TabsTrigger value="text" className="px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest">
                      <FileText className="h-3 w-3 mr-2" />
                      TEXT
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-heading font-black uppercase text-[10px] tracking-widest">
                      <Image className="h-3 w-3 mr-2" />
                      DIAGRAM
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              
              <div className="relative">
                {activeTab === "text" || !result.visualContent ? (
                  <motion.div 
                    layout
                    className="bg-kinetic-surface border border-white/10 shadow-2xl relative overflow-hidden"
                  >
                    <div className="relative z-10 p-12 md:p-20">
                      {isEditing ? (
                        <div className="group relative">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[75vh] w-full font-mono text-base bg-transparent border-0 focus-visible:ring-0 resize-none leading-relaxed"
                            placeholder="Edit content..."
                          />
                          <div className="absolute bottom-4 right-4 text-[10px] font-mono text-primary opacity-50">UTF-8</div>
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-primary max-w-none prose-h1:font-heading prose-h1:font-black prose-h1:uppercase prose-h1:tracking-tighter prose-h1:text-6xl prose-h2:text-4xl prose-h2:font-heading prose-h2:uppercase">
                          <MarkdownRenderer content={result.textContent} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-kinetic-surface border border-white/10 p-12 rounded-none min-h-[70vh] flex items-center justify-center overflow-hidden"
                  >
                    <VisualViewer visualContent={result.visualContent} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Minimal status bar */}
      <div className="fixed bottom-0 left-0 w-full h-8 bg-black border-t border-white/10 flex items-center px-6 justify-between text-[8px] font-mono text-muted-foreground uppercase tracking-widest z-50">
        <div className="flex gap-8">
           <span>FastWrite</span>
        </div>
      </div>
    </div>
  );
};

export default Results;
