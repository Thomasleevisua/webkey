import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateRandomKey } from "@/lib/utils/key-generator";

interface KeyGeneratorOptions {
  type: "free" | "vip";
  prefix?: string;
  keyLength?: number;
  expiryDays?: number;
  count?: number;
  note?: string;
}

export function useKeyGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate VIP key mutation
  const generateVipKeyMutation = useMutation({
    mutationFn: async (options: Omit<KeyGeneratorOptions, "type">) => {
      return apiRequest("POST", "/api/keys/vip", {
        expiryDays: options.expiryDays || 30,
        count: options.count || 1,
        note: options.note || ""
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      const keyValue = data.keys && data.keys.length > 0 ? data.keys[0].key : null;
      
      setLastGeneratedKey(keyValue);
      
      toast({
        title: "Success",
        description: `VIP key${data.keys.length > 1 ? 's' : ''} generated successfully`,
      });
      
      // Refresh keys data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate VIP key",
        variant: "destructive",
      });
    },
  });

  // Reset free key mutation
  const resetFreeKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/keys/free/reset", {});
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setLastGeneratedKey(data.key || null);
      
      toast({
        title: "Success",
        description: "Free key has been reset",
      });
      
      // Refresh keys data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/keys/free/today"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset free key",
        variant: "destructive",
      });
    },
  });

  // Generate key function
  const generateKey = async (options: KeyGeneratorOptions) => {
    setIsGenerating(true);
    
    try {
      if (options.type === "vip") {
        await generateVipKeyMutation.mutateAsync({
          prefix: options.prefix,
          keyLength: options.keyLength,
          expiryDays: options.expiryDays,
          count: options.count,
          note: options.note
        });
      } else if (options.type === "free") {
        await resetFreeKeyMutation.mutateAsync();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Get a preview of what a generated key would look like
  const getKeyPreview = (options: KeyGeneratorOptions) => {
    if (options.type === "free") {
      // Free key format: THOMAS-5829512090 (calculated based on current day)
      const today = new Date();
      const day = today.getDate();
      return `THOMAS-${day * 2593885817 + 4610273}`;
    } else {
      // VIP key format: THOMAS_xxx (random string)
      return generateRandomKey(options.prefix || "THOMAS_", options.keyLength || 12);
    }
  };

  return {
    generateKey,
    getKeyPreview,
    isGenerating,
    lastGeneratedKey,
    isPendingVip: generateVipKeyMutation.isPending,
    isPendingFree: resetFreeKeyMutation.isPending
  };
}

export default useKeyGenerator;
