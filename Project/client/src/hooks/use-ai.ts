import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type GenerateRequest = z.infer<typeof api.ai.generate.input>;
type GenerateResponse = z.infer<typeof api.ai.generate.responses[200]>;

export function useGenerateResource() {
  const { toast } = useToast();

  return useMutation<GenerateResponse, Error, GenerateRequest>({
    mutationFn: async (data) => {
      const res = await fetch(api.ai.generate.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate resource");
      }
      
      return api.ai.generate.responses[200].parse(await res.json());
    },
    onError: (err) => {
      toast({ 
        title: "Generation Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    },
  });
}
