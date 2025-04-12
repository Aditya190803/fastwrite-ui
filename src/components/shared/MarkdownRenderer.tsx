import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="prose max-w-none text-slate-800">
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        code({ className, children }) {
          const language = className?.replace("language-", "") ?? "";
          return (
            <SyntaxHighlighter language={language} style={oneLight}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        }
      }}
    />
  </div>
);

export default MarkdownRenderer;
