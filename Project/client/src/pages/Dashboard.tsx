import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useStudents } from "@/hooks/use-students";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: students } = useStudents();

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary/10 to-accent/20 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">
            {t("dash.welcome")} {user?.firstName} 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t("dash.subtitle")}
          </p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 font-display flex items-center gap-2">
          {t("dash.quick_actions")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <ActionCard 
            href="/generator"
            title={t("dash.create_resource")}
            icon={Sparkles}
            color="bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300"
          />
          <ActionCard 
            href="/students"
            title={t("dash.new_student")}
            icon={Users}
            color="bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300"
          />
          <ActionCard 
            href="/library"
            title={t("nav.library")}
            icon={BookOpen}
            color="bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300"
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display">{t("students.title")}</h2>
          <Button variant="link" asChild className="text-primary">
            <Link href="/students">View All <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        
        {students?.length === 0 ? (
           <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
             <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
             <p className="text-muted-foreground">{t("students.empty")}</p>
             <Button asChild variant="outline" className="mt-4">
               <Link href="/students">{t("students.add")}</Link>
             </Button>
           </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {students?.slice(0, 4).map(student => (
              <Card key={student.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center text-lg font-bold text-secondary-foreground">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold">{student.name}</h3>
                  <p className="text-xs text-muted-foreground">{student.aetLevel}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionCard({ href, title, icon: Icon, color }: any) {
  return (
    <Link href={href}>
      <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4 ${color}`}>
        <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
        <span className="font-bold text-lg">{title}</span>
      </div>
    </Link>
  );
}
