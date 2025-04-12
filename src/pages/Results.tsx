import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile, useViewportWidth } from "@/hooks/use-mobile";
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
  const viewportWidth = useViewportWidth();
  const [markModeEnabled, setMarkModeEnabled] = useState(false);

  const toggleMarkMode = () => {
    setMarkModeEnabled(!markModeEnabled);
    if (!markModeEnabled) {
      toast.info("Mark Mode enabled. Click on text to highlight important parts.");
    }
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
    if (!result?.visualContent) return null;

    const trimmed = result.visualContent.trim();
    const isMermaid = trimmed.startsWith("```mermaid");
    const isGraphviz = trimmed.startsWith("```dot") || trimmed.startsWith("```graphviz");

    const extractCode = (block: string) => block.replace(/```[a-z]*\n?/i, "").replace(/```$/, "").trim();

    if (isMermaid) {
      return <Mermaid chart={extractCode(trimmed)} />;
    } else if (isGraphviz) {
      return (
        <div className="text-sm text-slate-700 font-mono p-4 border rounded bg-white">
          <p className="mb-2 font-semibold">Graphviz Output (not rendered):</p>
          <pre>{extractCode(trimmed)}</pre>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-slate-600 p-4">
          <p className="italic">No visual format recognized.</p>
        </div>
      );
    }
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
              <MarkdownRenderer content={result.textContent} />
              {renderVisual()}
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
            {result.visualContent && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <div className="h-full p-4 overflow-y-auto">{renderVisual()}</div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Results;
