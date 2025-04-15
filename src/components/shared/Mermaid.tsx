
import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        mermaid.initialize({ 
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
        });
        
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        // Using mermaidAPI.render() with correct typing
        mermaid.mermaidAPI.render(id, chart).then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        }).catch(error => {
          console.error("Failed to render mermaid chart:", error);
          if (ref.current) {
            ref.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">
              <p class="font-semibold">Failed to render Mermaid diagram</p>
              <pre class="mt-2 text-xs overflow-auto">${chart}</pre>
            </div>`;
          }
        });
      } catch (error) {
        console.error("Failed to initialize mermaid:", error);
        if (ref.current) {
          ref.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">
            <p class="font-semibold">Failed to render Mermaid diagram</p>
            <pre class="mt-2 text-xs overflow-auto">${chart}</pre>
          </div>`;
        }
      }
    }
  }, [chart]);

  return <div ref={ref} className="mermaid w-full overflow-auto bg-white rounded p-4" />;
};

export default Mermaid;
