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
  X 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage, dir } = useI18n();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If no user, render children directly (likely landing page or login redirect)
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
    <div className="min-h-screen bg-background flex" dir={dir}>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed md:static inset-y-0 z-50 w-64 bg-white border-r border-border shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col",
          dir === "rtl" ? "right-0 border-l border-r-0" : "left-0",
          !isMobileMenuOpen && (dir === "rtl" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0")
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary font-display">AET Assist</h1>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center gap-3 px-4 py-2">
             <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground font-bold">
               {user.firstName?.[0] || user.email?.[0] || "U"}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium truncate">{user.firstName || "User"}</p>
               <p className="text-xs text-muted-foreground truncate">{user.email}</p>
             </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={toggleLang}
            >
              {language === "en" ? "العربية" : "English"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => logout()}
              title={t("nav.logout")}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
          <h1 className="text-xl font-bold text-primary font-display">AET Assist</h1>
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
