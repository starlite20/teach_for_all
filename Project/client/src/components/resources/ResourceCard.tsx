import { type Resource } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, LayoutGrid, Trash2, Printer, Eye } from "lucide-react";
import { useDeleteResource } from "@/hooks/use-resources";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ResourceCardProps {
  resource: Resource;
  onView: (resource: Resource) => void;
}

export function ResourceCard({ resource, onView }: ResourceCardProps) {
  const { t } = useI18n();
  const deleteResource = useDeleteResource();

  const icons = {
    story: BookOpen,
    worksheet: FileText,
    pecs: LayoutGrid,
  };

  const Icon = icons[resource.type as keyof typeof icons] || FileText;
  const typeLabel = t(`type.${resource.type}`);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden group rounded-[2rem] h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant="secondary" className="bg-slate-100/50 text-slate-500 rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest border-none">
            {typeLabel}
          </Badge>
        </CardHeader>

        <CardContent className="px-6 py-4 flex-1">
          <CardTitle className="text-lg font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {resource.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest italic">
              {resource.createdAt ? format(new Date(resource.createdAt), "MMM d, yyyy") : "Saved"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-2">
          <Button
            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-primary text-slate-600 hover:text-white font-bold transition-all duration-500"
            onClick={() => onView(resource)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11 rounded-xl text-slate-300 hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
            onClick={() => {
              if (confirm("Delete this resource?")) {
                deleteResource.mutate(resource.id);
              }
            }}
            disabled={deleteResource.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
