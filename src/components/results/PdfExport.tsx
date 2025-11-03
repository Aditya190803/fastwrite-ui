
import { useState } from "react";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentationResult } from "@/types/documentation";
import { convertMermaidMarkdownToImages } from "@/lib/documentation";

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

      const { markdown } = await convertMermaidMarkdownToImages(result.textContent);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 18;
      const marginY = 20;
      const contentWidth = pageWidth - marginX * 2;
      const baseFontSize = 11;
      const ptToMm = 0.352777778;
      const pxToMm = 0.264583333;

      let cursorY = marginY;

      const ensureSpace = (height: number) => {
        if (cursorY + height > pageHeight - marginY) {
          pdf.addPage();
          cursorY = marginY;
        }
      };

      const writeTextBlock = (
        text: string,
        options?: {
          fontSize?: number;
          fontStyle?: "normal" | "bold" | "italic";
          indent?: number;
          lineGap?: number;
          fontName?: "helvetica" | "courier" | "times";
          bullet?: string;
        }
      ) => {
        const {
          fontSize = baseFontSize,
          fontStyle = "normal",
          indent = 0,
          lineGap = ptToMm * fontSize * 0.4,
          fontName = "helvetica",
          bullet,
        } = options || {};

        pdf.setFont(fontName, fontStyle);
        pdf.setFontSize(fontSize);

        const availableWidth = contentWidth - indent;
        const wrappedLines = pdf.splitTextToSize(text, availableWidth);
        const lineHeight = fontSize * ptToMm * 1.15;

        wrappedLines.forEach((line, index) => {
          ensureSpace(lineHeight);
          if (bullet && index === 0) {
            const bulletOffset = indent > 0 ? Math.max(0, indent - 4) : 0;
            pdf.text(bullet, marginX + bulletOffset, cursorY);
          }
          pdf.text(line, marginX + indent, cursorY);
          cursorY += lineHeight;
        });

        cursorY += lineGap;
      };

      const writeImageBlock = async (src: string, alt?: string) => {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load diagram for PDF"));
          img.src = src;
        });

        const naturalWidthMm = image.naturalWidth * pxToMm;
        const naturalHeightMm = image.naturalHeight * pxToMm;

        const maxWidth = contentWidth;
        const scale = Math.min(1, maxWidth / naturalWidthMm);
        const displayWidth = naturalWidthMm * scale;
        const displayHeight = naturalHeightMm * scale;

        ensureSpace(displayHeight + 6);
        const offsetX = marginX + (contentWidth - displayWidth) / 2;
        pdf.addImage(src, "PNG", offsetX, cursorY, displayWidth, displayHeight);
        cursorY += displayHeight + 4;

        if (alt) {
          writeTextBlock(alt, {
            fontSize: baseFontSize - 1,
            fontStyle: "italic",
            lineGap: ptToMm * baseFontSize * 0.2,
          });
        }
      };

      const writeCodeBlock = (code: string) => {
        const fontSize = baseFontSize - 1;
        const paddingX = 3;
        const paddingY = 3;
        const lineHeight = fontSize * ptToMm * 1.25;
        const lines = code.split("\n").flatMap((line) =>
          line ? pdf.splitTextToSize(line, contentWidth - paddingX * 2) : [" "]
        );
        const blockHeight = lines.length * lineHeight + paddingY * 2;

        ensureSpace(blockHeight + ptToMm * fontSize * 0.3);
        pdf.setFillColor(245, 247, 250);
        pdf.rect(marginX, cursorY, contentWidth, blockHeight, "F");

        pdf.setFont("courier", "normal");
        pdf.setFontSize(fontSize);
        let lineCursor = cursorY + paddingY + lineHeight;
        lines.forEach((line) => {
          pdf.text(line, marginX + paddingX, lineCursor);
          lineCursor += lineHeight;
        });
        cursorY += blockHeight + ptToMm * fontSize * 0.4;
      };

      type Block =
        | { type: "heading"; level: number; text: string }
        | { type: "paragraph"; text: string }
        | { type: "unordered-list"; items: string[] }
        | { type: "ordered-list"; items: { index: number; text: string }[] }
        | { type: "code"; content: string }
        | { type: "image"; alt: string; src: string }
        | { type: "blockquote"; text: string };

      const blocks: Block[] = [];
      const lines = markdown.replace(/\r\n/g, "\n").split("\n");
      let pointer = 0;

      const isListLine = (line: string) => /^[-*+]\s+/.test(line.trim());
      const isOrderedListLine = (line: string) => /^\d+\.\s+/.test(line.trim());

      while (pointer < lines.length) {
        const rawLine = lines[pointer];
        if (!rawLine.trim()) {
          pointer += 1;
          continue;
        }

        if (rawLine.trim().startsWith("```")) {
          pointer += 1;
          const codeLines: string[] = [];
          while (pointer < lines.length && !lines[pointer].trim().startsWith("```")) {
            codeLines.push(lines[pointer]);
            pointer += 1;
          }
          if (pointer < lines.length) {
            pointer += 1;
          }
          blocks.push({ type: "code", content: codeLines.join("\n") });
          continue;
        }

        const headingMatch = rawLine.match(/^(#{1,3})\s+(.*)$/);
        if (headingMatch) {
          blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2].trim() });
          pointer += 1;
          continue;
        }

        const imageMatch = rawLine.match(/^!\[(.*?)\]\((.+?)(?:\s+"(.*?)")?\)$/);
        if (imageMatch) {
          blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
          pointer += 1;
          continue;
        }

        if (rawLine.trim().startsWith(">")) {
          const quoteLines: string[] = [];
          while (pointer < lines.length && lines[pointer].trim().startsWith(">")) {
            quoteLines.push(lines[pointer].replace(/^>\s?/, ""));
            pointer += 1;
          }
          blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
          continue;
        }

        if (isOrderedListLine(rawLine)) {
          const items: { index: number; text: string }[] = [];
          while (pointer < lines.length && isOrderedListLine(lines[pointer])) {
            const match = lines[pointer].match(/^(\d+)\.\s+(.*)$/);
            if (match) {
              items.push({ index: Number.parseInt(match[1], 10), text: match[2] });
            }
            pointer += 1;
          }
          blocks.push({ type: "ordered-list", items });
          continue;
        }

        if (isListLine(rawLine)) {
          const items: string[] = [];
          while (pointer < lines.length && isListLine(lines[pointer])) {
            items.push(lines[pointer].replace(/^[-*+]\s+/, ""));
            pointer += 1;
          }
          blocks.push({ type: "unordered-list", items });
          continue;
        }

        const paragraphLines: string[] = [rawLine.trim()];
        pointer += 1;
        while (
          pointer < lines.length &&
          lines[pointer].trim() &&
          !lines[pointer].trim().startsWith("#") &&
          !lines[pointer].trim().startsWith("!") &&
          !lines[pointer].trim().startsWith(">") &&
          !lines[pointer].trim().startsWith("```") &&
          !isListLine(lines[pointer]) &&
          !isOrderedListLine(lines[pointer])
        ) {
          paragraphLines.push(lines[pointer].trim());
          pointer += 1;
        }
        blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
      }

      for (const block of blocks) {
        switch (block.type) {
          case "heading": {
            const size = block.level === 1 ? 20 : block.level === 2 ? 16 : 14;
            const gap = ptToMm * size * 0.3;
            writeTextBlock(block.text, {
              fontSize: size,
              fontStyle: "bold",
              lineGap: gap,
            });
            break;
          }
          case "paragraph": {
            writeTextBlock(block.text, {
              fontSize: baseFontSize,
              lineGap: ptToMm * baseFontSize * 0.7,
            });
            break;
          }
          case "unordered-list": {
            block.items.forEach((item) => {
              writeTextBlock(item, {
                indent: 6,
                bullet: "-",
                fontSize: baseFontSize,
                lineGap: ptToMm * baseFontSize * 0.4,
              });
            });
            cursorY += ptToMm * baseFontSize * 0.3;
            break;
          }
          case "ordered-list": {
            block.items.forEach((item) => {
              writeTextBlock(item.text, {
                indent: 10,
                bullet: `${item.index}.`,
                fontSize: baseFontSize,
                lineGap: ptToMm * baseFontSize * 0.4,
              });
            });
            cursorY += ptToMm * baseFontSize * 0.3;
            break;
          }
          case "code": {
            writeCodeBlock(block.content);
            break;
          }
          case "image": {
            await writeImageBlock(block.src, block.alt);
            cursorY += ptToMm * baseFontSize * 0.2;
            break;
          }
          case "blockquote": {
            writeTextBlock(block.text, {
              fontStyle: "italic",
              indent: 6,
              lineGap: ptToMm * baseFontSize * 0.5,
            });
            cursorY += ptToMm * baseFontSize * 0.3;
            break;
          }
          default:
            break;
        }
      }

      pdf.save("documentation.pdf");

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
