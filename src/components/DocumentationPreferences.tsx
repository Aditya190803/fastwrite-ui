import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoIcon, Search, FileText, Database, Activity, Plus, Loader2, ExternalLink } from "lucide-react";
import { CODE_SECTIONS, REPORT_SECTIONS } from "@/lib/constants";
import { manualArxivSearch, type ArxivPaper } from "@/lib/arxiv";
import { useState } from "react";

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

const PreferenceCard = ({ id, label, description, checked, onChange, icon: Icon }: any) => (
  <motion.div 
    whileHover={{ x: 4 }}
    className={`group flex items-start gap-5 p-6 transition-all relative overflow-hidden ${checked ? 'industrial-border bg-primary/5' : 'border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10'}`}
  >
    {checked && (
      <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none">
        <Activity size={40} className="text-primary" />
      </div>
    )}
    <div className="pt-1.5 relative z-10">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c as boolean)}
        className="h-5 w-5 rounded-none border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black transition-all"
      />
    </div>
    <div className="space-y-3 flex-1 relative z-10">
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={id} 
          className="font-heading text-[13px] uppercase tracking-[0.2em] font-black cursor-pointer text-white group-hover:text-primary transition-colors italic"
        >
          {label}
        </Label>
        {checked && <span className="text-[8px] font-mono text-primary/60 animate-pulse">ENABLED</span>}
      </div>
      <p className="text-[10px] font-mono leading-relaxed text-white/30 uppercase tracking-wider group-hover:text-white/60 transition-opacity">
        {description}
      </p>
      <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {[1,2,3].map(i => <div key={i} className={`h-[2px] w-4 ${checked ? 'bg-primary/40' : 'bg-white/10'}`} />)}
      </div>
    </div>
  </motion.div>
);

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArxivPaper[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleArxivSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await manualArxivSearch(searchQuery);
      setSearchResults(results.papers);
    } catch (error) {
      console.error("ArXiv search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addPaperReference = (paper: ArxivPaper) => {
    const paperId = paper.id.split('/abs/').pop() || paper.id;
    if (!manualReferences.includes(paperId)) {
      const newRefs = manualReferences.trim() 
        ? `${manualReferences.trim()}\n${paperId}`
        : paperId;
      setManualReferences(newRefs);
    }
  };

  return (
    <>
      <TabsContent value="code" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CODE_SECTIONS.map((section) => (
            <PreferenceCard 
              key={section.id}
              id={`code-${section.id}`}
              label={section.label}
              description={section.description}
              checked={selectedCodeSections.includes(section.id)}
              onChange={(c: boolean) => handleCodeSectionChange(section.id, c)}
              icon={FileText}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="report" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORT_SECTIONS.map((section) => {
            const isSelected = selectedReportSections.includes(section.id);
            const isLiterature = section.id === "literature_survey";

            if (isLiterature) {
              return (
                <div key={section.id} className="md:col-span-2 space-y-4">
                  <PreferenceCard 
                    id={`report-${section.id}`}
                    label={section.label}
                    description={section.description}
                    checked={isSelected}
                    onChange={(c: boolean) => handleReportSectionChange(section.id, c)}
                    icon={Database}
                  />
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-zinc-950/50 border border-white/5 p-8 space-y-8 ml-4 border-l-2 border-l-primary/40">
                          <RadioGroup 
                            value={literatureSource} 
                            onValueChange={(v) => setLiteratureSource(v as "auto" | "manual")}
                            className="flex flex-col md:flex-row gap-8"
                          >
                            <div className="flex items-center space-x-3 group cursor-pointer">
                              <RadioGroupItem value="auto" id="auto-search" className="border-primary/40 data-[state=checked]:bg-primary rounded-none" />
                              <Label htmlFor="auto-search" className="font-mono text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
                                AUTO (ARXIV)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 group cursor-pointer">
                              <RadioGroupItem value="manual" id="manual-papers" className="border-primary/40 data-[state=checked]:bg-primary rounded-none" />
                              <Label htmlFor="manual-papers" className="font-mono text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-primary transition-colors">
                                MANUAL
                              </Label>
                            </div>
                          </RadioGroup>
                          
                          {literatureSource === "manual" && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="space-y-6"
                            >
                              <div className="space-y-4">
                                <Label className="text-[8px] font-mono uppercase tracking-[0.2em] text-primary/60">ARXIV SEARCH</Label>
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="SEARCH BY TOPIC, TITLE, OR AUTHOR..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleArxivSearch()}
                                    className="bg-black border-white/10 rounded-none font-mono text-[10px] uppercase h-10"
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={handleArxivSearch}
                                    disabled={isSearching}
                                    className="rounded-none border-white/10 hover:bg-primary hover:text-black transition-colors"
                                  >
                                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                  </Button>
                                </div>

                                {searchResults.length > 0 && (
                                  <div className="max-h-[200px] overflow-y-auto space-y-2 industrial-scrollbar pr-2">
                                    {searchResults.map((paper) => (
                                      <div 
                                        key={paper.id}
                                        className="group p-3 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors flex items-start justify-between gap-3"
                                      >
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-[10px] font-bold text-white uppercase truncate mb-1">{paper.title}</h4>
                                          <p className="text-[8px] font-mono text-white/40 uppercase truncate">
                                            {paper.authors.join(", ")}
                                          </p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <a 
                                            href={paper.pdfUrl || paper.id} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-1 hover:text-primary transition-colors"
                                          >
                                            <ExternalLink size={14} />
                                          </a>
                                          <button 
                                            onClick={() => addPaperReference(paper)}
                                            className="p-1 hover:text-primary transition-colors"
                                          >
                                            <Plus size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <Label htmlFor="manual-references" className="text-[8px] font-mono uppercase tracking-[0.2em] text-primary/60">SELECTED REFERENCES (IDs)</Label>
                                <Textarea
                                  id="manual-references"
                                  placeholder="PASTE IDS OR ADD FROM SEARCH ABOVE..."
                                  value={manualReferences}
                                  onChange={(e) => setManualReferences(e.target.value)}
                                  className="min-h-[100px] bg-black border-white/10 rounded-none font-mono text-xs uppercase leading-relaxed placeholder:text-muted-foreground/20"
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            
            return (
              <PreferenceCard 
                key={section.id}
                id={`report-${section.id}`}
                label={section.label}
                description={section.description}
                checked={isSelected}
                onChange={(c: boolean) => handleReportSectionChange(section.id, c)}
                icon={Activity}
              />
            );
          })}
        </div>
      </TabsContent>
    </>
  );
};
