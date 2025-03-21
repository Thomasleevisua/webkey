import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Clipboard, Copy } from "lucide-react";

export default function QuickActions() {
  const [keyPrefix, setKeyPrefix] = useState("THOMAS_");
  const [expiryDays, setExpiryDays] = useState("30");
  const [apiKeyDescription, setApiKeyDescription] = useState("");
  const [apiKeyPermission, setApiKeyPermission] = useState("read-only");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's free key
  const { data: freeKeyData, isLoading: freeKeyLoading } = useQuery({
    queryKey: ["/api/keys/free/today"],
  });

  // Create VIP key mutation
  const createVipKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/keys/vip", {
        expiryDays: parseInt(expiryDays),
        note: "Created from dashboard",
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: "VIP key created successfully",
        variant: "default",
      });
      // Invalidate keys queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create VIP key",
        variant: "destructive",
      });
    },
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/apikeys", {
        description: apiKeyDescription,
        permissions: apiKeyPermission,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: "API key created successfully",
        variant: "default",
      });
      setApiKeyDescription("");
      // Invalidate API keys queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/apikeys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Reset free key mutation
  const resetFreeKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/keys/free/reset", {});
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Free key has been reset",
        variant: "default",
      });
      // Invalidate free key query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/keys/free/today"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset free key",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Key copied to clipboard",
      variant: "default",
    });
  };

  return (
    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="font-medium">Thao Tác Nhanh</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Create VIP Key */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-white">Tạo Key VIP Mới</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Mẫu Key</Label>
              <Input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={keyPrefix}
                onChange={(e) => setKeyPrefix(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Thời Hạn</Label>
              <Select
                value={expiryDays}
                onValueChange={setExpiryDays}
              >
                <SelectTrigger className="w-full bg-gray-700 border border-gray-600 text-sm text-white">
                  <SelectValue placeholder="Chọn thời hạn" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border border-gray-600 text-white">
                  <SelectItem value="7">7 ngày</SelectItem>
                  <SelectItem value="30">30 ngày</SelectItem>
                  <SelectItem value="90">90 ngày</SelectItem>
                  <SelectItem value="365">365 ngày</SelectItem>
                  <SelectItem value="0">Vĩnh viễn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white"
              onClick={() => createVipKeyMutation.mutate()}
              disabled={createVipKeyMutation.isPending}
            >
              {createVipKeyMutation.isPending ? "Đang tạo..." : "Tạo Key VIP"}
            </Button>
          </div>
        </div>

        {/* Generate Today's Free Key */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-white">Key Free Hôm Nay</h4>
          <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
            <p className="text-xs text-gray-400 mb-1">Key tự động:</p>
            <div className="flex">
              <Input
                type="text"
                readOnly
                className="flex-1 bg-gray-800 border border-gray-600 rounded-l text-sm text-white"
                value={freeKeyLoading ? "Loading..." : freeKeyData?.key || "Not available"}
              />
              <Button
                className="bg-primary hover:bg-primary-dark text-white px-3 rounded-r border border-primary"
                onClick={() => copyToClipboard(freeKeyData?.key || "")}
                disabled={freeKeyLoading || !freeKeyData?.key}
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-green-500 mt-2">
              Tự động thay đổi sau 00:00 hàng ngày
            </p>
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => resetFreeKeyMutation.mutate()}
            disabled={resetFreeKeyMutation.isPending}
          >
            {resetFreeKeyMutation.isPending ? "Đang tạo lại..." : "Tạo Lại Key Free"}
          </Button>
        </div>

        {/* Generate API Key */}
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-white">Tạo API Key</h4>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Tên Mô Tả</Label>
              <Input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="API cho ứng dụng..."
                value={apiKeyDescription}
                onChange={(e) => setApiKeyDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Quyền Truy Cập</Label>
              <Select
                value={apiKeyPermission}
                onValueChange={setApiKeyPermission}
              >
                <SelectTrigger className="w-full bg-gray-700 border border-gray-600 text-sm text-white">
                  <SelectValue placeholder="Chọn quyền truy cập" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border border-gray-600 text-white">
                  <SelectItem value="read-only">Chỉ đọc</SelectItem>
                  <SelectItem value="full-access">Toàn quyền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => createApiKeyMutation.mutate()}
              disabled={createApiKeyMutation.isPending || !apiKeyDescription}
            >
              {createApiKeyMutation.isPending ? "Đang tạo..." : "Tạo API Key"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
