import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/models/auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Brain, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
    const [, setLocation] = useLocation();
    const { user, loginMutation, registerMutation } = useAuth();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    if (user) return null;

    return (
        <div className="min-h-screen mesh-gradient flex flex-col md:flex-row font-sans selection:bg-primary/20 overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <Link href="/">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm font-bold mb-4 cursor-pointer hover:scale-105 transition-transform">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-primary">TeachForAll</span>
                            </div>
                        </Link>
                        <h1 className="text-4xl font-bold font-display text-slate-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 font-medium">Empowering special education with excellence.</p>
                    </div>

                    <div className="glass p-8 rounded-[2rem] shadow-2xl relative">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-slate-100/50 rounded-2xl">
                                <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5">Login</TabsTrigger>
                                <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5">Register</TabsTrigger>
                            </TabsList>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
                                </motion.div>
                            </AnimatePresence>
                        </Tabs>
                    </div>

                    <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                        © 2026 TeachForAll. All rights reserved.
                    </p>
                </motion.div>
            </div>

            <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[100px]" />
                </div>

                <div className="max-w-xl relative z-10 text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-8 shadow-2xl shadow-primary/40">
                            <Brain className="w-10 h-10" />
                        </div>
                        <h2 className="text-5xl font-bold mb-8 font-display leading-tight">
                            Personalized learning for every student profile.
                        </h2>
                        <div className="space-y-6">
                            <StepItem title="Sensory-First Design" desc="Resources optimized for calming sensory interaction." />
                            <StepItem title="Instant AI Generation" desc="Create stories and cards with Gemini 3 Pro model." />
                            <StepItem title="Bilingual Excellence" desc="Seamlessly switch between English and Arabic." />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function StepItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start group">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1 scale-0 group-hover:scale-100 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 leading-none" />
            </div>
            <div>
                <h4 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{title}</h4>
                <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
            </div>
        </div>
    );
}

function LoginForm() {
    const { loginMutation } = useAuth();
    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-5">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Username</FormLabel>
                            <FormControl>
                                <Input placeholder="teacher123" {...field} className="h-12 rounded-xl focus:ring-primary/20 border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl focus:ring-primary/20 border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 mt-2" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
                </Button>
            </form>
        </Form>
    );
}

function RegisterForm() {
    const { registerMutation } = useAuth();
    const form = useForm({
        resolver: zodResolver(insertUserSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Jane" {...field} value={field.value || ""} className="h-12 rounded-xl border-slate-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-700 font-semibold">Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} value={field.value || ""} className="h-12 rounded-xl border-slate-200" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Email</FormLabel>
                            <FormControl>
                                <Input placeholder="teacher@school.org" {...field} value={field.value || ""} className="h-12 rounded-xl border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Username</FormLabel>
                            <FormControl>
                                <Input placeholder="teacher123" {...field} className="h-12 rounded-xl border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-700 font-semibold">Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="h-12 rounded-xl border-slate-200" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 mt-2" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
                </Button>
            </form>
        </Form>
    );
}
