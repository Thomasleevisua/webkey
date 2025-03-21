import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreateVipKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateVipKeyModal({ open, onOpenChange }: CreateVipKeyModalProps) {
  const [keyPrefix, setKeyPrefix] = useState("THOMAS_");
  const [keyLength, setKeyLength] = useState("12");
  const [expiryDays, setExpiryDays] = useState("30");
  const [keyCount, setKeyCount] = useState("1");
  const [note, setNote] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createVipKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/keys/vip", {
        expiryDays: parseInt(expiryDays),
        count: parseInt(keyCount),
        note,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: `${keyCount} VIP key(s) created successfully`,
        variant: "default",
      });
      
      // Reset form
      setNote("");
      setKeyCount("1");
      
      // Close modal
      onOpenChange(false);
      
      // Invalidate keys queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create VIP key(s)",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (parseInt(keyCount) < 1 || parseInt(keyCount) > 100) {
      toast({
        title: "Invalid input",
        description: "Number of keys must be between 1 and 100",
        variant: "destructive",
      });
      return;
    }

    createVipKeyMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-850 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Tạo Key VIP Mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="keyPrefix" className="text-sm text-gray-300">Tiền Tố Key</Label>
            <Input
              id="keyPrefix"
              value={keyPrefix}
              onChange={(e) => setKeyPrefix(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="keyLength" className="text-sm text-gray-300">Độ Dài Chuỗi Ngẫu Nhiên</Label>
            <Select
              value={keyLength}
              onValueChange={setKeyLength}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select key length" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                <SelectItem value="8">8 ký tự</SelectItem>
                <SelectItem value="12">12 ký tự</SelectItem>
                <SelectItem value="16">16 ký tự</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="expiryDays" className="text-sm text-gray-300">Thời Hạn</Label>
            <Select
              value={expiryDays}
              onValueChange={setExpiryDays}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select expiry period" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="90">90 ngày</SelectItem>
                <SelectItem value="365">365 ngày</SelectItem>
                <SelectItem value="0">Vĩnh viễn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="keyCount" className="text-sm text-gray-300">Số Lượng</Label>
            <Input
              id="keyCount"
              type="number"
              value={keyCount}
              onChange={(e) => setKeyCount(e.target.value)}
              min="1"
              max="100"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="note" className="text-sm text-gray-300">Ghi Chú</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú về key này..."
              className="bg-gray-700 border-gray-600 text-white h-20"
            />
          </div>
        </div>

        <DialogFooter className="space-x-3">
          <DialogClose asChild>
            <Button variant="secondary" className="bg-gray-700">Hủy</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={createVipKeyMutation.isPending}
            className="bg-primary"
          >
            {createVipKeyMutation.isPending ? "Đang tạo..." : "Tạo Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
