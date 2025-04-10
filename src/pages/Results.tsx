
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile, useViewportWidth } from "@/hooks/use-mobile";
import DocumentViewer from "@/components/results/DocumentViewer";
import VisualViewer from "@/components/results/VisualViewer";
import PdfExport from "@/components/results/PdfExport";
import MarkdownExport from "@/components/results/MarkdownExport";
import ApiKeyInput from "@/components/results/ApiKeyInput";
import { DocumentationResult } from "@/types/documentation";

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const viewportWidth = useViewportWidth();
  const [markModeEnabled, setMarkModeEnabled] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const handleApiKeySubmit = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    toast.success(`${model} selected with your API key`);
  };

  const toggleMarkMode = () => {
    setMarkModeEnabled(!markModeEnabled);
    if (!markModeEnabled) {
      toast.info("Mark Mode enabled. Click on text to highlight important parts.");
    }
  };

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
          visualContent: `graph TD;
    A[Client] --> B[API];
    B --> C[Authentication];
    B --> D[Data Processing];
    C --> E[Database];
    D --> E;
    D --> F[Report Generation];
    F --> A;`
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg md:text-xl text-slate-600">Loading documentation results...</div>
      </div>
    );
  }

  // For mobile devices, stack panels vertically
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-4">
        <div className="container mx-auto px-4">
          <header className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Generator
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900 w-full sm:w-auto">Documentation Results</h1>
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 flex-wrap">
              <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
              {result && <MarkdownExport result={result} />}
              {result && <PdfExport result={result} />}
            </div>
          </header>

          {result && (
            <div className="space-y-4">
              {/* Text Content Panel */}
              <DocumentViewer 
                content={result.textContent} 
                isMobile={true}
                markModeEnabled={markModeEnabled}
                onToggleMarkMode={toggleMarkMode}
              />

              {/* Visual Content Panel */}
              <VisualViewer 
                visualContent={result.visualContent} 
                isMobile={true} 
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // For desktop/tablet view
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-6 md:py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <header className="flex justify-between items-center mb-6">
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
            <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />
            {result && <MarkdownExport result={result} />}
            {result && <PdfExport result={result} />}
          </div>
        </header>

        {result && (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-[70vh] border rounded-lg bg-white shadow-md overflow-hidden"
          >
            {/* Text Content Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <DocumentViewer 
                content={result.textContent}
                markModeEnabled={markModeEnabled}
                onToggleMarkMode={toggleMarkMode}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Visual Content Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <VisualViewer visualContent={result.visualContent} />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Results;
