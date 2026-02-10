import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { useI18n } from "@/lib/i18n";
import { StudentForm } from "@/components/students/StudentForm";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, MessageCircle, Brain, Sparkles, Plus, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

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

const getAETColor = (level: string) => {
  switch (level) {
    case "NYD": return { border: "border-red-400", bg: "bg-red-50", text: "text-red-600", gradient: "from-red-400 to-red-500" };
    case "D": return { border: "border-yellow-400", bg: "bg-yellow-50", text: "text-yellow-600", gradient: "from-yellow-400 to-yellow-500" };
    case "E": return { border: "border-green-400", bg: "bg-green-50", text: "text-green-600", gradient: "from-green-400 to-green-500" };
    case "G": return { border: "border-blue-400", bg: "bg-blue-50", text: "text-blue-600", gradient: "from-blue-400 to-blue-500" };
    default: return { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-600", gradient: "from-primary to-accent" };
  }
};

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const { t } = useI18n();
  const deleteStudent = useDeleteStudent();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[320px] glass animate-pulse rounded-[2.5rem]" />
        ))}
      </div>
    );
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
            <GraduationCap className="w-3 h-3" />
            <span>Student Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 leading-tight tracking-tight">
            {t("students.title")}
          </h1>
          <p className="text-slate-500 font-medium mt-2">Personalize profiles for sensory and communication needs.</p>
        </div>
        <StudentForm />
      </motion.div>

      {!students?.length ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-32 glass rounded-[3rem] border-dashed border-slate-200 text-center relative overflow-hidden">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
            <User className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{t("students.empty")}</h3>
          <p className="text-slate-500 font-medium max-w-sm mb-10 text-lg leading-relaxed">
            Create profiles to personalize resources based on each student's unique learning profile.
          </p>
          <StudentForm />

          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px]" />
        </motion.div>
      ) : (
        <motion.div variants={container} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students.map((student) => {
            const colors = getAETColor(student.aetLevel);
            return (
              <motion.div key={student.id} variants={item} whileHover={{ y: -8 }}>
                <Card className={cn(
                  "glass bg-white/40 border-2 shadow-xl shadow-indigo-500/5 hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-[2.5rem] h-full flex flex-col",
                  colors.border
                )}>
                  <CardHeader className="p-8 flex flex-row items-center gap-6 pb-6 border-b border-slate-100/50">
                    <div className={cn(
                      "w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr flex items-center justify-center text-3xl font-display font-bold text-white shadow-xl group-hover:scale-110 transition-transform duration-500",
                      colors.gradient
                    )}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <CardTitle className="text-2xl font-bold text-slate-900 mb-2 truncate">{student.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-slate-100/50 text-slate-600 rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                          {student.age}y
                        </Badge>
                        <Badge className={cn("rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider border-none", colors.bg, colors.text)}>
                          {student.aetLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-5 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Comm</span>
                        </div>
                        <p className="font-bold text-slate-800 capitalize leading-tight">{student.communicationLevel}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Plus className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Lang</span>
                        </div>
                        <p className="font-bold text-slate-800 capitalize leading-tight">{student.preferredLanguage}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {student.learningGoals?.split('|').slice(0, 2).map((goal: string) => (
                        <Badge key={goal} variant="outline" className="text-[9px] border-slate-200 text-slate-500 rounded-lg font-medium">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0 flex gap-3">
                    <Button asChild className="flex-1 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 text-base font-bold">
                      <Link href={`/generator?studentId=${student.id}`}>
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          Generate
                        </span>
                      </Link>
                    </Button>

                    <StudentForm
                      student={student}
                      trigger={
                        <Button
                          variant="ghost"
                          className="w-14 h-14 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 transition-colors"
                        >
                          <UserCog className="w-5 h-5 text-indigo-500" />
                        </Button>
                      }
                    />

                    <Button
                      variant="ghost"
                      className="w-14 h-14 rounded-2xl bg-white border border-slate-100 hover:bg-destructive/10 hover:text-destructive text-slate-400 transition-colors"
                      onClick={() => {
                        if (confirm("Are you sure? This will delete the student profile.")) {
                          deleteStudent.mutate(student.id);
                        }
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}

          <motion.div variants={item} whileHover={{ y: -8 }}>
            <StudentForm
              trigger={
                <div className="h-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 bg-white/30 hover:bg-white hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all scale-100 group-hover:rotate-90">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="mt-4 font-bold text-slate-400 group-hover:text-primary transition-colors uppercase tracking-widest text-xs">Add New Profile</p>
                </div>
              }
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

import { cn } from "@/lib/utils";
import { Users, UserCog } from "lucide-react";
