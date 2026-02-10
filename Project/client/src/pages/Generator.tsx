import { useState, useEffect } from "react";
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
import { apiRequest } from "@/lib/queryClient";
import { StudentSelector } from "@/components/students/StudentSelector";
import { UserCog, Search, ArrowRight, Settings2, Sparkles, Pencil, ArrowLeftRight, Type, Save, Printer, Loader2, BookOpen, FileText, LayoutGrid, Wand2, Info, CheckCircle2, RefreshCcw, AlignLeft, MousePointer2 } from "lucide-react";
import { AET_FRAMEWORK } from "@shared/aet-framework";
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

  const [studentId, setStudentId] = useState<number | undefined>(preSelectedStudentId ? Number(preSelectedStudentId) : undefined);
  const [showSelector, setShowSelector] = useState(!preSelectedStudentId);
  const [type, setType] = useState<"story" | "worksheet" | "pecs">("story");
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const selectedStudent = students?.find(s => s.id === studentId);

  // Language logic
  const [genLanguage, setGenLanguage] = useState<"en" | "ar" | "bilingual">("en");

  // AET Framework State
  const [selectedMainArea, setSelectedMainArea] = useState<string>("");
  const [selectedSubTopic, setSelectedSubTopic] = useState<string>("");
  const [selectedIntention, setSelectedIntention] = useState<string>("");

  // Accessibility State
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<string>("1.5");
  const [fontFamily, setFontFamily] = useState<string>("font-sans");

  // Labels for AET
  const getFullAETLabel = (level?: string) => {
    switch (level) {
      case "NYD": return "Not Yet Developed";
      case "D": return "Developing";
      case "E": return "Established";
      case "G": return "Generalised";
      default: return "Select Level";
    }
  };


  // Update defaults when student changes
  useEffect(() => {
    if (selectedStudent) {
      setGenLanguage(selectedStudent.preferredLanguage as any);
    }
  }, [studentId, students]);

  const handleGenerate = () => {
    if (!studentId) {
      toast({ title: "Select a student", variant: "destructive" });
      return;
    }

    generate.mutate({
      studentId,
      type,
      topic: topic || undefined,
      language: genLanguage,
      aetContext: {
        area: selectedMainArea ? AET_FRAMEWORK[selectedMainArea as keyof typeof AET_FRAMEWORK].label : "",
        subTopic: selectedSubTopic,
        intention: selectedIntention
      }
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
      language: genLanguage,
      studentId,
    });
  };

  const handlePrint = async () => {
    const element = document.getElementById("printable-resource");
    if (!element) return;

    // Load Noto Sans Arabic or similar if needed for jsPDF
    // Note: html2canvas captures the rendering correctly, so the imgData will contain the glyphs.
    // However, if we want high-quality PDF text (non-image), we'd need jspdf-autotable or font embedding.
    // For now, html2canvas is the most reliable way to preserve the 'Low-Arousal' styling and Arabic glyphs.

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FDFCF8'
      });
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

  const getAETHeaderColor = (level?: string) => {
    switch (level) {
      case "NYD": return "#EF4444";
      case "D": return "#FACC15";
      case "E": return "#22C55E";
      case "G": return "#3B82F6";
      default: return "var(--low-arousal-border)";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-8rem)] pb-10">
      {/* Settings Panel - Left side (3-Card Stack) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-[420px] flex flex-col gap-6"
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

        {/* Card 1: Active Student Profile */}
        <AnimatePresence mode="wait">
          {selectedStudent ? (
            <motion.div
              key="active-student"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass border-2 border-primary/10 shadow-xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr flex items-center justify-center text-2xl font-bold text-white shadow-lg",
                        getAETColor(selectedStudent.aetLevel).gradient
                      )}>
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-none mb-2">{selectedStudent.name}</h2>
                        <p className="text-lg font-medium text-slate-500 lowercase">{selectedStudent.age} years old</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSelector(true)}
                      className="rounded-xl hover:bg-slate-100 text-slate-400"
                    >
                      <UserCog className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress Level</span>
                      <Badge className={cn(
                        "px-4 py-1.5 rounded-xl font-bold text-xs border-none shadow-sm",
                        getAETColor(selectedStudent.aetLevel).bg,
                        getAETColor(selectedStudent.aetLevel).text
                      )}>
                        {getFullAETLabel(selectedStudent.aetLevel)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Primary Interest</span>
                      <Badge variant="secondary" className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 border-none shadow-sm">
                        {selectedStudent.primaryInterest || "None Set"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="no-student"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 glass rounded-[2.5rem] border-dashed border-2 border-slate-200 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-500 mb-6 px-4 leading-relaxed">Select a student profile to begin personalizing your AET resource.</p>
              <Button onClick={() => setShowSelector(true)} className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                Choose Student
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card 2: AET Framework Selection (The Curriculum Card) */}
        <Card className={cn(
          "glass border-white/50 shadow-xl overflow-hidden rounded-[2.5rem] transition-all duration-500",
          !studentId && "opacity-50 pointer-events-none grayscale"
        )}>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Settings2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Curriculum Target</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-[14px] ml-1">1. Progression Area</Label>
                <Select
                  value={selectedMainArea}
                  onValueChange={(val) => {
                    setSelectedMainArea(val);
                    setSelectedSubTopic("");
                    setSelectedIntention("");
                  }}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-[14px] font-medium focus:ring-primary/20">
                    <SelectValue placeholder="Social Communication..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 p-1">
                    {Object.entries(AET_FRAMEWORK).map(([key, area]) => (
                      <SelectItem key={key} value={key} className="text-[14px] py-3 px-4 rounded-xl">{area.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <AnimatePresence>
                {selectedMainArea && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-2"
                  >
                    <Label className="text-slate-700 font-bold text-[14px] ml-1">2. Sub-Topic</Label>
                    <Select
                      value={selectedSubTopic}
                      onValueChange={(val) => {
                        setSelectedSubTopic(val);
                        setSelectedIntention("");
                      }}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 text-[14px] font-medium focus:ring-primary/20">
                        <SelectValue placeholder="e.g. Making Requests" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 p-1">
                        {Object.entries(AET_FRAMEWORK[selectedMainArea as keyof typeof AET_FRAMEWORK].sub_topics).map(([key, sub]) => (
                          <SelectItem key={key} value={key} className="text-[14px] py-3 px-4 rounded-xl capitalize">{sub.label.replaceAll('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {selectedSubTopic && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="space-y-2"
                  >
                    <Label className="text-slate-700 font-bold text-[14px] ml-1">3. Learning Intention</Label>
                    <Select
                      value={selectedIntention}
                      onValueChange={setSelectedIntention}
                    >
                      <SelectTrigger className="h-auto min-h-14 py-3 rounded-2xl bg-slate-50 border-slate-100 text-[13px] font-medium leading-relaxed text-left focus:ring-primary/20">
                        <SelectValue placeholder="Select final target" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 p-1 w-[360px]">
                        {(AET_FRAMEWORK[selectedMainArea as keyof typeof AET_FRAMEWORK].sub_topics as any)[selectedSubTopic].intentions.map((intention: string) => (
                          <SelectItem key={intention} value={intention} className="text-[13px] py-3 px-4 rounded-xl leading-snug">{intention}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Creative Content Configuration */}
        <Card className={cn(
          "glass border-white/50 shadow-xl overflow-hidden rounded-[2.5rem] transition-all duration-500",
          !selectedIntention && "opacity-50 pointer-events-none grayscale"
        )}>
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Creative Configuration</h3>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold text-[14px] ml-1">Resource Language</Label>
              <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex gap-2">
                <LanguageButton active={genLanguage === "en"} label="EN" onClick={() => setGenLanguage("en")} />
                <LanguageButton active={genLanguage === "ar"} label="AR" onClick={() => setGenLanguage("ar")} />
                <LanguageButton active={genLanguage === "bilingual"} label="BOTH" onClick={() => setGenLanguage("bilingual")} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-[14px] ml-1">Choose Format</Label>
                <div className="grid grid-cols-3 gap-3">
                  <FormatButton active={type === "story"} icon={BookOpen} label="Story" onClick={() => setType("story")} />
                  <FormatButton active={type === "worksheet"} icon={FileText} label="Work" onClick={() => setType("worksheet")} />
                  <FormatButton active={type === "pecs"} icon={LayoutGrid} label="PECS" onClick={() => setType("pecs")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-bold text-[14px] ml-1">Context / Scenario</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Taking turns with toys"
                  className="h-14 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 text-[15px] font-medium"
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full text-lg rounded-2xl h-16 bg-slate-900 hover:bg-black shadow-xl shadow-slate-200 transition-all font-bold mt-2"
              onClick={handleGenerate}
              disabled={generate.isPending}
            >
              {generate.isPending ? (
                <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Tailoring...</>
              ) : (
                <><Sparkles className="mr-3 h-6 w-6 text-indigo-400" /> Create Resource</>
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
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A4 Preview (Interactive Mode)</span>

            {/* Font Control Toolbar */}
            <div className="flex items-center gap-2 bg-white/50 p-1 rounded-xl border border-white/80 shadow-sm ml-4">
              <div className="flex items-center gap-1.5 px-2 border-r border-slate-200">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[10px] font-bold text-slate-500 w-4">{fontSize}</span>
              </div>

              <div className="flex gap-1 px-1 border-r border-slate-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLineHeight("1.2")}
                  className={cn("h-7 w-7 rounded-lg", lineHeight === "1.2" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLineHeight("2")}
                  className={cn("h-7 w-7 rounded-lg", lineHeight === "2" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  <AlignLeft className="w-3.5 h-3.5 scale-y-125" />
                </Button>
              </div>

              <div className="flex gap-1 px-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontFamily("font-sans")}
                  className={cn("h-7 px-2 rounded-lg text-[9px] font-bold", fontFamily === "font-sans" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  Standard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFontFamily("font-dyslexic")}
                  className={cn("h-7 px-2 rounded-lg text-[9px] font-bold", fontFamily === "font-dyslexic" ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  Dyslexic
                </Button>
              </div>
            </div>
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
                className="w-full max-w-[210mm] border-none flex flex-col items-center justify-center text-center opacity-40"
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
                className={cn(
                  "w-full max-w-[210mm] min-h-[297mm] bg-[var(--low-arousal-bg)] text-[var(--low-arousal-text)] shadow-2xl p-[30mm] flex flex-col rounded-sm transition-all duration-300",
                  fontFamily
                )}
                style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
              >
                {/* AET Resource Header */}
                <div
                  className="pb-6 mb-10 flex justify-between items-end border-b-4"
                  style={{ borderBottomColor: getAETHeaderColor(selectedStudent?.aetLevel) }}
                >
                  <div>
                    <h4 className="text-[14px] font-bold uppercase tracking-wider mb-1 opacity-70">AET Specialized Resource</h4>
                    <p className="text-xl font-bold font-sans" contentEditable suppressContentEditableWarning>
                      {selectedStudent?.name} | Target: {selectedIntention || "General Development"} | Level: {getFullAETLabel(selectedStudent?.aetLevel)}
                    </p>
                  </div>
                </div>

                <ResourcePreview content={generatedContent} type={type} mode={genLanguage} onUpdate={(newFullContent) => setGeneratedContent(newFullContent)} />

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
      <StudentSelector
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        students={students || []}
        onSelect={(id) => {
          setStudentId(id);
          const s = students?.find(st => st.id === id);
          if (s) setGenLanguage(s.preferredLanguage as any);
        }}
      />
    </div>
  );
}

function LanguageButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 rounded-xl text-[11px] font-bold transition-all duration-300",
        active ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {label}
    </button>
  );
}

function FormatButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 h-24 gap-2",
        active
          ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
          : "bg-white border-slate-50 text-slate-400 hover:border-slate-100 hover:text-slate-600"
      )}
    >
      <Icon className={cn("w-6 h-6", active ? "text-indigo-400" : "text-slate-300")} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

const getAETHeaderColor = (level?: string) => {
  switch (level) {
    case "NYD": return "#f87171";
    case "D": return "#fbbf24";
    case "E": return "#34d399";
    case "G": return "#60a5fa";
    default: return "#e2e8f0";
  }
};


const getAETColor = (level: string) => {
  switch (level) {
    case "NYD": return { border: "border-red-400", bg: "bg-red-50", text: "text-red-600", gradient: "from-red-400 to-red-500" };
    case "D": return { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-600", gradient: "from-yellow-400 to-yellow-500" };
    case "E": return { border: "border-green-400", bg: "bg-green-50", text: "text-green-600", gradient: "from-green-400 to-green-500" };
    case "G": return { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-400 to-blue-500" };
    default: return { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-600", gradient: "from-primary to-accent" };
  }
};


function ResourcePreview({ content, type, mode, onUpdate }: { content: any, type: string, mode: string, onUpdate: (c: any) => void }) {
  const data = content.content;
  const { toast } = useToast();
  const [regenerating, setRegenerating] = useState<number | null>(null);

  const handleUpdateField = (path: string[], value: string) => {
    const newData = JSON.parse(JSON.stringify(data));
    let curr = newData;
    for (let i = 0; i < path.length - 1; i++) {
      curr = curr[path[i]];
    }
    curr[path[path.length - 1]] = value;
    onUpdate({ ...content, content: newData });
  };

  const handleRegenerateImage = async (idx: number, prompt: string) => {
    setRegenerating(idx);
    try {
      const res = await apiRequest("POST", "/api/ai/regenerate-image", { prompt });
      const { image_url } = await res.json();
      const newData = JSON.parse(JSON.stringify(data));
      if (type === 'story') newData.steps[idx].image_url = image_url;
      else if (type === 'pecs') newData.cards[idx].image_url = image_url;
      onUpdate({ ...content, content: newData });
    } catch (err) {
      toast({ title: "Image regeneration failed", variant: "destructive" });
    } finally {
      setRegenerating(null);
    }
  };

  if (type === "story") {
    return (
      <div className="space-y-12">
        <h2
          className="text-3xl font-bold text-center mb-10 leading-tight outline-none"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ ...content, title: e.currentTarget.innerText })}
        >
          {content.title}
        </h2>

        {data.steps?.map((step: any, idx: number) => (
          <div key={idx} className="grid grid-cols-1 gap-6 pb-10 last:pb-0">
            <div className="relative group/img">
              <div className="w-full flex justify-center">
                {step.image_url ? (
                  <img src={step.image_url} alt="Step" className="max-h-64 object-contain rounded-lg border-2 border-slate-900/5" />
                ) : (
                  <div className="w-full h-40 bg-slate-50 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
                    <Sparkles className="w-8 h-8 opacity-20" />
                  </div>
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-full shadow-lg"
                onClick={() => {
                  const editedText = mode === "ar" ? step.text_ar : step.text_en;
                  const prompt = `Widgit/PCS style symbol of ${editedText}, simple vector, thick bold outlines, flat colors, white background, no shading`;
                  handleRegenerateImage(idx, prompt);
                }}
                disabled={regenerating === idx}
              >
                <RefreshCcw className={cn("w-4 h-4", regenerating === idx && "animate-spin")} />
              </Button>
            </div>

            <div className={cn(
              "grid gap-8 border-t border-slate-100 pt-6 relative group",
              mode === "bilingual" ? "grid-cols-2" : "grid-cols-1"
            )}>
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                <Pencil className="w-3.5 h-3.5" />
              </div>
              {(mode === "en" || mode === "bilingual") && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase opacity-50">English</span>
                  <p
                    className="leading-relaxed outline-none border border-transparent hover:border-slate-100 p-1 rounded transition-all"
                    style={{ fontSize: '1.25em' }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateField(['steps', idx.toString(), 'text_en'], e.currentTarget.innerText)}
                  >
                    {step.text_en || step.text}
                  </p>
                </div>
              )}
              {(mode === "ar" || mode === "bilingual") && (
                <div className="space-y-2 text-right" dir="rtl">
                  <span className="text-[10px] font-bold uppercase opacity-50">العربية</span>
                  <p
                    className="font-medium leading-relaxed font-sans outline-none border border-transparent hover:border-slate-100 p-1 rounded transition-all"
                    style={{ fontSize: '1.5em' }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateField(['steps', idx.toString(), 'text_ar'], e.currentTarget.innerText)}
                  >
                    {step.text_ar || step.text}
                  </p>
                </div>
              )}
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
        <div className="grid grid-cols-2 gap-8">
          {data.cards?.map((card: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border-2 border-slate-300 p-6 rounded-3xl aspect-square flex flex-col items-center justify-between text-center relative group/card"
            >
              <div className="flex-1 flex items-center justify-center p-2">
                {card.image_url ? (
                  <img src={card.image_url} className="max-h-28 w-auto rounded-md object-contain" />
                ) : (
                  <LayoutGrid className="w-12 h-12 opacity-10" />
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-full p-1 h-7 w-7"
                onClick={() => {
                  const editedLabel = mode === "ar" ? card.label_ar : card.label_en;
                  const prompt = `Widgit/PCS style symbol of ${editedLabel}, single isolated object, simple vector, thick bold outlines, flat colors, white background, no shading`;
                  handleRegenerateImage(idx, prompt);
                }}
                disabled={regenerating === idx}
              >
                <RefreshCcw className={cn("w-3 h-3", regenerating === idx && "animate-spin")} />
              </Button>
              <div className="w-full border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 gap-2 relative group">
                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                  <Pencil className="w-2.5 h-2.5" />
                </div>
                {(mode === "en" || mode === "bilingual") && (
                  <p
                    className="text-xs font-bold text-slate-500 uppercase outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateField(['cards', idx.toString(), 'label_en'], e.currentTarget.innerText)}
                  >
                    {card.label_en || card.label}
                  </p>
                )}
                {(mode === "ar" || mode === "bilingual") && (
                  <p
                    className="font-sans font-bold outline-none hover:bg-slate-50 rounded"
                    style={{ fontSize: '1.2em' }}
                    dir="rtl"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => handleUpdateField(['cards', idx.toString(), 'label_ar'], e.currentTarget.innerText)}
                  >
                    {card.label_ar || card.label}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Worksheet
  return (
    <div className="space-y-10" dir={mode === "ar" ? "rtl" : "ltr"}>
      <h2 className="text-3xl font-bold mb-8">{content.title}</h2>
      {data.instructions && (
        <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-md italic opacity-80 mb-10">
          {data.instructions}
        </div>
      )}
      <div className="space-y-16">
        {data.questions?.map((q: any, idx: number) => (
          <div key={idx} className="space-y-6">
            <div className={cn(
              "flex items-start gap-10",
              mode === "ar" ? "flex-col" : (mode === "bilingual" ? "flex-row" : "flex-col")
            )}>
              {(mode === "en" || mode === "bilingual") && (
                <p
                  className="font-bold text-xl outline-none flex-1"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdateField(['questions', idx.toString(), 'text_en'], e.currentTarget.innerText)}
                >
                  {idx + 1}. {q.text_en || q.text}
                </p>
              )}
              {(mode === "ar" || mode === "bilingual") && (
                <p
                  className="text-2xl font-medium text-right font-sans outline-none flex-1"
                  dir="rtl"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleUpdateField(['questions', idx.toString(), 'text_ar'], e.currentTarget.innerText)}
                >
                  {q.text_ar || q.text}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 pt-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square border-2 border-slate-200 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-[10px] text-slate-300 uppercase font-bold gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100" />
                  Drop sticker
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
