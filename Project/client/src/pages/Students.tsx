import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { useI18n } from "@/lib/i18n";
import { StudentForm } from "@/components/students/StudentForm";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, User, MessageCircle, Brain, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Students() {
  const { data: students, isLoading } = useStudents();
  const { t } = useI18n();
  const deleteStudent = useDeleteStudent();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{t("students.title")}</h1>
          <p className="text-muted-foreground mt-1">Manage profiles and track progress</p>
        </div>
        <StudentForm />
      </div>

      {!students?.length ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-border text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("students.empty")}</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Create profiles to personalize resources based on each student's sensory and communication needs.
          </p>
          <StudentForm />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-xl transition-all duration-300 border-border/50 bg-white/80 backdrop-blur-sm group">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-display font-bold text-primary group-hover:scale-105 transition-transform">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <Badge variant="outline" className="mt-1 font-normal bg-background">
                    {student.age} years old
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-muted-foreground w-24">Level:</span>
                  <span className="font-medium capitalize">{student.aetLevel.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground w-24">Comm:</span>
                  <span className="font-medium capitalize">{student.communicationLevel}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-border/50 flex gap-2">
                <Button asChild variant="default" className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white">
                  <Link href={`/generator?studentId=${student.id}`}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Resource
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (confirm("Are you sure? This will delete the student profile.")) {
                      deleteStudent.mutate(student.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
