import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import MarkdownExport from "@/components/results/MarkdownExport";
import PdfExport from "@/components/results/PdfExport";
import { DocumentationResult } from "@/types/documentation";
import Mermaid from "@/components/shared/Mermaid";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  
  const extractMermaidBlocks = (markdown: string): string[] => {
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const matches: string[] = [];
    let match;
    
    while ((match = regex.exec(markdown)) !== null) {
      if (match[1]) {
        matches.push(match[1].trim());
      }
    }
    
    return matches;
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const storedResult = localStorage.getItem("documentationResult");

        if (storedResult) {
          const parsedResult = JSON.parse(storedResult) as DocumentationResult;
          setResult(parsedResult);
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
    };

    fetchResults();
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg md:text-xl text-slate-600">Loading documentation results...</div>
      </div>
    );
  }

  const renderVisual = () => {
    if (!result) return null;
    
    if (result.visualContent && result.visualContent.trim()) {
      return <Mermaid chart={result.visualContent.trim()} />;
    }
    
    const mermaidBlocks = extractMermaidBlocks(result.textContent);
    if (mermaidBlocks.length > 0) {
      return <Mermaid chart={mermaidBlocks[0]} />;
    }
    
    return (
      <div className="text-sm text-slate-600 p-4">
        <p className="italic">No visual diagram content available.</p>
      </div>
    );
  };

  const RenderHeader = () => (
    <header className="flex justify-between items-center mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <Link to="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Generator
          </Button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Documentation Results</h1>
      </div>
      <div className="flex gap-2">
        {result && <MarkdownExport result={result} />}
        {result && <PdfExport result={result} />}
      </div>
    </header>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-4">
        <div className="container mx-auto px-4">
          <RenderHeader />
          {result && (
            <div className="space-y-6">
              <div className="prose max-w-none bg-white rounded-lg p-4 shadow">
                <MarkdownRenderer content={result.textContent} />
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                {renderVisual()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6 md:py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <RenderHeader />
        {result && (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[70vh] border rounded-lg bg-white shadow-md overflow-hidden"
          >
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full p-4 overflow-y-auto">
                <MarkdownRenderer content={result.textContent} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full p-4 overflow-y-auto">
                {renderVisual()}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Results;
