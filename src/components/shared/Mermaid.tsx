import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { renderMermaidSvg, sanitizeMermaidChart } from "@/lib/documentation";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_CONFIG, STORAGE_KEYS } from "@/lib/constants";

interface MermaidProps {
  chart: string;
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [displayChart, setDisplayChart] = useState(chart);
  const [repairAttempted, setRepairAttempted] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const repairInFlight = useRef(false);

  useEffect(() => {
    setDisplayChart(chart);
    setRepairAttempted(false);
    setHasError(false);
  }, [chart]);

  const handleManualRepair = async () => {
    if (isRepairing) return;
    setIsRepairing(true);
    const { diagram: repaired, attempted } = await requestDiagramRepair(displayChart);
    setIsRepairing(false);
    
    if (repaired && repaired !== displayChart) {
      toast.success("Diagram regenerated successfully");
      
      const previousBlock = ["```mermaid", displayChart, "```"].join("\n");
      const nextBlock = ["```mermaid", repaired, "```"].join("\n");
      
      window.dispatchEvent(
        new CustomEvent("documentation:diagram-updated", {
          detail: { previous: previousBlock, next: nextBlock },
        })
      );
      
      setDisplayChart(repaired);
      setHasError(false);
    } else if (attempted) {
      toast.error("Failed to regenerate diagram");
    }
  };

  const requestDiagramRepair = useCallback(
    async (diagram: string): Promise<{ diagram: string | null; attempted: boolean }> => {
      let attempted = false;
      try {
        const metadataRaw = localStorage.getItem(STORAGE_KEYS.GENERATION_META);
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

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.GENERATE_ENDPOINT}`, {
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
        setHasError(true);
        ref.current.innerHTML = `<div class=\"text-red-500 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-950/50 dark:border-red-800\">\n          <p class=\"font-semibold\">${message}</p>\n          <pre class=\"mt-2 text-xs overflow-auto\">${rawDiagram}</pre>\n        </div>`;
      };

      try {
        const { svg, chart: resolvedChart } = await renderMermaidSvg(displayChart);
        if (!ref.current || cancelled) return;
        ref.current.innerHTML = svg;
        ref.current.setAttribute("data-mermaid-chart", resolvedChart);
        setHasError(false);
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
                const storedResult = localStorage.getItem(STORAGE_KEYS.DOCUMENTATION_RESULT);
                if (storedResult) {
                  const parsed = JSON.parse(storedResult);
                  if (parsed && typeof parsed.textContent === "string") {
                    const updatedText = parsed.textContent.replace(previousBlock, nextBlock);
                    if (updatedText !== parsed.textContent) {
                      parsed.textContent = updatedText;
                      localStorage.setItem(STORAGE_KEYS.DOCUMENTATION_RESULT, JSON.stringify(parsed));
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

  return (
    <div className="relative group">
      <div ref={ref} className="mermaid w-full overflow-auto bg-white dark:bg-slate-900 rounded p-4" />
      
      {/* Regenerate button - visible on hover or when there's an error */}
      <div className={`absolute top-2 right-2 transition-opacity ${hasError ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <Button
          variant={hasError ? "destructive" : "secondary"}
          size="sm"
          onClick={handleManualRepair}
          disabled={isRepairing}
          className="gap-1 text-xs"
        >
          {isRepairing ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Regenerating...
            </>
          ) : hasError ? (
            <>
              <AlertCircle className="h-3 w-3" />
              Retry Diagram
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
