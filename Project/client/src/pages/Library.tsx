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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-[3rem] border-none shadow-2xl">
          {selectedResource && (
            <div className="flex flex-col h-full bg-slate-50">
              <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Resource Viewer</span>
                  <h2 className="text-3xl font-bold font-display text-slate-900">{selectedResource.title}</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                  <pre className="whitespace-pre-wrap font-sans text-lg text-slate-700 leading-relaxed">
                    {/* In a real app, reuse the ResourcePreview component from Generator.tsx */}
                    {JSON.stringify(selectedResource.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
