import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import CreateVipKeyModal from "@/components/modals/create-vip-key-modal";

export default function VipKeys() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch VIP keys
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/keys?type=vip&page=${page}&limit=${limit}`],
  });

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      return apiRequest("DELETE", `/api/keys/${keyId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "VIP key deleted successfully",
      });
      // Refresh the keys list
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete VIP key",
        variant: "destructive",
      });
    },
  });

  // Filter keys by search term
  const filterKeys = (keys: any[]) => {
    if (!searchTerm) return keys;
    return keys.filter(key => 
      key.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Key copied to clipboard",
    });
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  // Handle key deletion
  const handleDeleteKey = (keyId: number) => {
    if (confirm("Are you sure you want to delete this VIP key?")) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">VIP Keys Management</h2>
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 mb-6">
          <div className="p-4 flex justify-between">
            <Skeleton className="h-10 w-1/3 bg-gray-700" />
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">VIP Keys</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
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
                      <Skeleton className="h-5 w-24 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8 bg-gray-700 rounded" />
                        <Skeleton className="h-8 w-8 bg-gray-700 rounded" />
                      </div>
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
          <p className="text-gray-400">Failed to load VIP keys. Please try again later.</p>
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

  const filteredKeys = filterKeys(data.keys);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">VIP Keys Management</h2>
        <Button 
          className="bg-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Create New VIP Key
        </Button>
      </div>

      {/* Search and filter options */}
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700 mb-6">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <Input
            className="bg-gray-700 border-gray-600 text-white md:w-1/3"
            placeholder="Search VIP keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => setSearchTerm("")}
            >
              Clear Filter
            </Button>
          </div>
        </div>
      </div>

      {/* VIP Keys Table */}
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-medium">VIP Keys</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-850 divide-y divide-gray-700">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                    {searchTerm ? "No matching VIP keys found." : "No VIP keys found."}
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key: any) => (
                  <tr key={key.id} className="hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{key.key}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(key.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {key.expiresAt ? formatDate(key.expiresAt) : "Never"}
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
                      <div className="text-sm text-gray-300">{key.note || "-"}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
            Showing {filteredKeys.length} of {data.total} entries
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

      {/* Create VIP Key Modal */}
      <CreateVipKeyModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}
