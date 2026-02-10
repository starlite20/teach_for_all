import { useStudents } from "@/hooks/use-students";
import { useStudentResources } from "@/hooks/use-resources";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Library() {
  const { t } = useI18n();
  const { data: students } = useStudents();
  
  // Default to first student if available, or allow null
  const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(undefined);

  // Auto-select first student when data loads
  if (students?.length && !selectedStudentId) {
    setSelectedStudentId(students[0].id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{t("nav.library")}</h1>
          <p className="text-muted-foreground">Access saved resources</p>
        </div>
        
        <div className="w-64">
           <Label className="text-xs mb-1 block text-muted-foreground">Filter by Student</Label>
           <Select 
             value={selectedStudentId?.toString()} 
             onValueChange={(val) => setSelectedStudentId(Number(val))}
           >
             <SelectTrigger className="bg-white">
               <SelectValue placeholder="Select student..." />
             </SelectTrigger>
             <SelectContent>
               {students?.map(s => (
                 <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      {selectedStudentId ? (
        <ResourceList studentId={selectedStudentId} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Select a student to view their library.
        </div>
      )}
    </div>
  );
}

function ResourceList({ studentId }: { studentId: number }) {
  const { data: resources, isLoading } = useStudentResources(studentId);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  if (!resources?.length) {
    return (
      <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
        <p className="text-muted-foreground">No resources saved for this student yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {resources.map((resource) => (
          <ResourceCard 
            key={resource.id} 
            resource={resource} 
            onView={setSelectedResource}
          />
        ))}
      </div>

      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedResource && (
             <div className="space-y-4">
                <h2 className="text-2xl font-bold font-display text-primary">{selectedResource.title}</h2>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {/* In a real app, reuse the ResourcePreview component from Generator.tsx */}
                    {JSON.stringify(selectedResource.content, null, 2)}
                  </pre>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
