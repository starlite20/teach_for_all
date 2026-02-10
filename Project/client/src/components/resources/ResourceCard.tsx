import { type Resource } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, LayoutGrid, Trash2, Printer } from "lucide-react";
import { useDeleteResource } from "@/hooks/use-resources";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";

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
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon className="w-5 h-5" />
        </div>
        <Badge variant="secondary" className="font-normal text-xs uppercase tracking-wider bg-secondary/30 text-secondary-foreground">
          {typeLabel}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <CardTitle className="text-lg font-bold mb-1 line-clamp-2 leading-tight">
          {resource.title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {resource.createdAt ? format(new Date(resource.createdAt), "PPP") : ""}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-border/50 pt-4 gap-2">
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white"
          onClick={() => onView(resource)}
        >
          View
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteResource.mutate(resource.id)}
          disabled={deleteResource.isPending}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
