import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { Copy, Key, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ApiKeys() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState("");
  const [newKeyPermission, setNewKeyPermission] = useState("read-only");
  const limit = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch API keys
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/apikeys?page=${page}&limit=${limit}`],
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/apikeys", {
        description: newKeyDescription,
        permissions: newKeyPermission,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: "API key created successfully",
      });
      // Reset form
      setNewKeyDescription("");
      setNewKeyPermission("read-only");
      setShowCreateDialog(false);
      // Refresh the API keys list
      queryClient.invalidateQueries({ queryKey: ["/api/apikeys"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  // Revoke API key mutation
  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      return apiRequest("PUT", `/api/apikeys/${keyId}/revoke`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API key revoked successfully",
      });
      // Refresh the API keys list
      queryClient.invalidateQueries({ queryKey: ["/api/apikeys"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  // Filter API keys by search term
  const filterApiKeys = (apiKeys: any[]) => {
    if (!searchTerm) return apiKeys;
    return apiKeys.filter(key => 
      key.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.key.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  // Handle key revocation
  const handleRevokeKey = (keyId: number) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      revokeApiKeyMutation.mutate(keyId);
    }
  };

  const handleCreateApiKey = () => {
    if (!newKeyDescription) {
      toast({
        title: "Validation Error",
        description: "Please provide a description for the API key",
        variant: "destructive",
      });
      return;
    }
    createApiKeyMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">API Keys Management</h2>
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 mb-6">
          <div className="p-4">
            <Skeleton className="h-10 w-full bg-gray-700 mb-4" />
            <Skeleton className="h-20 w-full bg-gray-700" />
          </div>
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">API Keys</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Permissions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
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
                      <Skeleton className="h-5 w-24 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-28 bg-gray-700" />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
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
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading API Keys</h3>
          <p className="text-gray-400">Failed to load API keys. Please try again later.</p>
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

  const filteredApiKeys = filterApiKeys(data.apiKeys);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">API Keys Management</h2>
        <Button 
          className="bg-primary"
          onClick={() => setShowCreateDialog(true)}
        >
          Create New API Key
        </Button>
      </div>

      {/* API Keys information card */}
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700 mb-6">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">About API Keys</h3>
          <p className="text-gray-400 mb-4">
            API keys allow external applications to access THOMAS key management system. 
            Be careful when creating and sharing these keys as they grant access to your system.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center text-sm">
              <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-300">Read-only: Can only check keys</span>
            </div>
            <div className="flex items-center text-sm">
              <ShieldAlert className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-gray-300">Full-access: Can create and manage keys</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search field */}
      <div className="mb-6">
        <Input
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Search API keys by description or value..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* API Keys Table */}
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-medium">API Keys</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Permissions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-850 divide-y divide-gray-700">
              {filteredApiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                    {searchTerm ? "No matching API keys found." : "No API keys found."}
                  </td>
                </tr>
              ) : (
                filteredApiKeys.map((apiKey: any) => (
                  <tr key={apiKey.id} className="hover:bg-gray-800">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="text-sm font-mono text-gray-300">
                          {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 8)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{apiKey.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          apiKey.permissions === "read-only"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {apiKey.permissions}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{formatDate(apiKey.createdAt)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          apiKey.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {apiKey.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.key)}
                          disabled={apiKey.status !== "active"}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {apiKey.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-400"
                            onClick={() => handleRevokeKey(apiKey.id)}
                          >
                            Revoke
                          </Button>
                        )}
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
            Showing {filteredApiKeys.length} of {data.total} entries
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

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-850 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create New API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="e.g. Python Tool Integration"
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
              />
              <p className="text-sm text-gray-400">
                Give this API key a descriptive name so you remember what it's for
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission">Permissions</Label>
              <Select
                value={newKeyPermission}
                onValueChange={setNewKeyPermission}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="read-only">Read Only</SelectItem>
                  <SelectItem value="full-access">Full Access</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-400">
                Full access keys can create and manage keys, while read-only keys can only verify them
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" className="bg-gray-700">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleCreateApiKey}
              disabled={createApiKeyMutation.isPending || !newKeyDescription}
              className="bg-primary"
            >
              {createApiKeyMutation.isPending ? "Creating..." : "Create API Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
