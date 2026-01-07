import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookTemplate, Save, Trash2, Plus, Layout, Zap, Hash } from "lucide-react";
import { DocumentationTemplate } from "@/types/documentation";
import { STORAGE_KEYS, DEFAULT_TEMPLATES } from "@/lib/constants";
import { toast } from "sonner";

interface TemplateSelectorProps {
  selectedCodeSections: string[];
  selectedReportSections: string[];
  onApplyTemplate: (codeSections: string[], reportSections: string[]) => void;
}

export function TemplateSelector({
  selectedCodeSections,
  selectedReportSections,
  onApplyTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<DocumentationTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      const customTemplates: DocumentationTemplate[] = stored ? JSON.parse(stored) : [];
      setTemplates([
        ...DEFAULT_TEMPLATES.map((t) => ({ ...t, isCustom: false })),
        ...customTemplates.map((t) => ({ ...t, isCustom: true })),
      ]);
    } catch (error) {
      setTemplates(DEFAULT_TEMPLATES.map((t) => ({ ...t, isCustom: false })));
    }
  };

  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Template designation required");
      return;
    }

    const newTemplate: DocumentationTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || "User defined profile",
      codeSections: selectedCodeSections,
      reportSections: selectedReportSections,
      createdAt: Date.now(),
      isCustom: true,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      const customTemplates: DocumentationTemplate[] = stored ? JSON.parse(stored) : [];
      customTemplates.push(newTemplate);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(customTemplates));
      loadTemplates();
      setIsCreateDialogOpen(false);
      setNewTemplateName("");
      setNewTemplateDescription("");
      toast.success("Designation profile storage complete");
    } catch (error) {
      toast.error("Storage write error");
    }
  };

  const deleteTemplate = (id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      const customTemplates: DocumentationTemplate[] = stored ? JSON.parse(stored) : [];
      const updated = customTemplates.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
      loadTemplates();
      toast.success("Profile purged from system");
    } catch (error) {
      toast.error("Purge failure");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-zinc-950/40 p-6 border border-white/5 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
          <Layout size={20} />
        </div>
        <div className="flex-1">
          <Label className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/60 mb-1.5 block leading-none">Configuration_Stencil</Label>
          <Select onValueChange={(val) => {
            const t = templates.find(t => t.id === val);
            if (t) onApplyTemplate(t.codeSections, t.reportSections);
          }}>
            <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-11 font-heading uppercase text-[10px] tracking-widest focus:ring-0 focus:border-primary/40">
              <SelectValue placeholder="LOAD_SYSTEM_PROFILE..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-white/10 rounded-none font-mono text-[10px] uppercase">
               {templates.map(t => (
                 <div key={t.id} className="flex items-center justify-between group/item">
                    <SelectItem value={t.id} className="focus:bg-primary focus:text-black">
                      {t.name.toUpperCase()}
                    </SelectItem>
                    {t.isCustom && (
                       <button onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }} className="px-2 opacity-0 group-hover/item:opacity-40 hover:opacity-100 transition-opacity text-red-500">
                          <Trash2 size={12} />
                       </button>
                    )}
                 </div>
               ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-11 rounded-none border-dashed border-white/20 hover:border-primary/40 hover:bg-primary/5 font-mono text-[10px] uppercase tracking-[0.2em] px-6 transition-all group">
            <Plus size={14} className="mr-2 group-hover:rotate-90 transition-transform" />
            Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-950 border border-white/10 rounded-none p-10 max-w-md">
           <DialogHeader>
             <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-6 bg-primary" />
                <DialogTitle className="font-heading uppercase text-xl font-black tracking-tighter text-white">Save Template</DialogTitle>
             </div>
             <DialogDescription className="font-mono text-[10px] uppercase tracking-widest leading-relaxed text-muted-foreground/60">
               Save your current configuration for future use.
             </DialogDescription>
           </DialogHeader>
           
           <div className="space-y-8 my-8">
             <div className="space-y-3">
               <Label className="font-mono text-[10px] uppercase tracking-widest text-primary/60">Name</Label>
               <Input 
                 value={newTemplateName}
                 onChange={(e) => setNewTemplateName(e.target.value)}
                 placeholder="Template Name..."
                 className="bg-black border-white/10 h-12 rounded-none font-mono text-sm uppercase"
               />
             </div>
             <div className="space-y-3">
               <Label className="font-mono text-[10px] uppercase tracking-widest text-primary/60">Description</Label>
               <Textarea 
                 value={newTemplateDescription}
                 onChange={(e) => setNewTemplateDescription(e.target.value)}
                 placeholder="Optional description..."
                 className="bg-black border-white/10 rounded-none font-mono text-xs h-24 uppercase resize-none"
               />
             </div>
           </div>

           <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="rounded-none font-mono text-[10px] uppercase tracking-widest px-8">Cancel</Button>
              <Button onClick={saveTemplate} className="rounded-none bg-primary text-black font-heading font-black tracking-widest uppercase text-xs px-10 h-12">Save</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
