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
import { Sparkles, Save, Printer, Loader2, BookOpen, FileText, LayoutGrid } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
        toast({ title: "Generated!", description: "Review your resource below." });
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
      pdf.save(`${generatedContent.title}.pdf`);
    } catch (err) {
      console.error(err);
      toast({ title: "Print failed", description: "Could not generate PDF", variant: "destructive" });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-8rem)]">
      {/* Controls Panel */}
      <div className="space-y-6 overflow-y-auto pr-2">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{t("gen.title")}</h1>
          <p className="text-muted-foreground">{t("gen.subtitle")}</p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>{t("gen.select_student")}</Label>
              <Select 
                value={studentId?.toString()} 
                onValueChange={(val) => setStudentId(Number(val))}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Choose a student profile..." />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("gen.resource_type")}</Label>
              <div className="grid grid-cols-3 gap-2">
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

            <div className="space-y-2">
              <Label>{t("gen.topic")}</Label>
              <Input 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("gen.topic_placeholder")}
                className="h-12 rounded-xl"
              />
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg rounded-xl h-14 bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              onClick={handleGenerate}
              disabled={generate.isPending || !studentId}
            >
              {generate.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("gen.generating")}</>
              ) : (
                <><Sparkles className="mr-2 h-5 w-5" /> {t("gen.generate")}</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="bg-muted/30 rounded-3xl border border-border p-6 flex flex-col h-full overflow-hidden relative">
        {!generatedContent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <Sparkles className="w-16 h-16 mb-4" />
            <p className="text-lg">Generated resource will appear here</p>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saveResource.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {t("gen.save")}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                {t("gen.print")}
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-8" id="printable-resource">
              <ResourcePreview content={generatedContent} type={type} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
        active 
          ? "border-primary bg-primary/5 text-primary" 
          : "border-transparent bg-muted/50 hover:bg-muted text-muted-foreground"
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
}

function ResourcePreview({ content, type }: { content: any, type: string }) {
  // Simple Renderer based on type
  // In a real app, this would be much more complex based on the JSON structure
  const data = content.content; // The AI response body

  if (type === "story") {
    return (
      <div className="prose max-w-none font-sans text-lg">
        <h2 className="font-display text-3xl text-center mb-8 text-primary">{content.title}</h2>
        {data.pages?.map((page: any, idx: number) => (
          <div key={idx} className="mb-8 p-6 border-b border-dashed border-gray-200 last:border-0">
            {page.imageUrl && (
              <img src={page.imageUrl} alt="Visual aid" className="mx-auto h-48 mb-4 rounded-lg object-contain" />
            )}
            <p className="text-center leading-relaxed">{page.text}</p>
          </div>
        ))}
        {/* Fallback if structure differs */}
        {!data.pages && <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    );
  }

  if (type === "pecs") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {data.cards?.map((card: any, idx: number) => (
          <div key={idx} className="border-4 border-black p-2 rounded-lg aspect-square flex flex-col items-center justify-center text-center">
             {/* Ideally AI returns image URL, or we map to a symbol library */}
             <div className="flex-1 flex items-center justify-center">
                {card.imageUrl ? (
                  <img src={card.imageUrl} className="max-h-24 w-auto" />
                ) : (
                  <LayoutGrid className="w-16 h-16 text-gray-300" />
                )}
             </div>
             <p className="font-bold uppercase mt-2 text-xl">{card.label}</p>
          </div>
        ))}
         {!data.cards && <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
      </div>
    );
  }

  // Worksheet fallback
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-center border-b-2 border-primary pb-4">{content.title}</h2>
      {data.instructions && <p className="font-medium text-lg">Instructions: {data.instructions}</p>}
      
      {data.questions?.map((q: any, idx: number) => (
         <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
           <p className="font-bold mb-4">{idx + 1}. {q.text}</p>
           {/* Visual choices often used in autism worksheets */}
           <div className="flex gap-4 justify-around">
             {[1, 2, 3].map(i => (
               <div key={i} className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg" />
             ))}
           </div>
         </div>
      ))}
       {!data.questions && <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
