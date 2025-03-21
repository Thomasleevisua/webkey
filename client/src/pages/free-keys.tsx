import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

export default function FreeKeys() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { toast } = useToast();

  // Fetch free keys
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/keys?type=free&page=${page}&limit=${limit}`],
  });

  // Fetch today's free key
  const { data: todayKeyData, isLoading: todayKeyLoading } = useQuery({
    queryKey: ["/api/keys/free/today"],
  });

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Key copied to clipboard",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  // Generate new free key
  const generateNewFreeKey = async () => {
    try {
      await apiRequest("POST", "/api/keys/free/reset", {});
      toast({
        title: "Success",
        description: "New free key generated successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate new free key",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
            <h2 className="text-xl font-semibold mb-4">Today's Free Key</h2>
            <Skeleton className="h-10 w-full bg-gray-700 mb-3" />
            <Skeleton className="h-6 w-1/2 bg-gray-700" />
          </div>
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-medium">Free Keys History</h3>
            <Skeleton className="h-8 w-32 bg-gray-700" />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-850 divide-y divide-gray-700">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-40 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-28 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-28 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-8 w-8 bg-gray-700 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-4 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Keys</h3>
          <p className="text-gray-400">Failed to load free keys. Please try again later.</p>
          <Button 
            className="mt-4 bg-primary" 
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Today's Free Key Card */}
      <div className="mb-6">
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
          <h2 className="text-xl font-semibold mb-4">Today's Free Key</h2>
          <div className="flex mb-3">
            <Input
              className="bg-gray-700 border-gray-600 text-white"
              value={todayKeyLoading ? "Loading..." : todayKeyData?.key || "Not available"}
              readOnly
            />
            <Button 
              className="ml-2 bg-primary" 
              onClick={() => copyToClipboard(todayKeyData?.key)}
              disabled={todayKeyLoading || !todayKeyData?.key}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
          </div>
          <p className="text-sm text-gray-400">
            This key is automatically updated at midnight every day. It uses the date to create a unique key.
          </p>
          <Button 
            className="mt-4 bg-green-600 hover:bg-green-700"
            onClick={generateNewFreeKey}
          >
            Generate New Free Key
          </Button>
        </div>
      </div>

      {/* Free Keys Table */}
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium">Free Keys History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-850 divide-y divide-gray-700">
              {data.keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                    No free keys found.
                  </td>
                </tr>
              ) : (
                data.keys.map((key: any) => (
                  <tr key={key.id} className="hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{key.key}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(key.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {key.expiresAt ? formatDate(key.expiresAt) : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          key.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {key.status === "active" ? "Active" : "Expired"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {data.keys.length} of {data.total} entries
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="bg-gray-700 text-white"
            >
              Previous
            </Button>
            {[...Array(Math.min(3, Math.ceil(data.total / limit)))].map((_, i) => {
              const pageNumber = page <= 2 ? i + 1 : page - 1 + i;
              if (pageNumber <= Math.ceil(data.total / limit)) {
                return (
                  <Button
                    key={i}
                    size="sm"
                    variant={pageNumber === page ? "default" : "secondary"}
                    onClick={() => setPage(pageNumber)}
                    className={pageNumber === page ? "bg-primary" : "bg-gray-700"}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage(Math.min(Math.ceil(data.total / limit), page + 1))}
              disabled={page === Math.ceil(data.total / limit)}
              className="bg-gray-700 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
