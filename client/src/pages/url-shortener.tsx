import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { shortenUrl, shortenUrlExternal, createPastebin } from "@/lib/api/url";
import { getKeys } from "@/lib/api/keys";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Copy, ExternalLink, Link as LinkIcon, ExternalLink as ExternalLinkIcon, Key } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Validation schema cho form rút gọn URL nội bộ
const internalUrlShortenerSchema = z.object({
  url: z.string().url("Vui lòng nhập URL hợp lệ"),
  keyId: z.string().optional(),
});

// Validation schema cho form tạo Pastebin
const externalUrlShortenerSchema = z.object({
  key: z.string().min(1, "Vui lòng chọn một key để tạo Pastebin"),
});

type InternalUrlShortenerFormValues = z.infer<typeof internalUrlShortenerSchema>;
type ExternalUrlShortenerFormValues = z.infer<typeof externalUrlShortenerSchema>;

export default function UrlShortener() {
  const { toast } = useToast();
  const [shortUrl, setShortUrl] = useState<string>("");
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"internal" | "external" | "about">("internal");

  // Lấy danh sách keys để chọn trong form
  const { data: keysData } = useQuery({
    queryKey: ['/api/keys'],
    queryFn: async () => {
      try {
        const data = await getKeys();
        return data;
      } catch (error) {
        console.error("Error fetching keys:", error);
        return { keys: [], total: 0 };
      }
    }
  });

  // Form cho rút gọn URL nội bộ
  const internalForm = useForm<InternalUrlShortenerFormValues>({
    resolver: zodResolver(internalUrlShortenerSchema),
    defaultValues: {
      url: "",
      keyId: "none",
    },
  });

  // Form cho tạo Pastebin
  const externalForm = useForm<ExternalUrlShortenerFormValues>({
    resolver: zodResolver(externalUrlShortenerSchema),
    defaultValues: {
      key: "none",
    },
  });

  // Mutation cho việc rút gọn URL nội bộ
  const { mutate: mutateInternal, isPending: isPendingInternal } = useMutation({
    mutationFn: async (data: InternalUrlShortenerFormValues) => {
      // Nếu keyId là "none" hoặc rỗng, không gửi keyId
      const keyId = data.keyId && data.keyId !== "none" ? parseInt(data.keyId) : undefined;
      return shortenUrl(data.url, keyId);
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setShortUrl(data.shortenedUrl);
        setOriginalUrl(data.originalUrl);
        toast({
          title: "URL đã được rút gọn thành công!",
          description: "Bạn có thể sao chép URL ngắn để sử dụng.",
          variant: "default",
        });
      } else {
        toast({
          title: "Lỗi rút gọn URL",
          description: data.message || "Có lỗi xảy ra khi rút gọn URL",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi rút gọn URL",
        description: "Có lỗi xảy ra khi tạo URL rút gọn",
        variant: "destructive",
      });
    },
  });

  // Mutation cho việc tạo Pastebin
  const { mutate: mutateExternal, isPending: isPendingExternal } = useMutation({
    mutationFn: async (data: ExternalUrlShortenerFormValues) => {
      // Lấy key từ form
      const { key } = data;
      
      // Chỉ xử lý khi key được chọn
      if (!key || key === "none") {
        throw new Error("Vui lòng chọn một key để tạo Pastebin");
      }
      
      // Lấy thông tin key từ dữ liệu có sẵn
      const keyObj = keysData?.keys.find((k: any) => k.key === key);
      if (!keyObj) {
        throw new Error("Không tìm thấy thông tin key");
      }
      
      // Tạo nội dung paste
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'dd/MM/yyyy HH:mm:ss');
      const expiryDate = keyObj.expiresAt 
        ? format(new Date(keyObj.expiresAt), 'dd/MM/yyyy HH:mm:ss') 
        : 'Không hết hạn';
      
      const content = `THÔNG TIN KEY CỦA BẠN
====================

Key: ${keyObj.key}
Loại: ${keyObj.type.toUpperCase()}
Tạo vào: ${format(new Date(keyObj.createdAt), 'dd/MM/yyyy HH:mm:ss')}
Hết hạn: ${expiryDate}
Trạng thái: ${keyObj.status === 'active' ? 'HOẠT ĐỘNG' : 'VÔ HIỆU'}

${keyObj.note ? `Ghi chú: ${keyObj.note}` : ''}

====================
Paste được tạo vào: ${formattedDate}
Được tạo bởi: Thomas Key System`;

      // Tạo tiêu đề paste
      const title = `Key ${keyObj.key} - ${format(currentDate, 'dd/MM/yyyy')}`;
      
      // Gọi API tạo Pastebin
      const result = await createPastebin(content, title, key);
      
      // Lưu giá trị tiêu đề để hiển thị trong UI
      setOriginalUrl(title);
      
      return result;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setShortUrl(data.shortenedUrl);
        toast({
          title: "Pastebin đã được tạo thành công!",
          description: "Liên kết Pastebin đã sẵn sàng để chia sẻ.",
          variant: "default",
        });
      } else {
        toast({
          title: "Lỗi tạo Pastebin",
          description: data.message || "Có lỗi xảy ra khi tạo paste",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Lỗi tạo Pastebin",
        description: "Có lỗi xảy ra khi kết nối với dịch vụ Pastebin",
        variant: "destructive",
      });
    },
  });

  // Xử lý việc sao chép URL
  const handleCopyToClipboard = async () => {
    if (shortUrl) {
      try {
        await navigator.clipboard.writeText(shortUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        toast({
          title: "Không thể sao chép",
          description: "Có lỗi xảy ra khi sao chép URL vào clipboard",
          variant: "destructive",
        });
      }
    }
  };

  // Xử lý submit form nội bộ
  const onSubmitInternal = (data: InternalUrlShortenerFormValues) => {
    mutateInternal(data);
  };

  // Xử lý submit form Yeumoney
  const onSubmitExternal = (data: ExternalUrlShortenerFormValues) => {
    mutateExternal(data);
  };

  // Xử lý mở link mới
  const openShortUrl = () => {
    if (shortUrl) {
      window.open(shortUrl, "_blank");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Rút gọn URL</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className={`px-3 py-1.5 ${activeTab === "internal" ? "bg-blue-500/20 text-blue-500" : ""}`}>
              <LinkIcon className="mr-1 h-3.5 w-3.5" />
              Internal
            </Badge>
            <Badge variant="outline" className={`px-3 py-1.5 ${activeTab === "external" ? "bg-green-500/20 text-green-500" : ""}`}>
              <ExternalLinkIcon className="mr-1 h-3.5 w-3.5" />
              Yeumoney
            </Badge>
          </div>
        </div>

        <p className="text-muted-foreground">
          Rút gọn URL dài thành các URL dễ nhớ và dễ chia sẻ. Chọn giữa dịch vụ nội bộ hoặc Yeumoney để tạo liên kết rút gọn.
        </p>

        <Tabs defaultValue="internal" onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="internal">Rút gọn nội bộ</TabsTrigger>
            <TabsTrigger value="external">Pastebin API</TabsTrigger>
            <TabsTrigger value="about">Thông tin</TabsTrigger>
          </TabsList>

          {/* Tab rút gọn URL nội bộ */}
          <TabsContent value="internal" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tạo URL ngắn</CardTitle>
                  <CardDescription>
                    Tạo liên kết rút gọn sử dụng hệ thống nội bộ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...internalForm}>
                    <form onSubmit={internalForm.handleSubmit(onSubmitInternal)} className="space-y-4">
                      <FormField
                        control={internalForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL dài</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/long-url" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={internalForm.control}
                        name="keyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Liên kết với key (tùy chọn)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn key để liên kết (tùy chọn)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Không liên kết với key</SelectItem>
                                {keysData?.keys && keysData.keys.map((key: { id: number, key: string, type: string }) => (
                                  <SelectItem key={key.id} value={key.id.toString()}>
                                    {key.key} ({key.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Khi người dùng truy cập URL rút gọn, họ sẽ được chuyển hướng đến trang xác nhận key
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Chú ý</AlertTitle>
                        <AlertDescription>
                          Nếu bạn liên kết URL với một key, khi người dùng truy cập URL rút gọn, 
                          họ sẽ được chuyển hướng đến trang xác nhận key thay vì trang đích gốc.
                        </AlertDescription>
                      </Alert>

                      <Button type="submit" className="w-full mt-4" disabled={isPendingInternal}>
                        {isPendingInternal ? "Đang xử lý..." : "Rút gọn URL"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Card kết quả */}
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả</CardTitle>
                  <CardDescription>
                    URL ngắn của bạn sẽ xuất hiện ở đây
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                  {shortUrl ? (
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 text-sm font-medium text-muted-foreground">
                          URL gốc:
                        </div>
                        <div className="mb-4 rounded-lg border p-3 text-sm break-all">
                          {originalUrl}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            URL rút gọn:
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg border border-primary bg-primary/10 p-3 text-sm font-semibold text-primary break-all">
                            {shortUrl}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleCopyToClipboard}
                            title="Sao chép vào clipboard"
                          >
                            {copySuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={openShortUrl}
                            title="Mở trong tab mới"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <LinkIcon className="mb-2 h-10 w-10 opacity-20" />
                      <p>Nhập URL để nhận kết quả tại đây</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab rút gọn URL qua Yeumoney */}
          <TabsContent value="external" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tạo Pastebin cho Key</CardTitle>
                  <CardDescription>
                    Sử dụng API của Pastebin để tạo và chia sẻ thông tin key
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...externalForm}>
                    <form onSubmit={externalForm.handleSubmit(onSubmitExternal)} className="space-y-4">


                      {/* API Token không còn cần thiết khi sử dụng Pastebin API */}

                      <FormField
                        control={externalForm.control}
                        name="key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chọn key để tạo Pastebin</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn key để tạo Pastebin" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">-- Chọn một key --</SelectItem>
                                {keysData?.keys && keysData.keys.map((key: { id: number, key: string, type: string }) => (
                                  <SelectItem key={key.id} value={key.key}>
                                    {key.key} ({key.type})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Thông tin về key sẽ được đưa vào nội dung paste để chia sẻ với người dùng
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Chú ý</AlertTitle>
                        <AlertDescription>
                          Khi bạn chọn một key, hệ thống sẽ tạo một Pastebin với thông tin chi tiết về key này.
                          Bạn có thể chia sẻ liên kết Pastebin này với người dùng.
                        </AlertDescription>
                      </Alert>

                      <Button type="submit" className="w-full mt-4" disabled={isPendingExternal}>
                        {isPendingExternal ? "Đang xử lý..." : "Tạo Pastebin"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Card kết quả */}
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả</CardTitle>
                  <CardDescription>
                    Liên kết Pastebin sẽ xuất hiện ở đây
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[200px]">
                  {shortUrl ? (
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 text-sm font-medium text-muted-foreground">
                          Tiêu đề:
                        </div>
                        <div className="mb-4 rounded-lg border p-3 text-sm break-all">
                          {originalUrl}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">
                            Liên kết Pastebin:
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-lg border border-primary bg-primary/10 p-3 text-sm font-semibold text-primary break-all">
                            {shortUrl}
                          </div>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleCopyToClipboard}
                            title="Sao chép vào clipboard"
                          >
                            {copySuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={openShortUrl}
                            title="Mở trong tab mới"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Thông tin</AlertTitle>
                        <AlertDescription>
                          Liên kết Pastebin trên chứa thông tin về key và có thể được chia sẻ với người dùng.
                          Khi người dùng truy cập vào liên kết này, họ sẽ thấy nội dung paste chứa thông tin về key.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <LinkIcon className="mb-2 h-10 w-10 opacity-20" />
                      <p>Chọn key và nhấn "Tạo Pastebin" để nhận liên kết Pastebin</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab thông tin */}
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Hướng dẫn sử dụng</CardTitle>
                <CardDescription>
                  Thông tin chi tiết về dịch vụ rút gọn URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTitle className="font-semibold">Hai phương thức rút gọn URL</AlertTitle>
                  <AlertDescription>
                    Hệ thống cung cấp hai phương thức rút gọn URL:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        <span className="font-semibold">Rút gọn nội bộ:</span> Tạo URL ngắn ngay trên máy chủ của bạn. 
                        Có thể liên kết với key để tạo URL kích hoạt key.
                      </li>
                      <li>
                        <span className="font-semibold">Yeumoney API:</span> Sử dụng dịch vụ rút gọn URL của Yeumoney,
                        yêu cầu API token để sử dụng. Cũng hỗ trợ liên kết URL với key.
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h3 className="font-semibold">URL liên kết với Key</h3>
                  <p className="text-sm text-muted-foreground">
                    Khi bạn tạo URL rút gọn và liên kết với một key, người dùng khi truy cập URL này sẽ được
                    chuyển hướng đến trang xác nhận key thay vì URL gốc. Tính năng này rất hữu ích để phân phối key
                    thông qua các liên kết dễ nhớ.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Theo dõi sử dụng</h3>
                  <p className="text-sm text-muted-foreground">
                    Mọi truy cập vào URL rút gọn đều được ghi lại trong hệ thống, bao gồm thông tin về IP người dùng
                    và thời gian truy cập. Bạn có thể xem những thông tin này trong phần Logs của hệ thống.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Key className="h-4 w-4 mr-2" />
                  Tạo bởi Thomas_Admin
                </div>
                <div className="text-sm text-muted-foreground">
                  v1.0
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}