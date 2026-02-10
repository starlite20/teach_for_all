import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, User, CheckCircle2 } from "lucide-react";
import { type Student } from "@shared/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudentSelectorProps {
    students: Student[];
    isOpen: boolean;
    onSelect: (studentId: number) => void;
    onClose: () => void;
}

export function StudentSelector({ students, isOpen, onSelect, onClose }: StudentSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.primaryInterest?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none glass">
                <DialogHeader className="p-8 pb-0">
                    <DialogTitle className="text-3xl font-display font-bold text-slate-900">Select Student</DialogTitle>
                    <p className="text-slate-500 font-medium">Choose a student to begin generating custom resources.</p>
                </DialogHeader>

                <div className="p-8 pt-6 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by name or interest..."
                            className="h-14 pl-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 text-lg font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {filteredStudents.map((student) => {
                                const colors = getAETColor(student.aetLevel);
                                return (
                                    <motion.div
                                        key={student.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => {
                                            onSelect(student.id);
                                            onClose();
                                        }}
                                        className="group relative cursor-pointer"
                                    >
                                        <div className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300",
                                            "bg-white border-transparent hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 shadow-sm"
                                        )}>
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-md",
                                                colors.gradient
                                            )}>
                                                {student.name.charAt(0)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="font-bold text-slate-900 truncate text-lg">{student.name}</h4>
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-md">
                                                        {student.age}y
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 truncate capitalize">
                                                    {student.primaryInterest || "No interest defined"}
                                                </p>
                                            </div>

                                            <div className={cn(
                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                                colors.bg,
                                                colors.text
                                            )}>
                                                {getAETLabel(student.aetLevel)}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {filteredStudents.length === 0 && (
                            <div className="py-20 text-center opacity-40">
                                <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                <p className="text-lg font-bold text-slate-500">No students found</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const getAETColor = (level: string) => {
    switch (level) {
        case "NYD": return { gradient: "from-red-400 to-red-500", bg: "bg-red-50", text: "text-red-600" };
        case "D": return { gradient: "from-yellow-400 to-yellow-500", bg: "bg-yellow-50", text: "text-yellow-600" };
        case "E": return { gradient: "from-green-400 to-green-500", bg: "bg-green-50", text: "text-green-600" };
        case "G": return { gradient: "from-blue-400 to-blue-500", bg: "bg-blue-50", text: "text-blue-600" };
        default: return { gradient: "from-slate-400 to-slate-500", bg: "bg-slate-50", text: "text-slate-600" };
    }
};

const getAETLabel = (level: string) => {
    switch (level) {
        case "NYD": return "Not Yet Developed";
        case "D": return "Developing";
        case "E": return "Established";
        case "G": return "Generalised";
        default: return level;
    }
};
