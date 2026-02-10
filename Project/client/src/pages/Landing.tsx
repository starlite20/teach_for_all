import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Heart, Zap, Shield, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen mesh-gradient flex flex-col font-sans selection:bg-primary/20">
      <header className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900">AET Assist</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button asChild variant="ghost" className="rounded-full px-6 mr-2 font-medium">
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link href="/auth">Get Started</Link>
          </Button>
        </motion.div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8"
            >
              <Zap className="w-4 h-4 fill-primary" />
              <span>Next-Gen Special Education</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 mb-8 font-display leading-[1.1]"
            >
              Excellence for <br />
              <span className="text-gradient">Every Student.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-slate-600 max-w-xl mb-12 leading-relaxed"
            >
              Empower your teaching with AI-generated social stories, interactive worksheets, and visual cards tailored to autism-specific learning profiles.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 text-lg px-10 rounded-full shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all duration-300">
                <Link href="/auth">
                  Start Building <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 text-lg px-10 rounded-full border-2 hover:bg-slate-50">
                <Link href="/auth">View Demo</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-12 flex items-center gap-8 text-slate-400 font-medium"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Bilingual Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>AET Aligned</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="glass rounded-[2rem] p-4 shadow-3xl relative z-10 overflow-hidden">
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                <div className="text-center p-8">
                  <LayoutDashboard className="w-20 h-20 text-primary/20 mx-auto mb-6" />
                  <div className="space-y-3 max-w-xs mx-auto">
                    <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-3 w-4/5 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-200 rounded-full animate-pulse mx-auto" />
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse" />
          </motion.div>
        </div>

        <div className="mt-32 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Brain}
            title="Personalized Learning"
            description="AI understands each student's sensory profile and learning goals to produce relevant content."
            delay={0.6}
          />
          <FeatureCard
            icon={Sparkles}
            title="Instant Generation"
            description="Create visual resources, PECS cards, and social stories in seconds with Gemini 3 Pro."
            delay={0.7}
          />
          <FeatureCard
            icon={Shield}
            title="Scientifically Grounded"
            description="Designed based on core pedagogical principles for autism and special education excellence."
            delay={0.8}
          />
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200/50 text-center text-slate-400 font-medium">
        <p>© 2024 AET Assist. Elevating Special Education.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      className="glass p-10 rounded-[2.5rem] hover:shadow-2xl transition-all border-white/50 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform text-primary">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold mb-4 font-display text-slate-800">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-lg">{description}</p>
    </motion.div>
  );
}
