
import { toast } from "sonner";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationResult } from "@/types/documentation";

interface MarkdownExportProps {
  result: DocumentationResult;
}

const MarkdownExport = ({ result }: MarkdownExportProps) => {
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

  return (
    <Button onClick={downloadMarkdown} className="flex items-center gap-1">
      <FileDown className="h-4 w-4" />
      Export as .md
    </Button>
  );
};

export default MarkdownExport;
