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
      className="h-10 rounded-none border-white/10 hover:border-primary/40 bg-zinc-950 hover:bg-primary/5 text-[10px] font-mono uppercase tracking-[0.2em] px-4 group relative overflow-hidden" 
      disabled={exporting}
    >
      <div className="flex items-center gap-2 relative z-10">
        {exporting ? (
          <Loader2 size={12} className="animate-spin text-primary" />
        ) : (
          <FileDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
        )}
        <span>{exporting ? "Exporting..." : "Export MD"}</span>
      </div>
      {/* Mini scanline effect */}
      <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-linear pointer-events-none" />
    </Button>
  );
};

export default MarkdownExport;
