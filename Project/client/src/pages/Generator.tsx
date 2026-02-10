import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { useGenerateResource } from "@/hooks/use-ai";
import { useCreateResource } from "@/hooks/use-resources";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Save, Printer, Loader2, BookOpen, FileText, LayoutGrid, Wand2, Info, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Generator() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const preSelectedStudentId = params.get("studentId");

  const { t, language } = useI18n();
  const { data: students } = useStudents();
  const { toast } = useToast();

  const generate = useGenerateResource();
  const saveResource = useCreateResource();

  const [studentId, setStudentId] = useState(preSelectedStudentId ? Number(preSelectedStudentId) : undefined);
  const [type, setType] = useState<"story" | "worksheet" | "pecs">("story");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const selectedStudent = students?.find(s => s.id === studentId);

  const handleGenerate = () => {
    if (!studentId) {
      toast({ title: "Select a student", variant: "destructive" });
      return;
    }

    generate.mutate({
      studentId,
      type,
      topic: topic || undefined,
      language,
    }, {
      onSuccess: (data) => {
        setGeneratedContent(data);
        toast({ title: "Resource Generated!", description: "AI has successfully created your materials." });
      }
    });
  };

  const handleSave = () => {
    if (!generatedContent || !studentId) return;

    saveResource.mutate({
      title: generatedContent.title,
      type,
      content: generatedContent.content,
      language: generatedContent.language,
      studentId,
    });
  };

  const handlePrint = async () => {
    const element = document.getElementById("printable-resource");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${generatedContent.title || 'resource'}.pdf`);
    } catch (err) {
      console.error(err);
      toast({ title: "Print failed", description: "Could not generate PDF", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)] pb-10">
      {/* Settings Panel - Left side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[400px] flex flex-col gap-6"
      >
        <div className="px-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
            <Wand2 className="w-3 h-3" />
            <span>AI Content Studio</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-1 leading-tight">
            {t("gen.title")}
          </h1>
          <p className="text-slate-500 font-medium text-sm">Professional AET resource builder.</p>
        </div>

        <Card className="glass border-white/50 shadow-xl overflow-hidden rounded-[2rem]">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs ml-1">Student Profile</Label>
              <Select
                value={studentId?.toString()}
                onValueChange={(val) => setStudentId(Number(val))}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium focus:ring-primary/20">
                  <SelectValue placeholder="Choose a student..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 p-1">
                  {students?.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()} className="rounded-lg py-2.5 px-3 font-medium cursor-pointer">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStudent && (
                <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-400 border-slate-200">
                    Level: {selectedStudent.aetLevel}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold text-slate-400 border-slate-200">
                    Interest: {selectedStudent.primaryInterest || "None"}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-xs ml-1">Format</Label>
              <div className="grid grid-cols-3 gap-2">
                <TypeButton
                  active={type === "story"}
                  onClick={() => setType("story")}
                  icon={BookOpen}
                  label="Story"
                />
                <TypeButton
                  active={type === "worksheet"}
                  onClick={() => setType("worksheet")}
                  icon={FileText}
                  label="Work"
                />
                <TypeButton
                  active={type === "pecs"}
                  onClick={() => setType("pecs")}
                  icon={LayoutGrid}
                  label="PECS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-slate-700 font-bold text-xs">{t("gen.topic")}</Label>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Prompt</span>
              </div>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Lunchtime rules"
                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium focus:ring-primary/20"
              />
            </div>

            <Button
              size="lg"
              className="w-full text-md rounded-xl h-14 bg-primary shadow-lg shadow-primary/20 hover:shadow-xl transition-all font-bold"
              onClick={handleGenerate}
              disabled={generate.isPending || !studentId}
            >
              {generate.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> Create Resource</>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Panel - Right side (Live A4) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-h-[600px] flex flex-col gap-4"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A4 Preview</span>
          </div>
          {generatedContent && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={saveResource.isPending} className="rounded-lg h-9 font-bold text-primary">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
              <Button variant="default" size="sm" onClick={handlePrint} className="rounded-lg h-9 font-bold bg-slate-900">
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print PDF
              </Button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-slate-100 rounded-[2.5rem] p-8 overflow-y-auto flex justify-center shadow-inner">
          <AnimatePresence mode="wait">
            {!generatedContent ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-[210mm] flex flex-col items-center justify-center text-center opacity-40"
              >
                <Sparkles className="w-16 h-16 text-primary mb-4" />
                <h3 className="text-xl font-bold text-slate-600">Preview will appear here</h3>
                <p className="text-slate-400 text-sm font-medium">Configure settings to generate content</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                id="printable-resource"
                className="w-full max-w-[210mm] min-h-[297mm] bg-[var(--low-arousal-bg)] text-[var(--low-arousal-text)] shadow-2xl p-[30mm] flex flex-col rounded-sm"
              >
                {/* AET Resource Header */}
                <div className="border-b-2 border-[var(--low-arousal-border)] pb-6 mb-10 flex justify-between items-end">
                  <div>
                    <h4 className="text-[14px] font-bold uppercase tracking-wider mb-1 opacity-70">AET Specialized Resource</h4>
                    <p className="text-xl font-bold font-sans">
                      {selectedStudent?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-tight mb-1">
                      Target: {selectedStudent?.learningGoals?.replaceAll('|', ', ') || "General"}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-tight">
                      Indicator: {selectedStudent?.aetLevel}
                    </p>
                  </div>
                </div>

                <ResourcePreview content={generatedContent} type={type} />

                {/* Footer on Print */}
                <div className="mt-auto pt-8 border-t border-[var(--low-arousal-border)] text-[10px] italic flex justify-between opacity-50">
                  <span>Generated by AET Assist | CaseID: {studentId}</span>
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function TypeButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 h-20 group",
        active
          ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
          : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 text-slate-400 hover:text-primary"
      )}
    >
      <Icon className={cn("w-5 h-5 transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}


function ResourcePreview({ content, type }: { content: any, type: string }) {
  const data = content.content;

  if (type === "story") {
    return (
      <div className="space-y-12">
        <h2 className="text-3xl font-bold text-center mb-10 leading-tight">{content.title}</h2>

        {data.steps?.map((step: any, idx: number) => (
          <div key={idx} className="grid grid-cols-1 gap-6 pb-10 last:pb-0">
            {step.image_url && (
              <div className="w-full flex justify-center">
                <img src={step.image_url} alt="Step" className="max-h-64 object-contain rounded-lg border-2 border-slate-900/5" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase opacity-50">English</span>
                <p className="text-lg leading-relaxed">{step.text_en || step.text}</p>
              </div>
              <div className="space-y-2 text-right" dir="rtl">
                <span className="text-[10px] font-bold uppercase opacity-50">العربية</span>
                <p className="text-xl font-medium leading-relaxed font-sans">{step.text_ar || step.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "pecs") {
    return (
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-center mb-8">{content.title}</h2>
        <div className="grid grid-cols-2 gap-6">
          {data.cards?.map((card: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-300 p-4 rounded-xl aspect-square flex flex-col items-center justify-between text-center"
            >
              <div className="flex-1 flex items-center justify-center p-2">
                {card.image_url ? (
                  <img src={card.image_url} className="max-h-24 w-auto rounded-md object-contain" />
                ) : (
                  <LayoutGrid className="w-10 h-10 opacity-10" />
                )}
              </div>
              <div className="w-full border-t pt-3 mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold">
                <span className="text-slate-500 uppercase">{card.label_en || card.label}</span>
                <span className="font-sans" dir="rtl">{card.label_ar || card.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Worksheet
  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold">{content.title}</h2>
      {data.instructions && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm italic">
          {data.instructions}
        </div>
      )}
      <div className="space-y-12">
        {data.questions?.map((q: any, idx: number) => (
          <div key={idx} className="space-y-4">
            <div className="flex justify-between items-start gap-8">
              <p className="font-bold text-lg">{idx + 1}. {q.text_en || q.text}</p>
              <p className="text-xl font-medium text-right" dir="rtl">{q.text_ar || q.text}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square border-2 border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-300 uppercase font-bold">
                  Place here
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
