
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Mermaid from "./Mermaid";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  // Process the content to extract mermaid blocks for separate rendering
  const extractMermaidBlocks = (markdown: string) => {
    const regex = /```mermaid\n([\s\S]*?)```/g;
    const blocks: { fullMatch: string; content: string; position: number }[] = [];
    
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        fullMatch: match[0],
        content: match[1].trim(),
        position: match.index
      });
    }
    
    return blocks;
  };

  const mermaidBlocks = extractMermaidBlocks(content);
  
  // Replace mermaid blocks with placeholders for later substitution
  let processedContent = content;
  const placeholders: { placeholder: string; chart: string }[] = [];
  
  mermaidBlocks.forEach((block, index) => {
    const placeholder = `MERMAID_PLACEHOLDER_${index}`;
    processedContent = processedContent.replace(block.fullMatch, placeholder);
    placeholders.push({ placeholder, chart: block.content });
  });
  
  // Remove any potential ```markdown tags at the beginning
  processedContent = processedContent.replace(/^```markdown\n/, '');
  
  return (
    <div className="prose max-w-none text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !className || !match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                language={match[1]}
                style={oneLight}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            );
          },
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => {
            // Check if this paragraph contains a mermaid placeholder
            const content = String(props.children || '');
            const placeholderMatch = placeholders.find(p => content.includes(p.placeholder));
            
            if (placeholderMatch) {
              return (
                <div className="my-6">
                  <Mermaid chart={placeholderMatch.chart} />
                </div>
              );
            }
            
            return <p className="my-3" {...props} />;
          },
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-3" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-3" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-2 my-3 italic" {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
