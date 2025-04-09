
import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CardSectionProps {
  title: string;
  tooltip: string;
  children: ReactNode;
}

export const CardSection = ({ title, tooltip, children }: CardSectionProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="mb-6 md:mb-8 shadow-md">
      <CardContent className={`${isMobile ? 'pt-4 px-3' : 'pt-6'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800">{title}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[250px]">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
