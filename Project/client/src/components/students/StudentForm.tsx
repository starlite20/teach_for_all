import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const AET_AREAS = [
  "Social Understanding",
  "Communication and Interaction",
  "Sensory Processing",
  "Interests, Motifs and Repetitive Behaviours",
  "Emotional Understanding",
  "Independence and Community Participation"
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "bilingual", label: "Bilingual" }
];

interface StudentFormProps {
  student?: Student;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentForm({ student, trigger, open: externalOpen, onOpenChange: setExternalOpen }: StudentFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = setExternalOpen ?? setInternalOpen;

  const { t } = useI18n();
  const createStudent = useCreateStudent();
  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent();

  const isEdit = !!student;

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: student?.name ?? "",
      age: student?.age ?? 5,
      aetLevel: student?.aetLevel ?? "NYD",
      communicationLevel: student?.communicationLevel ?? "verbal",
      sensoryPreference: student?.sensoryPreference ?? "",
      learningGoals: student?.learningGoals ?? "",
      primaryInterest: student?.primaryInterest ?? "",
      preferredLanguage: student?.preferredLanguage ?? "en",
    },
  });

  const selectedGoals = form.watch("learningGoals") ? form.watch("learningGoals").split("|").filter(Boolean) : [];

  const toggleGoal = (goal: string) => {
    const current = selectedGoals;
    const next = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    form.setValue("learningGoals", next.join("|"));
  };

  const onSubmit = (data: InsertStudent) => {
    if (isEdit) {
      updateStudent({ id: student.id, data }, {
        onSuccess: () => setOpen(false)
      });
    } else {
      createStudent.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" />
            {t("students.add")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl glass">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl text-primary font-bold">
            {isEdit ? "Edit Student Profile" : t("students.add")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Name</Label>
              <Input {...form.register("name")} placeholder="Student Name" className="rounded-2xl h-12 bg-white/50 border-slate-200 focus:ring-primary/20" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">{t("students.age")}</Label>
              <Input
                type="number"
                {...form.register("age", { valueAsNumber: true })}
                className="rounded-2xl h-12 bg-white/50 border-slate-200 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Preferred Language</Label>
              <Select
                onValueChange={(val) => form.setValue("preferredLanguage", val as any)}
                value={form.watch("preferredLanguage")}
              >
                <SelectTrigger className="rounded-2xl h-12 bg-white/50 border-slate-200">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value} className="rounded-xl py-2">{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Primary Interest</Label>
              <Input
                {...form.register("primaryInterest")}
                placeholder="e.g. Space, Trains"
                className="rounded-2xl h-12 bg-white/50 border-slate-200 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">AET Indicator</Label>
              <Select
                onValueChange={(val) => form.setValue("aetLevel", val)}
                value={form.watch("aetLevel")}
              >
                <SelectTrigger className="rounded-2xl h-12 bg-white/50 border-slate-200">
                  <SelectValue placeholder="Select indicator" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="NYD" className="rounded-xl py-2">Not Yet Developed (NYD)</SelectItem>
                  <SelectItem value="D" className="rounded-xl py-2">Developing (D)</SelectItem>
                  <SelectItem value="E" className="rounded-xl py-2">Established (E)</SelectItem>
                  <SelectItem value="G" className="rounded-xl py-2">Generalised (G)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 ml-1">Communication</Label>
              <Select
                onValueChange={(val) => form.setValue("communicationLevel", val)}
                value={form.watch("communicationLevel")}
              >
                <SelectTrigger className="rounded-2xl h-12 bg-white/50 border-slate-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="verbal" className="rounded-xl py-2">Verbal</SelectItem>
                  <SelectItem value="non-verbal" className="rounded-xl py-2">Non-Verbal</SelectItem>
                  <SelectItem value="pecs" className="rounded-xl py-2">PECS User</SelectItem>
                  <SelectItem value="makaton" className="rounded-xl py-2">Makaton</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-slate-700 ml-1">AET Target Areas</Label>
            <div className="grid grid-cols-1 gap-2 p-4 bg-white/40 rounded-3xl border border-slate-100/50">
              {AET_AREAS.map((area) => (
                <div key={area} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleGoal(area)}>
                  <Checkbox
                    checked={selectedGoals.includes(area)}
                    className="rounded-md"
                  />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">
                    {area}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 min-h-6">
              {selectedGoals.map((goal) => (
                <Badge key={goal} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-1 px-3 rounded-lg">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700 ml-1">Sensory Guidance</Label>
            <Textarea
              {...form.register("sensoryPreference")}
              placeholder="Sensory needs..."
              className="rounded-2xl resize-none bg-white/50 border-slate-200"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl">
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createStudent.isPending || isUpdating}
              className="rounded-2xl px-10 bg-primary font-bold shadow-xl shadow-primary/20"
            >
              {(createStudent.isPending || isUpdating) ? t("common.loading") : (isEdit ? "Update Profile" : t("common.create"))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
