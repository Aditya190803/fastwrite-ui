import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Download, Loader2 } from "lucide-react";
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

      toast.success("MD_PROTOCOL_DOWNLOAD_STABLE");
    } catch (error) {
      console.error("Failed to export Markdown:", error);
      toast.error("MD_EXPORT_ERROR");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={downloadMarkdown} 
      className="h-12 rounded-none border-white/10 hover:border-primary/40 bg-zinc-950 hover:bg-primary/5 text-[10px] font-mono uppercase tracking-[0.2em] px-6 group relative overflow-hidden industrial-border transition-all duration-300" 
      disabled={exporting}
    >
      <div className="flex items-center gap-3 relative z-10">
        {exporting ? (
          <Loader2 size={12} className="animate-spin text-primary" />
        ) : (
          <FileDown size={14} className="text-white/40 group-hover:text-primary transition-colors duration-300" />
        )}
        <span className="group-hover:text-primary transition-colors duration-300">
          {exporting ? "EXPORTING..." : "MD_SPEC_EXPORT"}
        </span>
      </div>
      
      {/* Decorative hover line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
    </Button>
  );
};

export default MarkdownExport;
