import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { renderMermaidSvg, sanitizeMermaidChart } from "@/lib/documentation";

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [displayChart, setDisplayChart] = useState(chart);
  const [repairAttempted, setRepairAttempted] = useState(false);
  const repairInFlight = useRef(false);

  useEffect(() => {
    setDisplayChart(chart);
    setRepairAttempted(false);
  }, [chart]);

  const requestDiagramRepair = useCallback(
    async (diagram: string): Promise<{ diagram: string | null; attempted: boolean }> => {
      let attempted = false;
      try {
        const metadataRaw = localStorage.getItem("documentationGenerationMeta");
        if (!metadataRaw) {
          return { diagram: null, attempted };
        }

        const metadata = JSON.parse(metadataRaw) as {
          provider?: string;
          model?: string;
          prompt?: string;
        };

        if (!metadata?.provider || !metadata?.model) {
          return { diagram: null, attempted };
        }

        const apiKey = localStorage.getItem(`apiKey_${metadata.provider}`);
        if (!apiKey) {
          return { diagram: null, attempted };
        }

        attempted = true;
        toast.info("Re-generating Mermaid diagram…");

        const repairPrompt = `You previously generated a Mermaid.js diagram that failed to render. Please correct the diagram syntax while preserving its meaning. Return only the fixed Mermaid code block with no extra commentary.\n\nContext: ${metadata.prompt ?? "Documentation generation"}\n\nOriginal diagram:\n\`\`\`mermaid\n${diagram}\n\`\`\``;

        const payload = {
          github_url: "NULL",
          zip_file: "NULL",
          llm_provider: metadata.provider,
          llm_model: metadata.model,
          api_key: apiKey,
          prompt: repairPrompt,
        };

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const response = await fetch("https://fastwrite-api.onrender.com/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          console.error("Diagram repair failed with status", response.status);
          return { diagram: null, attempted };
        }

        const data = await response.json();
        const candidate = data.text_content || data.documentation || data.visual_content || "";

        const blockMatch = typeof candidate === "string" ? candidate.match(/```mermaid[\s\S]*?```/) : null;
        if (blockMatch) {
          return {
            diagram: blockMatch[0]
              .replace(/^```mermaid\s*/i, "")
              .replace(/```$/i, "")
              .trim(),
            attempted,
          };
        }

        if (typeof candidate === "string" && candidate.trim()) {
          return { diagram: candidate.trim(), attempted };
        }

        return { diagram: null, attempted };
      } catch (error) {
        console.error("Failed to request diagram repair:", error);
        return { diagram: null, attempted };
      }
    }, []
  );

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    let cancelled = false;
    ref.current.innerHTML = "";

    const renderDiagram = async () => {
      if (!ref.current || cancelled) return;

      const fallback = (message: string, rawDiagram: string) => {
        if (!ref.current || cancelled) return;
        ref.current.innerHTML = `<div class=\"text-red-500 p-4 border border-red-300 rounded bg-red-50\">\n          <p class=\"font-semibold\">${message}</p>\n          <pre class=\"mt-2 text-xs overflow-auto\">${rawDiagram}</pre>\n        </div>`;
      };

      try {
        const { svg, chart: resolvedChart } = await renderMermaidSvg(displayChart);
        if (!ref.current || cancelled) return;
        ref.current.innerHTML = svg;
        ref.current.setAttribute("data-mermaid-chart", resolvedChart);
      } catch (primaryError) {
        console.error("Failed to render mermaid chart:", primaryError);

        if (!repairAttempted && !repairInFlight.current) {
          repairInFlight.current = true;
          const { diagram: repaired, attempted } = await requestDiagramRepair(displayChart);
          repairInFlight.current = false;
          setRepairAttempted(true);

          if (attempted) {
            if (repaired && repaired !== displayChart) {
              toast.success("Recovered Mermaid diagram");

              const previousBlock = ["```mermaid", displayChart, "```"].join("\n");
              const nextBlock = ["```mermaid", repaired, "```"].join("\n");

              try {
                const storedResult = localStorage.getItem("documentationResult");
                if (storedResult) {
                  const parsed = JSON.parse(storedResult);
                  if (parsed && typeof parsed.textContent === "string") {
                    const updatedText = parsed.textContent.replace(previousBlock, nextBlock);
                    if (updatedText !== parsed.textContent) {
                      parsed.textContent = updatedText;
                      localStorage.setItem("documentationResult", JSON.stringify(parsed));
                    }
                  }
                }
              } catch (storageError) {
                console.error("Failed to persist repaired diagram:", storageError);
              }

              window.dispatchEvent(
                new CustomEvent("documentation:diagram-updated", {
                  detail: {
                    previous: previousBlock,
                    next: nextBlock,
                  },
                })
              );

              if (!cancelled) {
                setDisplayChart(repaired);
              }
              return;
            }

            toast.error("Unable to repair Mermaid diagram automatically");
          }
        }

        const sanitized = sanitizeMermaidChart(displayChart);
        fallback("Failed to render Mermaid diagram", sanitized || displayChart);
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [displayChart, repairAttempted, requestDiagramRepair]);

  return <div ref={ref} className="mermaid w-full overflow-auto bg-white rounded p-4" />;
};

export default Mermaid;
