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
    <div className="flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-10rem)] pb-10">
      {/* Controls Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[450px] space-y-8"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            <Wand2 className="w-3 h-3" />
            <span>AI Content Studio</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2 leading-tight">
            {t("gen.title")}
          </h1>
          <p className="text-slate-500 font-medium">{t("gen.subtitle")}</p>
        </div>

        <Card className="glass border-white/50 shadow-2xl shadow-indigo-500/5 overflow-hidden rounded-[2.5rem]">
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3">
              <Label className="text-slate-700 font-bold ml-1">{t("gen.select_student")}</Label>
              <Select
                value={studentId?.toString()}
                onValueChange={(val) => setStudentId(Number(val))}
              >
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-medium focus:ring-primary/20">
                  <SelectValue placeholder="Choose a student profile..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 p-2">
                  {students?.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl py-3 px-4 font-medium mb-1 last:mb-0 cursor-pointer">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-700 font-bold ml-1">{t("gen.resource_type")}</Label>
              <div className="grid grid-cols-3 gap-3">
                <TypeButton
                  active={type === "story"}
                  onClick={() => setType("story")}
                  icon={BookOpen}
                  label={t("type.story")}
                />
                <TypeButton
                  active={type === "worksheet"}
                  onClick={() => setType("worksheet")}
                  icon={FileText}
                  label={t("type.worksheet")}
                />
                <TypeButton
                  active={type === "pecs"}
                  onClick={() => setType("pecs")}
                  icon={LayoutGrid}
                  label={t("type.pecs")}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-slate-700 font-bold">{t("gen.topic")}</Label>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Optional</span>
              </div>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("gen.topic_placeholder")}
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-medium focus:ring-primary/20"
              />
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 ml-1 font-medium italic">
                <Info className="w-3 h-3" />
                Example: "Going to the dentist" or "Morning routine"
              </p>
            </div>

            <Button
              size="lg"
              className="w-full text-lg rounded-[1.5rem] h-16 bg-primary shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all font-bold tracking-tight"
              onClick={handleGenerate}
              disabled={generate.isPending || !studentId}
            >
              {generate.isPending ? (
                <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> {t("gen.generating")}</>
              ) : (
                <><Sparkles className="mr-3 h-6 w-6" /> {t("gen.generate")}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-h-[400px]"
      >
        <div className="glass h-full rounded-[3rem] border-white/40 p-1 relative flex flex-col shadow-inner">
          <AnimatePresence mode="wait">
            {!generatedContent ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
                  <Sparkles className="w-24 h-24 text-primary relative z-10 opacity-30" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Magic happens here</h3>
                <p className="text-slate-400 font-medium max-w-xs">{t("gen.subtitle")}</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="p-8 flex items-center justify-between border-b border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700">Preview Generated</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm" onClick={handleSave} disabled={saveResource.isPending} className="rounded-xl h-11 px-6 font-bold text-primary hover:bg-primary/5">
                      <Save className="w-4 h-4 mr-2" />
                      {t("gen.save")}
                    </Button>
                    <Button variant="default" size="sm" onClick={handlePrint} className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 bg-primary">
                      <Printer className="w-4 h-4 mr-2" />
                      {t("gen.print")}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12" id="printable-resource">
                  <ResourcePreview content={generatedContent} type={type} />
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
        "p-5 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 h-24 group",
        active
          ? "border-primary bg-primary text-white shadow-xl shadow-primary/30"
          : "border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg text-slate-400 hover:text-primary"
      )}
    >
      <Icon className={cn("w-6 h-6 transition-transform duration-500", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}


function ResourcePreview({ content, type }: { content: any, type: string }) {
  const data = content.content;

  if (type === "story") {
    return (
      <div className="max-w-3xl mx-auto space-y-16 py-10">
        <div className="text-center space-y-4 mb-20">
          <h2 className="font-display text-5xl font-bold text-slate-900 leading-tight">{content.title}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>

        {data.steps?.map((step: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            key={idx}
            className="flex flex-col gap-8 pb-16 last:pb-0 border-b border-slate-100 last:border-0"
          >
            {step.image_url ? (
              <div className="relative group mx-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-2xl group-hover:bg-primary/20 transition-all" />
                <img src={step.image_url} alt="Visual aid" className="relative z-10 max-h-80 w-auto rounded-[2.5rem] shadow-2xl border-4 border-white object-contain" />
              </div>
            ) : step.image_prompt && (
              <div className="w-full h-48 bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-300 italic font-medium px-10 text-center">
                Generating visual for: {step.image_prompt.substring(0, 50)}...
              </div>
            )}
            <p className="text-2xl font-medium text-slate-700 leading-relaxed text-center px-4">
              {step.text}
            </p>
          </motion.div>
        ))}
        {!data.steps && <pre className="whitespace-pre-wrap p-6 bg-slate-50 rounded-2xl border border-slate-100">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    );
  }

  if (type === "pecs") {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-center mb-12 text-slate-800">{content.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {data.cards?.map((card: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              key={idx}
              className="bg-white border-[6px] border-slate-900 p-4 rounded-[2rem] aspect-square flex flex-col items-center justify-between text-center shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]"
            >
              <div className="flex-1 flex items-center justify-center p-4">
                {card.image_url ? (
                  <img src={card.image_url} className="max-h-32 w-auto rounded-xl object-contain shadow-sm" />
                ) : (
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                    <LayoutGrid className="w-12 h-12" />
                  </div>
                )}
              </div>
              <div className="w-full h-px bg-slate-800 my-4 opacity-10" />
              <p className="font-bold uppercase text-2xl tracking-tighter text-slate-900 leading-none pb-2">{card.label}</p>
            </motion.div>
          ))}
        </div>
        {!data.cards && <pre className="whitespace-pre-wrap p-6 bg-slate-50 rounded-2xl">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    );
  }

  // Worksheet fallback
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="font-display text-4xl font-bold text-slate-900">{content.title}</h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
      </div>

      {data.instructions && (
        <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex gap-4">
          <Info className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <span className="font-bold text-primary uppercase text-[10px] tracking-widest block mb-1">Teacher Instructions</span>
            <p className="font-bold text-slate-700 text-xl leading-snug">{data.instructions}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {data.questions?.map((q: any, idx: number) => (
          <div key={idx} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-display text-lg flex-shrink-0">
                {idx + 1}
              </div>
              <p className="font-bold text-2xl text-slate-800 leading-tight">{q.text}</p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square border-4 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center group-hover:border-primary/20 transition-colors" />
              ))}
            </div>
          </div>
        ))}
      </div>
      {!data.questions && <pre className="whitespace-pre-wrap p-6 bg-slate-50 rounded-2xl">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
