import { useState } from "react";
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationResult } from "@/types/documentation";
import { convertMermaidMarkdownToImages } from "@/lib/documentation";

interface MarkdownExportProps {
  result: DocumentationResult;
}

const MarkdownExport = ({ result }: MarkdownExportProps) => {
  const [exporting, setExporting] = useState(false);

  const downloadMarkdown = async () => {
    if (!result) return;

    try {
      setExporting(true);

      const { markdown } = await convertMermaidMarkdownToImages(result.textContent);
      const exportContent = markdown || result.textContent;

      const element = document.createElement("a");
      const file = new Blob([exportContent], { type: "text/markdown" });
      element.href = URL.createObjectURL(file);
      element.download = "documentation.md";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Downloaded documentation as Markdown");
    } catch (error) {
      console.error("Failed to export Markdown:", error);
      toast.error("Failed to export Markdown");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button onClick={downloadMarkdown} className="flex items-center gap-1" disabled={exporting}>
      <FileDown className="h-4 w-4" />
      {exporting ? "Preparing..." : "Export as .md"}
    </Button>
  );
};

export default MarkdownExport;
