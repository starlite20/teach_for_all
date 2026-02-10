import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles, Brain, Heart } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex flex-col font-sans">
      <header className="px-6 py-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold font-display text-primary">AET Assist</h1>
        <Button asChild className="rounded-full px-6">
          <a href="/api/login">Teacher Login</a>
        </Button>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30 text-accent-foreground text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Special Education Tools</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 font-display animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Personalized resources <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            for every unique mind.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Create autism-friendly social stories, visual worksheets, and communication cards in seconds. Bilingual English & Arabic support.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Button asChild size="lg" className="text-lg px-8 py-6 rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <a href="/api/login">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full text-left animate-in fade-in zoom-in duration-1000 delay-500">
          <FeatureCard 
            icon={Brain}
            title="AET Aligned"
            description="Resources designed following Autism Education Trust guidelines for sensory and communication needs."
            color="bg-blue-100 text-blue-600"
          />
          <FeatureCard 
            icon={Sparkles}
            title="AI Generated"
            description="Instantly generate personalized content tailored to each student's specific interests and abilities."
            color="bg-purple-100 text-purple-600"
          />
          <FeatureCard 
            icon={Heart}
            title="Autism Friendly"
            description="Visual-first designs with calming colors, clear typography, and predictable layouts."
            color="bg-teal-100 text-teal-600"
          />
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        © 2024 AET Assist. Built with care.
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
