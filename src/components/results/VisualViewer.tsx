
import { ScrollArea } from "@/components/ui/scroll-area";

interface VisualViewerProps {
  visualContent?: string;
  isMobile?: boolean;
}

const VisualViewer = ({ visualContent, isMobile = false }: VisualViewerProps) => {
  return (
    <div className="border rounded-lg bg-white shadow-md overflow-hidden">
      <div className="p-3 h-full">
        <h2 className="text-lg font-semibold mb-2 text-slate-800">Visual Representation</h2>
        <ScrollArea className={isMobile ? "h-[40vh]" : "h-[calc(70vh-60px)]"}>
          <div className={`${isMobile ? 'p-3' : 'p-4'} bg-slate-50 rounded-md h-full flex items-center justify-center`}>
            {visualContent ? (
              <div className="text-center">
                <pre className={`text-left ${isMobile ? 'text-[10px] sm:text-xs' : 'text-xs'} font-mono bg-white ${isMobile ? 'p-3' : 'p-4'} rounded border overflow-x-auto`}>
                  {visualContent}
                </pre>
                <p className={`${isMobile ? 'text-xs text-slate-500 mt-3' : 'text-sm text-slate-500 mt-4'}`}>
                  Visual diagram representation (Mermaid.js format)
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <p className={isMobile ? "text-sm" : ""}>No visual content available for this documentation</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default VisualViewer;
