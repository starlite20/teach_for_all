import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Library,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const { t, language, setLanguage, dir } = useI18n();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/students", label: t("nav.students"), icon: Users },
    { href: "/generator", label: t("nav.generator"), icon: Sparkles },
    { href: "/library", label: t("nav.library"), icon: Library },
  ];

  const toggleLang = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden" dir={dir}>
      {/* Mesh Background for Dashboard */}
      <div className="fixed inset-0 mesh-gradient opacity-40 pointer-events-none" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 z-[60] md:hidden backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 z-[70] w-72 h-screen transform transition-all duration-500 ease-in-out flex flex-col p-6",
          dir === "rtl" ? "right-0" : "left-0",
          !isMobileMenuOpen && (dir === "rtl" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0")
        )}
      >
        <div className="glass rounded-[2rem] h-full flex flex-col shadow-2xl shadow-indigo-500/10 border-white/50 relative overflow-hidden">
          {/* Sidebar Top */}
          <div className="p-8 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform p-1.5 border border-slate-100">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 font-display">TeachForAll</h1>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: isActive ? 0 : (dir === 'rtl' ? -4 : 4) }}
                    className={cn(
                      "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group cursor-pointer relative",
                      isActive
                        ? "bg-primary text-white shadow-xl shadow-primary/30"
                        : "text-slate-500 hover:bg-white hover:text-primary hover:shadow-lg hover:shadow-slate-200/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="font-semibold flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Profile & Settings */}
          <div className="p-6 mt-auto border-t border-slate-100/50">
            <div className="bg-slate-50/50 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                  {user.firstName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.firstName || user.username}</p>
                  <p className="text-xs text-slate-500 truncate font-medium">{user.email || 'Teacher Account'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-lg bg-white shadow-sm hover:bg-slate-50 text-xs font-semibold h-10 gap-2 border border-slate-100"
                  onClick={toggleLang}
                >
                  <Globe className="w-3 h-3 text-primary" />
                  {language === "en" ? "العربية" : "English"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-lg text-slate-400 hover:bg-destructive/10 hover:text-destructive border border-slate-100 bg-white"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-[50]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display">TeachForAll</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
