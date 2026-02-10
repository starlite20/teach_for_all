import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Users, Sparkles, BookOpen, ArrowRight, TrendingUp, Calendar, Zap } from "lucide-react";
import { useStudents } from "@/hooks/use-students";
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

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: students } = useStudents();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-20"
    >
      {/* Welcome Header */}
      <motion.section variants={item} className="relative overflow-hidden p-10 rounded-[2.5rem] glass border-white/40 shadow-2xl shadow-indigo-500/5">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-primary" />
              <span>Teacher Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
              {t("dash.welcome")}, <span className="text-gradient">{user?.firstName || user?.username}</span> 👋
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              {t("dash.subtitle")}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="glass bg-white/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] border-white/20">
              <span className="text-3xl font-bold text-primary">{students?.length || 0}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Students</span>
            </div>
            <div className="glass bg-white/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] border-white/20">
              <span className="text-3xl font-bold text-accent">0</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Resources</span>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      </motion.section>

      {/* Quick Actions */}
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            {t("dash.quick_actions")}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ActionCard
            href="/generator"
            title={t("dash.create_resource")}
            desc="AI-powered stories & cards"
            icon={Sparkles}
            color="text-indigo-600 bg-indigo-50"
          />
          <ActionCard
            href="/students"
            title={t("dash.new_student")}
            desc="Manage specialized profiles"
            icon={Users}
            color="text-emerald-600 bg-emerald-50"
          />
          <ActionCard
            href="/library"
            title={t("nav.library")}
            desc="Browse your creations"
            icon={BookOpen}
            color="text-purple-600 bg-purple-50"
          />
        </div>
      </motion.section>
      <motion.section variants={item}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display text-slate-800 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-500" />
            {t("students.title")}
          </h2>
          <Button variant="ghost" asChild className="text-primary font-bold hover:bg-primary/5 rounded-xl">
            <Link href="/students">
              <span className="flex items-center gap-2">View All <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </Button>
        </div>

        {students?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 glass rounded-[2.5rem] border-dashed border-slate-200"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-bold text-xl mb-2">{t("students.empty")}</p>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">Get started by adding your first student profile to generate personalized resources.</p>
            <Button asChild className="rounded-2xl px-8 h-12 shadow-xl shadow-primary/20">
              <Link href="/students">{t("students.add")}</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {students?.slice(0, 4).map((student, idx) => {
              const colors = getAETColor(student.aetLevel);
              return (
                <motion.div
                  key={student.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={`/generator?studentId=${student.id}`}>
                    <Card className={`p-6 glass border-2 ${colors.border} hover:shadow-2xl transition-all cursor-pointer group rounded-[2rem] h-full`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${colors.gradient} flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform`}>
                          {student.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors truncate">{student.name}</h3>
                          <p className={`text-xs font-bold ${colors.text} uppercase tracking-widest`}>{student.aetLevel}</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

function ActionCard({ href, title, desc, icon: Icon, color }: any) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass p-8 rounded-[2.5rem] border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 group"
      >
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner ${color} group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-slate-800 mb-1">{title}</h3>
          <p className="text-sm font-medium text-slate-400">{desc}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>
      </motion.div>
    </Link>
  );
}
