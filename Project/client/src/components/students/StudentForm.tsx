import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { useCreateStudent } from "@/hooks/use-students";
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

const AET_AREAS = [
  "Social Understanding",
  "Communication and Interaction",
  "Sensory Processing",
  "Interests, Motifs and Repetitive Behaviours",
  "Emotional Understanding",
  "Independence and Community Participation"
];

export function StudentForm() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const createStudent = useCreateStudent();

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      age: 5,
      aetLevel: "NYD",
      communicationLevel: "verbal",
      sensoryPreference: "",
      learningGoals: "",
      primaryInterest: "",
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
    createStudent.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          {t("students.add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">{t("students.add")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Student Name" className="rounded-xl h-12" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">{t("students.age")}</Label>
              <Input
                id="age"
                type="number"
                {...form.register("age", { valueAsNumber: true })}
                className="rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryInterest">Primary Interest (Visual Anchor)</Label>
            <Input
              id="primaryInterest"
              {...form.register("primaryInterest")}
              placeholder="e.g. Dinosaurs, Space, Trains"
              className="rounded-xl h-12"
            />
            <p className="text-[10px] text-slate-400 italic">This will be used to theme all generated resources.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("students.aet")}</Label>
              <Select onValueChange={(val) => form.setValue("aetLevel", val)} defaultValue="NYD">
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Select indicator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NYD">Not Yet Developed (NYD)</SelectItem>
                  <SelectItem value="D">Developing (D)</SelectItem>
                  <SelectItem value="E">Established (E)</SelectItem>
                  <SelectItem value="G">Generalised (G)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("students.comm")}</Label>
              <Select onValueChange={(val) => form.setValue("communicationLevel", val)} defaultValue="verbal">
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verbal">Verbal</SelectItem>
                  <SelectItem value="non-verbal">Non-Verbal</SelectItem>
                  <SelectItem value="pecs">PECS User</SelectItem>
                  <SelectItem value="makaton">Makaton</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>AET Target Areas (Multi-select)</Label>
            <div className="grid grid-cols-1 gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              {AET_AREAS.map((area) => (
                <div key={area} className="flex items-center space-x-3">
                  <Checkbox
                    id={area}
                    checked={selectedGoals.includes(area)}
                    onCheckedChange={() => toggleGoal(area)}
                    className="rounded-md"
                  />
                  <label
                    htmlFor={area}
                    className="text-sm font-medium leading-none cursor-pointer text-slate-600 hover:text-primary transition-colors"
                  >
                    {area}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 min-h-6">
              {selectedGoals.map((goal) => (
                <Badge key={goal} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-1 px-3">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sensory Preferences</Label>
            <Textarea
              {...form.register("sensoryPreference")}
              placeholder="e.g. Avoids loud noises, likes deep pressure"
              className="rounded-xl resize-none"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">{t("common.cancel")}</Button>
            <Button type="submit" disabled={createStudent.isPending} className="rounded-xl px-8 bg-primary">
              {createStudent.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
