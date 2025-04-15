import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.render("mermaid-graph", chart, (svgCode) => {
        ref.current!.innerHTML = svgCode;
      });
    }
  }, [chart]);

  return <div ref={ref} className="mermaid w-full overflow-auto bg-white rounded p-4 shadow" />;
};

export default Mermaid;
