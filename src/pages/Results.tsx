
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ArrowLeft, FileDown } from "lucide-react";
import { toast } from "sonner";

interface DocumentationResult {
  textContent: string;
  visualContent?: string;
}

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, we would get the actual results from the state passed in location
    // or fetch them from an API using an ID passed in the URL
    const fetchResults = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockResult: DocumentationResult = {
          textContent: `# Project Documentation

## Abstract
This project implements a scalable API for managing user authentication and data processing.

## Introduction
The system is designed with a microservices architecture to ensure high availability and fault tolerance.

## Function Summaries
\`\`\`typescript
// authenticateUser: Verifies user credentials against the database
// processData: Handles incoming data and transforms it for storage
// generateReport: Creates custom reports based on stored data
\`\`\`

## Class Overviews
- **UserManager**: Handles user registration, authentication, and profile management
- **DataProcessor**: Processes incoming data streams and applies validation rules
- **ReportGenerator**: Generates various report formats based on processed data

## Methodology
The project follows a test-driven development approach, with comprehensive unit and integration tests.
`,
          visualContent: `digraph G {
  rankdir=LR;
  node [shape=box, style=filled, fillcolor=lightblue];
  
  Client -> API;
  API -> Authentication;
  API -> DataProcessing;
  Authentication -> Database;
  DataProcessing -> Database;
  DataProcessing -> ReportGeneration;
  ReportGeneration -> Client;
}`
        };
        
        setResult(mockResult);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to load documentation results");
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [location]);

  const downloadMarkdown = () => {
    if (!result) return;
    
    const element = document.createElement("a");
    const file = new Blob([result.textContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "documentation.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Downloaded documentation as Markdown");
  };

  const downloadPDF = () => {
    // This would be implemented in Phase 2
    toast.info("PDF export will be available in Phase 2");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-slate-600">Loading documentation results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Generator
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Documentation Results</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadMarkdown} className="flex items-center gap-1">
              <FileDown className="h-4 w-4" />
              Export as .md
            </Button>
            <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </header>

        {result && (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[70vh] border rounded-lg bg-white shadow-md overflow-hidden"
          >
            {/* Text Content Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Documentation Text</h2>
                <ScrollArea className="h-[calc(70vh-60px)]">
                  <div className="prose max-w-none p-2">
                    {result.textContent.split('\n').map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={idx} className="text-xl font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('- ')) {
                        return <li key={idx} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                      } else if (line.startsWith('```')) {
                        return line.includes('```typescript') ? 
                          <pre key={idx} className="bg-slate-100 p-3 rounded my-2 font-mono text-sm overflow-x-auto"></pre> : 
                          null;
                      } else if (line.endsWith('```')) {
                        return null;
                      } else if (line.trim() === '') {
                        return <br key={idx} />;
                      } else {
                        return <p key={idx} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Visual Content Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-3 text-slate-800">Visual Representation</h2>
                <ScrollArea className="h-[calc(70vh-60px)]">
                  <div className="p-4 bg-slate-50 rounded-md h-full flex items-center justify-center">
                    {result.visualContent ? (
                      <div className="text-center">
                        <pre className="text-left text-xs font-mono bg-white p-4 rounded border overflow-x-auto">
                          {result.visualContent}
                        </pre>
                        <p className="text-sm text-slate-500 mt-4">
                          Visual diagram representation (Graphviz output)
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <p>No visual content available for this documentation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Results;
