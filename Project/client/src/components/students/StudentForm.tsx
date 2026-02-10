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
import { Plus } from "lucide-react";

export function StudentForm() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const createStudent = useCreateStudent();
  
  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      age: 5,
      aetLevel: "emerging",
      communicationLevel: "verbal",
      sensoryPreference: "",
      learningGoals: "",
    },
  });

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
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">{t("students.add")}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} placeholder="Student Name" className="rounded-xl" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">{t("students.age")}</Label>
              <Input 
                id="age" 
                type="number" 
                {...form.register("age", { valueAsNumber: true })} 
                className="rounded-xl" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("students.aet")}</Label>
              <Select onValueChange={(val) => form.setValue("aetLevel", val)} defaultValue="emerging">
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_yet_started">Not Yet Started</SelectItem>
                  <SelectItem value="emerging">Emerging</SelectItem>
                  <SelectItem value="developing">Developing</SelectItem>
                  <SelectItem value="secure">Secure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("students.comm")}</Label>
              <Select onValueChange={(val) => form.setValue("communicationLevel", val)} defaultValue="verbal">
                <SelectTrigger className="rounded-xl">
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

          <div className="space-y-2">
            <Label>Sensory Preferences</Label>
            <Textarea 
              {...form.register("sensoryPreference")} 
              placeholder="e.g. Avoids loud noises, likes deep pressure"
              className="rounded-xl resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Goals</Label>
            <Textarea 
              {...form.register("learningGoals")} 
              placeholder="e.g. To initiate play with peers"
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
            <Button type="submit" disabled={createStudent.isPending}>
              {createStudent.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
