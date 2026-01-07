import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Search, FileText, Database, Activity } from "lucide-react";
import { CODE_SECTIONS, REPORT_SECTIONS } from "@/lib/constants";

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
    className={`group flex items-start gap-4 p-5 transition-all border ${checked ? 'border-primary bg-primary/5' : 'border-white/5 bg-black/20 hover:bg-black/40 hover:border-white/10'}`}
  >
    <div className="pt-1">
      <Checkbox 
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c as boolean)}
        className="rounded-none border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
      />
    </div>
    <div className="space-y-2 flex-1">
      <div className="flex items-center gap-2">
        <Label 
          htmlFor={id} 
          className="font-heading text-xs uppercase tracking-[0.15em] cursor-pointer text-white group-hover:text-primary transition-colors"
        >
          {label}
        </Label>
        {Icon && <Icon size={14} className="text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />}
      </div>
      <p className="text-[10px] font-mono leading-relaxed text-muted-foreground uppercase opacity-60 group-hover:opacity-100 transition-opacity">
        {description}
      </p>
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
                              className="space-y-4"
                            >
                              <Label htmlFor="manual-references" className="text-[8px] font-mono uppercase tracking-[0.2em] text-primary/60">REFERENCES</Label>
                              <Textarea
                                id="manual-references"
                                placeholder="PASTE IDS OR CITATIONS..."
                                value={manualReferences}
                                onChange={(e) => setManualReferences(e.target.value)}
                                className="min-h-[120px] bg-black border-white/10 rounded-none font-mono text-xs uppercase leading-relaxed placeholder:text-muted-foreground/20"
                              />
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
