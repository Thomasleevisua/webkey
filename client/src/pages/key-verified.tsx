import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { checkKeyValidity } from "@/lib/api/keys";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatKey } from "@/lib/utils/key-generator";
import { Clipboard, CheckCircle, Copy, AlertTriangle } from "lucide-react";

export default function KeyVerified() {
  const [key, setKey] = useState<string | null>(null);
  const [keyType, setKeyType] = useState<"free" | "vip" | "unknown">("unknown");
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [copied, setCopied] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    // Lấy key từ query string
    const searchParams = new URLSearchParams(window.location.search);
    const keyParam = searchParams.get("key");
    
    if (keyParam) {
      setKey(keyParam);
      validateKey(keyParam);
    } else {
      setLoading(false);
    }
  }, [location]);

  const validateKey = async (keyValue: string) => {
    try {
      setLoading(true);
      const result = await checkKeyValidity(keyValue);
      setValid(result.valid);
      setKeyType(result.type as "free" | "vip" | "unknown");
    } catch (error) {
      console.error("Error validating key:", error);
      setValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (key) {
      navigator.clipboard.writeText(key)
        .then(() => {
          setCopied(true);
          toast({
            title: "Key đã được sao chép!",
            description: "Key đã được sao chép vào clipboard của bạn.",
            variant: "default",
          });
          
          // Reset copied status after 2 seconds
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast({
            title: "Không thể sao chép key",
            description: "Đã xảy ra lỗi khi sao chép key.",
            variant: "destructive",
          });
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className={valid ? "bg-green-900/20" : "bg-red-900/20"}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center">
              {valid ? (
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              )}
              {valid ? "Key hợp lệ" : "Key không hợp lệ"}
            </CardTitle>
            {keyType === "vip" && valid && (
              <div className="bg-yellow-500/20 text-yellow-500 px-2 py-1 text-xs rounded-full font-medium">
                VIP
              </div>
            )}
            {keyType === "free" && valid && (
              <div className="bg-blue-500/20 text-blue-500 px-2 py-1 text-xs rounded-full font-medium">
                Free
              </div>
            )}
          </div>
          <CardDescription>
            {valid
              ? "Key này có thể sử dụng cho hệ thống"
              : "Key này không hợp lệ hoặc đã hết hạn"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {key ? (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-400">Key của bạn:</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 text-white p-3 rounded-md font-mono text-sm break-all">
                  {formatKey(key)}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {valid && (
                <div className="pt-2 text-sm text-gray-400">
                  <p>Loại key: <span className="font-medium">{keyType === "vip" ? "VIP" : "Free"}</span></p>
                  {keyType === "free" && (
                    <p className="text-yellow-500 mt-2">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Key free chỉ có hiệu lực trong 24 giờ.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              Không tìm thấy key trong URL. Vui lòng kiểm tra lại đường dẫn.
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t border-gray-800 pt-4 flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Quay lại
          </Button>
          
          {key && valid && (
            <Button onClick={handleCopyToClipboard}>
              <Clipboard className="mr-2 h-4 w-4" />
              Sao chép key
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}