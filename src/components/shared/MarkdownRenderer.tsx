import React, { useState, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Mermaid } from "./Mermaid";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-none bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
      title="Copy code"
    >
      {copied ? (
        <Check className="h-3 w-3 text-primary" />
      ) : (
        <Copy className="h-3 w-3 text-primary" />
      )}
    </button>
  );
};

export const MarkdownRenderer = React.memo(({ content, className }: MarkdownRendererProps) => {
  // Process mermaid blocks
  const { processedContent, placeholders } = useMemo(() => {
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const placeholders: { placeholder: string; chart: string }[] = [];
    let counter = 0;
    
    const processed = content.replace(/^```markdown\n/, '').replace(regex, (_match, chart) => {
      const placeholder = `MERMAID_PLACEHOLDER_${counter++}`;
      placeholders.push({ placeholder, chart: chart.trim() });
      return placeholder;
    });
    
    return { processedContent: processed, placeholders };
  }, [content]);

  return (
    <div className={`prose prose-invert max-w-none prose-p:text-muted-foreground prose-headings:text-white prose-headings:font-heading prose-headings:uppercase prose-strong:text-primary prose-a:text-primary ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
            return <h1 id={id} className="text-5xl md:text-8xl font-black mb-12 border-b-4 border-primary pb-6 inline-block tracking-tighter scroll-mt-32">{children}</h1>;
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
            return (
              <h2 id={id} className="text-3xl md:text-5xl font-black mt-20 mb-8 flex items-center gap-6 tracking-tight scroll-mt-32">
                <span className="w-12 h-1.5 bg-primary shrink-0"/>
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
            return <h3 id={id} className="text-xl md:text-2xl font-black mt-12 mb-4 uppercase tracking-widest text-white/90 scroll-mt-32">{children}</h3>;
          },
          h1: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return <h1 id={id} className="scroll-mt-32">{children}</h1>;
          },
          h2: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return <h2 id={id} className="scroll-mt-32">{children}</h2>;
          },
          h3: ({ children }) => {
            const id = String(children).toLowerCase().replace(/[^\w]+/g, '-');
            return <h3 id={id} className="scroll-mt-32">{children}</h3>;
          },
          p: ({ children }) => {
            const text = String(children);
            const placeholderMatch = placeholders.find(p => text.includes(p.placeholder));
            
            if (placeholderMatch) {
              return (
                <div className="my-12 p-8 bg-zinc-950 border border-white/5 relative group">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
                  <span className="absolute -top-3 left-6 bg-background px-2 text-[8px] font-mono text-primary uppercase tracking-widest">Architectural_Schematic</span>
                  <Mermaid chart={placeholderMatch.chart} />
                </div>
              );
            }
            
            return <p className="text-lg leading-relaxed mb-6 font-body">{children}</p>;
          },
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            
            if (!className || !match) {
              return (
                <code className="bg-primary/10 text-primary px-2 py-0.5 font-mono text-sm border border-primary/20" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <div className="group relative my-12 border border-white/10 bg-zinc-950 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-[0.2em]">{match[1]}</span>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[8px] font-mono text-muted-foreground uppercase opacity-50">Source_Buffer_Active</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-none bg-red-500/30" />
                    <div className="w-2 h-2 rounded-none bg-yellow-500/30" />
                    <div className="w-2 h-2 rounded-none bg-green-500/30" />
                  </div>
                </div>
                <div className="relative group">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="!bg-transparent !m-0 !p-8 !text-sm leading-relaxed"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={codeString} />
                  </div>
                </div>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-12 border border-white/10 bg-zinc-950/50">
              <table className="w-full text-left border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="p-6 bg-white/5 font-heading text-xs uppercase tracking-[0.2em] text-primary border-b border-white/10">{children}</th>,
          td: ({ children }) => <td className="p-6 border-b border-white/5 text-sm font-body text-muted-foreground">{children}</td>,
          ul: ({ children }) => <ul className="list-none space-y-4 my-8 pl-0">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-4 text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-primary mt-2.5 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary bg-primary/5 p-8 my-10 italic text-xl text-white/80 font-body relative">
              <span className="absolute top-2 left-4 text-primary/20 text-6xl font-serif">"</span>
              {children}
            </blockquote>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;
