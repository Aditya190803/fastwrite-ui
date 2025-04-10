
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Highlighter, Marker } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  content: string;
  isMobile?: boolean;
  markModeEnabled?: boolean;
  onToggleMarkMode?: () => void;
}

const DocumentViewer = ({ 
  content, 
  isMobile = false,
  markModeEnabled = false,
  onToggleMarkMode = () => {} 
}: DocumentViewerProps) => {
  const [selectedText, setSelectedText] = useState<string[]>([]);
  
  // Handle text selection when in mark mode
  const handleTextSelection = (line: string) => {
    if (!markModeEnabled) return;
    
    if (selectedText.includes(line)) {
      setSelectedText(selectedText.filter(item => item !== line));
    } else {
      setSelectedText([...selectedText, line]);
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-md overflow-hidden">
      <div className="p-3 h-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-slate-800">Documentation Text</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleMarkMode}
            className={`flex items-center gap-1 ${markModeEnabled ? 'bg-yellow-100 text-yellow-700' : ''}`}
          >
            {markModeEnabled ? (
              <Marker className="h-4 w-4" />
            ) : (
              <Highlighter className="h-4 w-4" />
            )}
            {markModeEnabled ? 'Exit Mark Mode' : 'Mark Mode'}
          </Button>
        </div>
        <ScrollArea className={isMobile ? "h-[40vh]" : "h-[calc(70vh-60px)]"}>
          <div className="prose max-w-none p-2">
            {content.split('\n').map((line, idx) => {
              const isSelected = selectedText.includes(line);

              const renderLine = () => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 
                      key={idx} 
                      className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold ${isMobile ? 'mt-3 mb-2' : 'mt-4 mb-2'} ${isSelected ? 'bg-yellow-200' : ''}`}
                      onClick={() => handleTextSelection(line)}
                    >
                      {line.replace('# ', '')}
                    </h1>
                  );
                } else if (line.startsWith('## ')) {
                  return (
                    <h2 
                      key={idx} 
                      className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold ${isMobile ? 'mt-3 mb-2' : 'mt-4 mb-2'} ${isSelected ? 'bg-yellow-200' : ''}`}
                      onClick={() => handleTextSelection(line)}
                    >
                      {line.replace('## ', '')}
                    </h2>
                  );
                } else if (line.startsWith('- ')) {
                  return (
                    <li 
                      key={idx} 
                      className={`ml-4 mb-1 ${isSelected ? 'bg-yellow-200' : ''}`}
                      onClick={() => handleTextSelection(line)}
                    >
                      {line.replace('- ', '')}
                    </li>
                  );
                } else if (line.startsWith('```')) {
                  return line.includes('```typescript') ? (
                    <pre 
                      key={idx} 
                      className={`${isMobile ? 'bg-slate-100 p-2 rounded my-2 text-xs' : 'bg-slate-100 p-3 rounded my-2 text-sm'} font-mono overflow-x-auto ${isSelected ? 'bg-yellow-200' : ''}`}
                    ></pre>
                  ) : null;
                } else if (line.endsWith('```')) {
                  return null;
                } else if (line.trim() === '') {
                  return <br key={idx} />;
                } else {
                  return (
                    <p 
                      key={idx} 
                      className={`${isMobile ? 'mb-2 text-sm' : 'mb-2'} ${isSelected ? 'bg-yellow-200' : ''}`}
                      onClick={() => handleTextSelection(line)}
                    >
                      {line}
                    </p>
                  );
                }
              };

              return (
                <div 
                  key={`container-${idx}`} 
                  className={markModeEnabled ? 'cursor-pointer transition-colors' : ''}
                >
                  {renderLine()}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DocumentViewer;
