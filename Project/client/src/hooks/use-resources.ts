import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertResource } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useStudentResources(studentId: number) {
  return useQuery({
    queryKey: [api.resources.list.path, studentId],
    queryFn: async () => {
      const url = buildUrl(api.resources.list.path, { studentId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch resources");
      return api.resources.list.responses[200].parse(await res.json());
    },
    enabled: !!studentId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertResource) => {
      const res = await fetch(api.resources.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to save resource");
      return api.resources.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific student's resources list
      const url = buildUrl(api.resources.list.path, { studentId: variables.studentId });
      queryClient.invalidateQueries({ queryKey: [url] });
      // Also general list invalidation pattern if needed, though strictly we used the URL as key above
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path, variables.studentId] });
      
      toast({ title: "Saved", description: "Resource saved to library" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resources.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete resource");
    },
    onSuccess: () => {
      // It's hard to know exactly which student ID to invalidate without passing it, 
      // but typically we'd just refetch active queries.
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({ title: "Deleted", description: "Resource removed from library" });
    },
  });
}
