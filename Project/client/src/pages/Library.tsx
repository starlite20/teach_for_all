import { useStudents } from "@/hooks/use-students";
import { useStudentResources } from "@/hooks/use-resources";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Library as LibraryIcon, Search, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResourcePreview } from "@/components/resources/ResourcePreview";
import { Sparkles, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Library() {
  const { t } = useI18n();
  const { data: students } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(undefined);

  if (students?.length && !selectedStudentId) {
    setSelectedStudentId(students[0].id);
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <LibraryIcon className="w-3 h-3" />
            <span>Resource Repository</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight tracking-tight">
            {t("nav.library")}
          </h1>
          <p className="text-slate-500 font-medium mt-2">Access and manage your generated educational materials.</p>
        </div>

        <div className="w-full md:w-72">
          <Label className="text-[10px] mb-2 block text-slate-400 font-bold uppercase tracking-wider ml-1">Filter by Student</Label>
          <Select
            value={selectedStudentId?.toString()}
            onValueChange={(val) => setSelectedStudentId(Number(val))}
          >
            <SelectTrigger className="h-14 rounded-2xl bg-white border-slate-100 font-bold shadow-sm focus:ring-primary/20">
              <SelectValue placeholder="Select student..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 p-2">
              {students?.map(s => (
                <SelectItem key={s.id} value={s.id.toString()} className="rounded-xl py-3 px-4 font-medium mb-1 last:mb-0 cursor-pointer">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedStudentId ? (
          <motion.div
            key={selectedStudentId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ResourceList studentId={selectedStudentId} />
          </motion.div>
        ) : (
          <motion.div variants={item} className="text-center py-32 glass rounded-[3rem] border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-xl">Select a student to view their library.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResourceList({ studentId }: { studentId: number }) {
  const { data: resources, isLoading } = useStudentResources(studentId);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 glass animate-pulse rounded-[2rem]" />
        ))}
      </div>
    );
  }

  if (!resources?.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 glass rounded-[3rem] border-dashed border-slate-200 overflow-hidden relative">
        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
          <LibraryIcon className="w-10 h-10 text-slate-200" />
        </div>
        <p className="text-slate-400 font-bold text-xl relative z-10">No resources saved for this student yet.</p>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
      </motion.div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onView={setSelectedResource}
          />
        ))}
      </div>

      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="max-w-6xl w-full h-[90vh] overflow-hidden p-0 rounded-[3rem] border-none shadow-2xl flex flex-col">
          {selectedResource && (
            <div className="flex flex-col h-full bg-slate-50 relative">
              <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Resource Viewer</span>
                  <h2 className="text-3xl font-bold font-display text-slate-900">{selectedResource.title}</h2>
                </div>
                <Button
                  onClick={async () => {
                    const element = document.getElementById("library-printable-resource");
                    if (!element) return;
                    try {
                      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
                      const imgData = canvas.toDataURL("image/png");
                      const pdf = new jsPDF("p", "mm", "a4");
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      const pdfHeight = pdf.internal.pageSize.getHeight();
                      const imgHeight = canvas.height * pdfWidth / canvas.width;
                      let heightLeft = imgHeight;
                      let position = 0;

                      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                      heightLeft -= pdfHeight;

                      while (heightLeft > 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                        heightLeft -= pdfHeight;
                      }
                      pdf.save(`${selectedResource.title}.pdf`);
                    } catch (e) { console.error(e); }
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print PDF
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div
                  id="library-printable-resource"
                  className={cn(
                    "bg-white text-slate-900 shadow-2xl p-[20mm] flex flex-col rounded-sm transition-all duration-300 origin-top mx-auto",
                    // Use settings from content if available, else default
                    selectedResource.content?.settings?.fontFamily || "font-sans"
                  )}
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    fontSize: `${selectedResource.content?.settings?.fontSize || 18}px`,
                    lineHeight: selectedResource.content?.settings?.lineHeight || "1.5",
                    transformOrigin: "top center",
                    marginBottom: "-30mm",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                >
                  {/* Header */}
                  <div className="pb-6 mb-10 flex justify-between items-center border-b-2 border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none mb-1">{selectedResource.title}</h1>
                        <p className="text-lg font-medium text-slate-500">Student Resource</p>
                      </div>
                    </div>
                    <div className="text-right opacity-50">
                      <p className="text-xs font-bold uppercase tracking-widest">TeachForAll</p>
                      <p className="text-[10px]">{new Date(selectedResource.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <ResourcePreview
                    content={selectedResource.content}
                    type={selectedResource.type}
                    mode={selectedResource.language || "en"}
                    onUpdate={() => { }} // Read-only in library
                  />

                  {/* Footer */}
                  <div className="mt-auto pt-8 border-t border-slate-100 text-[10px] italic flex justify-between opacity-50">
                    <span>Generated by TeachForAll | Library ID: {selectedResource.id}</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
