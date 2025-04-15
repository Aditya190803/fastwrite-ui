
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationResult } from "@/types/documentation";
import mermaid from "mermaid";

interface PdfExportProps {
  result: DocumentationResult;
  disabled?: boolean;
}

// Initialize mermaid once at module level for PDF export
let pdfMermaidInitialized = false;
const initializePdfMermaid = () => {
  if (!pdfMermaidInitialized) {
    mermaid.initialize({ 
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    pdfMermaidInitialized = true;
  }
};

const PdfExport = ({ result, disabled = false }: PdfExportProps) => {
  const [exportingPdf, setExportingPdf] = useState(false);

  const extractMermaidBlocks = (markdown: string) => {
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const blocks: { content: string; position: number }[] = [];
    
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        content: match[1].trim(),
        position: match.index
      });
    }
    
    return blocks;
  };

  const renderMermaidDiagram = async (diagram: string): Promise<string> => {
    try {
      // Initialize mermaid only once
      initializePdfMermaid();
      
      const id = `mermaid-pdf-${Math.random().toString(36).substring(2, 9)}`;
      const { svg } = await mermaid.render(id, diagram);
      return svg;
    } catch (error) {
      console.error("Failed to render mermaid diagram for PDF:", error);
      return `<div style="color: red; padding: 10px; border: 1px solid red;">Failed to render diagram</div>`;
    }
  };

  const downloadPDF = async () => {
    if (!result) return;
    
    try {
      setExportingPdf(true);
      toast.info("Generating PDF...");
      
      // Extract mermaid blocks
      const mermaidBlocks = extractMermaidBlocks(result.textContent);
      const renderedDiagrams: { content: string; svg: string; position: number }[] = [];
      
      // Pre-render all mermaid diagrams
      for (const block of mermaidBlocks) {
        const svg = await renderMermaidDiagram(block.content);
        renderedDiagrams.push({
          content: block.content,
          svg,
          position: block.position
        });
      }
      
      // Create a temporary styled div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.className = 'pdf-export';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      
      // Process the markdown and insert rendered diagrams
      let processedMarkdown = result.textContent;
      // Remove any potential ```markdown tags at the beginning
      processedMarkdown = processedMarkdown.replace(/^```markdown\n/, '');
      
      // Replace mermaid blocks with placeholders
      renderedDiagrams.forEach((diagram, index) => {
        const mermaidBlock = `\`\`\`mermaid\n${diagram.content}\`\`\``;
        const placeholder = `MERMAID_PLACEHOLDER_${index}`;
        processedMarkdown = processedMarkdown.replace(mermaidBlock, placeholder);
      });
      
      // Convert markdown to HTML for the PDF
      let htmlContent = processedMarkdown.split('\n').map(line => {
        if (line.startsWith('# ')) {
          return `<h1 style="font-size: 24px; margin-top: 20px;">${line.replace('# ', '')}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 style="font-size: 20px; margin-top: 16px;">${line.replace('## ', '')}</h2>`;
        } else if (line.startsWith('- ')) {
          return `<li style="margin-left: 20px;">${line.replace('- ', '')}</li>`;
        } else if (line.startsWith('```') && !line.includes('mermaid')) {
          return line.includes('```typescript') ? 
            `<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace;">` : 
            '';
        } else if (line.endsWith('```') && !line.includes('mermaid')) {
          return `</pre>`;
        } else if (line.trim() === '') {
          return '<br />';
        } else {
          // Check for mermaid placeholders
          for (let i = 0; i < renderedDiagrams.length; i++) {
            if (line.includes(`MERMAID_PLACEHOLDER_${i}`)) {
              return `<div style="margin: 20px 0; text-align: center;">${renderedDiagrams[i].svg}</div>`;
            }
          }
          return `<p style="margin-bottom: 8px;">${line}</p>`;
        }
      }).join('');
      
      // Add content to the temporary div
      tempDiv.innerHTML = `
        <h1 style="text-align: center; margin-bottom: 30px;">Project Documentation</h1>
        <div style="margin-bottom: 40px;">
          ${htmlContent}
        </div>
      `;
      
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

  return (
    <Button 
      onClick={downloadPDF} 
      variant="outline" 
      className="flex items-center gap-1"
      disabled={disabled || exportingPdf}
    >
      <Download className="h-4 w-4" />
      {exportingPdf ? "Generating..." : "Export as PDF"}
    </Button>
  );
};

export default PdfExport;
