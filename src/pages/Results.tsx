
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ArrowLeft, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile, useViewportWidth } from "@/hooks/use-mobile";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface DocumentationResult {
  textContent: string;
  visualContent?: string;
}

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState<DocumentationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const viewportWidth = useViewportWidth();
  const isSmallScreen = viewportWidth ? viewportWidth < 640 : false;
  const documentRef = useRef<HTMLDivElement>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

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

  const downloadPDF = async () => {
    if (!result || !documentRef.current) return;
    
    try {
      setExportingPdf(true);
      toast.info("Generating PDF...");
      
      // Create a temporary styled div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      
      // Add content to the temporary div
      tempDiv.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 30px;">Project Documentation</h1>
        <div style="margin-bottom: 40px;">
          ${result.textContent.split('\n').map(line => {
            if (line.startsWith('# ')) {
              return `<h1 style="font-size: 24px; margin-top: 20px;">${line.replace('# ', '')}</h1>`;
            } else if (line.startsWith('## ')) {
              return `<h2 style="font-size: 20px; margin-top: 16px;">${line.replace('## ', '')}</h2>`;
            } else if (line.startsWith('- ')) {
              return `<li style="margin-left: 20px;">${line.replace('- ', '')}</li>`;
            } else if (line.startsWith('```')) {
              return line.includes('```typescript') ? 
                `<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace;">` : 
                '';
            } else if (line.endsWith('```')) {
              return `</pre>`;
            } else if (line.trim() === '') {
              return '<br />';
            } else {
              return `<p style="margin-bottom: 8px;">${line}</p>`;
            }
          }).join('')}
        </div>
      `;
      
      // If there's visual content, add it to the PDF
      if (result.visualContent) {
        tempDiv.innerHTML += `
          <div style="margin-top: 30px; page-break-before: always;">
            <h2 style="text-align: center; margin-bottom: 20px;">Visual Representation</h2>
            <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap;">${result.visualContent}</pre>
            <p style="text-align: center; color: #666; margin-top: 10px; font-size: 12px;">Mermaid.js diagram representation</p>
          </div>
        `;
      }
      
      // Append to document temporarily
      document.body.appendChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 1,
        useCORS: true,
        logging: false
      });
      
      // Calculate the number of pages needed
      const imgHeight = canvas.height * pageWidth / canvas.width;
      const totalPages = Math.ceil(imgHeight / pageHeight);
      
      // Add each canvas page to the PDF
      let remainingHeight = canvas.height;
      let position = 0;
      
      // Add the first page
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
      
      // If multiple pages, add them
      for (let i = 1; i < totalPages; i++) {
        position = -pageHeight * i;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      }
      
      // Save the PDF
      pdf.save('documentation.pdf');
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setExportingPdf(false);
    }
  };

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
            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button onClick={downloadMarkdown} className="flex-1 sm:flex-initial flex items-center gap-1 text-sm">
                <FileDown className="h-4 w-4" />
                Export as .md
              </Button>
              <Button 
                onClick={downloadPDF} 
                variant="outline" 
                className="flex-1 sm:flex-initial flex items-center gap-1 text-sm"
                disabled={exportingPdf}
              >
                <Download className="h-4 w-4" />
                {exportingPdf ? "Generating..." : "Export as PDF"}
              </Button>
            </div>
          </header>

          {result && (
            <div className="space-y-4" ref={documentRef}>
              {/* Text Content Panel */}
              <div className="border rounded-lg bg-white shadow-md overflow-hidden">
                <div className="p-3 h-full">
                  <h2 className="text-lg font-semibold mb-2 text-slate-800">Documentation Text</h2>
                  <ScrollArea className="h-[40vh]">
                    <div className="prose max-w-none p-2">
                      {result.textContent.split('\n').map((line, idx) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={idx} className="text-xl font-bold mt-3 mb-2">{line.replace('# ', '')}</h1>;
                        } else if (line.startsWith('## ')) {
                          return <h2 key={idx} className="text-lg font-semibold mt-3 mb-2">{line.replace('## ', '')}</h2>;
                        } else if (line.startsWith('- ')) {
                          return <li key={idx} className="ml-4 mb-1">{line.replace('- ', '')}</li>;
                        } else if (line.startsWith('```')) {
                          return line.includes('```typescript') ? 
                            <pre key={idx} className="bg-slate-100 p-2 rounded my-2 font-mono text-xs overflow-x-auto"></pre> : 
                            null;
                        } else if (line.endsWith('```')) {
                          return null;
                        } else if (line.trim() === '') {
                          return <br key={idx} />;
                        } else {
                          return <p key={idx} className="mb-2 text-sm">{line}</p>;
                        }
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Visual Content Panel */}
              <div className="border rounded-lg bg-white shadow-md overflow-hidden">
                <div className="p-3 h-full">
                  <h2 className="text-lg font-semibold mb-2 text-slate-800">Visual Representation</h2>
                  <ScrollArea className="h-[40vh]">
                    <div className="p-3 bg-slate-50 rounded-md h-full flex items-center justify-center">
                      {result.visualContent ? (
                        <div className="text-center">
                          <pre className="text-left text-[10px] sm:text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
                            {result.visualContent}
                          </pre>
                          <p className="text-xs text-slate-500 mt-3">
                            Visual diagram representation (Mermaid.js format)
                          </p>
                        </div>
                      ) : (
                        <div className="text-center text-slate-500">
                          <p className="text-sm">No visual content available for this documentation</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
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
            <Button onClick={downloadMarkdown} className="flex items-center gap-1">
              <FileDown className="h-4 w-4" />
              Export as .md
            </Button>
            <Button 
              onClick={downloadPDF} 
              variant="outline" 
              className="flex items-center gap-1"
              disabled={exportingPdf}
            >
              <Download className="h-4 w-4" />
              {exportingPdf ? "Generating..." : "Export as PDF"}
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
              <div className="p-4 h-full" ref={documentRef}>
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
                          Visual diagram representation (Mermaid.js format)
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
