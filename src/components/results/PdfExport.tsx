
import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationResult } from "@/types/documentation";

interface PdfExportProps {
  result: DocumentationResult;
  disabled?: boolean;
}

const PdfExport = ({ result, disabled = false }: PdfExportProps) => {
  const [exportingPdf, setExportingPdf] = useState(false);

  const downloadPDF = async () => {
    if (!result) return;
    
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
