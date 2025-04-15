
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface DocumentationPreferencesProps {
  selectedCodeSections: string[];
  setSelectedCodeSections: (sections: string[]) => void;
  selectedReportSections: string[];
  setSelectedReportSections: (sections: string[]) => void;
  literatureSource: "auto" | "manual";
  setLiteratureSource: (source: "auto" | "manual") => void;
  manualReferences: string;
  setManualReferences: (references: string) => void;
}

export const DocumentationPreferences = ({
  selectedCodeSections,
  setSelectedCodeSections,
  selectedReportSections,
  setSelectedReportSections,
  literatureSource,
  setLiteratureSource,
  manualReferences,
  setManualReferences
}: DocumentationPreferencesProps) => {
  const handleCodeSectionChange = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedCodeSections([...selectedCodeSections, sectionId]);
    } else {
      setSelectedCodeSections(selectedCodeSections.filter(id => id !== sectionId));
    }
  };

  const handleReportSectionChange = (sectionId: string, checked: boolean) => {
    if (checked) {
      setSelectedReportSections([...selectedReportSections, sectionId]);
    } else {
      setSelectedReportSections(selectedReportSections.filter(id => id !== sectionId));
    }
  };

  const codeSections = [
    { id: "inline_comments", label: "Inline Comments", description: "Extract and explain comments in the code" },
    { id: "function_summaries", label: "Function Summaries", description: "Generate summaries for each function/method" },
    { id: "class_overviews", label: "Class Overviews", description: "Create overview documentation for classes" },
    { id: "data_flow", label: "Data Flow Description", description: "Describe how data flows through the application" },
    { id: "code_complexity", label: "Code Complexity Estimates", description: "Estimate complexity of different parts of the codebase" },
    { id: "architecture_overview", label: "Architecture Overview", description: "High-level overview of system architecture and design patterns" },
    { id: "api_documentation", label: "API Documentation", description: "Document API endpoints, parameters, and responses" },
    { id: "dependency_graph", label: "Dependency Graph", description: "Map out project dependencies and relationships" }
  ];

  const reportSections = [
    { id: "abstract", label: "Abstract", description: "Brief summary of the entire project" },
    { id: "introduction", label: "Introduction", description: "Overview of the problem and solution" },
    { id: "literature_survey", label: "Literature Survey", description: "Review of related work and technologies" },
    { id: "methodology", label: "Methodology", description: "Approach and methods used" },
    { id: "proposed_system", label: "Proposed System", description: "Detailed description of the system architecture" },
    { id: "expected_results", label: "Expected Results", description: "Expected outcomes and performance" },
    { id: "conclusion", label: "Conclusion", description: "Summary of findings and implementation" },
    { id: "future_scope", label: "Future Scope", description: "Potential future improvements and extensions" },
    { id: "references", label: "References", description: "Citations and references used" }
  ];

  return (
    <>
      <div className="pb-4 mb-4 border-b">
        <h3 className="text-md font-medium text-slate-800">Documentation Preferences</h3>
        <p className="text-sm text-slate-500">Select the sections you want to include in your documentation</p>
      </div>
      
      <TabsContent value="report" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportSections.map((section) => {
            // Special handling for Literature Survey section
            if (section.id === "literature_survey") {
              return (
                <div key={section.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50 md:col-span-2">
                  <Checkbox 
                    id={`report-${section.id}`}
                    checked={selectedReportSections.includes(section.id)}
                    onCheckedChange={(checked) => handleReportSectionChange(section.id, checked as boolean)}
                  />
                  <div className="space-y-3 w-full">
                    <div className="flex items-center space-x-2">
                      <Label 
                        htmlFor={`report-${section.id}`} 
                        className="font-medium cursor-pointer"
                      >
                        {section.label}
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-slate-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{section.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {selectedReportSections.includes(section.id) && (
                      <div className="mt-2 w-full space-y-4">
                        <RadioGroup 
                          value={literatureSource} 
                          onValueChange={(value) => setLiteratureSource(value as "auto" | "manual")}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto-search" />
                            <Label htmlFor="auto-search" className="cursor-pointer">Auto-search arXiv based on repo topic</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="manual" id="manual-papers" />
                            <Label htmlFor="manual-papers" className="cursor-pointer">Manually paste relevant papers</Label>
                          </div>
                        </RadioGroup>
                        
                        {literatureSource === "manual" && (
                          <div className="space-y-2">
                            <Label htmlFor="manual-references">Relevant Papers or References</Label>
                            <Textarea
                              id="manual-references"
                              placeholder="Paste DOIs, arXiv IDs, or full citations (one per line)"
                              value={manualReferences}
                              onChange={(e) => setManualReferences(e.target.value)}
                              className="min-h-24"
                            />
                            <p className="text-xs text-slate-500">
                              Format example: arXiv:2303.08774 or doe2023comprehensive
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={section.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50">
                <Checkbox 
                  id={`report-${section.id}`}
                  checked={selectedReportSections.includes(section.id)}
                  onCheckedChange={(checked) => handleReportSectionChange(section.id, checked as boolean)}
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Label 
                      htmlFor={`report-${section.id}`} 
                      className="font-medium cursor-pointer"
                    >
                      {section.label}
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{section.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>
      
      <TabsContent value="code" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codeSections.map((section) => (
            <div key={section.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-slate-50">
              <Checkbox 
                id={`code-${section.id}`}
                checked={selectedCodeSections.includes(section.id)}
                onCheckedChange={(checked) => handleCodeSectionChange(section.id, checked as boolean)}
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Label 
                    htmlFor={`code-${section.id}`} 
                    className="font-medium cursor-pointer"
                  >
                    {section.label}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{section.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </>
  );
};
