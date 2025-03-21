import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { Search, Calendar, Filter, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AccessLogs() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "successful" | "failed">("all");
  const limit = 15;
  const { toast } = useToast();

  // Fetch access logs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [`/api/logs/recent?page=${page}&limit=${limit}`],
  });

  // Filter logs by search term and success status
  const filterLogs = (logs: any[]) => {
    if (!logs) return [];
    
    let filtered = logs;
    
    // Filter by search term (IP or key)
    if (searchTerm) {
      filtered = filtered.filter(log => 
        (log.ipAddress && log.ipAddress.includes(searchTerm)) ||
        (log.key && log.key.key && log.key.key.includes(searchTerm))
      );
    }
    
    // Filter by success status
    if (filterType !== "all") {
      filtered = filtered.filter(log => 
        (filterType === "successful" && log.successful) || 
        (filterType === "failed" && !log.successful)
      );
    }
    
    return filtered;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Access Logs</h2>
          <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Skeleton className="h-10 w-full md:w-1/3 bg-gray-700" />
              <Skeleton className="h-10 w-full md:w-1/4 bg-gray-700" />
              <Skeleton className="h-10 w-full md:w-1/4 bg-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">System Access Logs</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Agent</th>
                </tr>
              </thead>
              <tbody className="bg-gray-850 divide-y divide-gray-700">
                {[...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-32 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-24 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-40 bg-gray-700" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Skeleton className="h-5 w-40 bg-gray-700" />
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
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Access Logs</h3>
          <p className="text-gray-400">Failed to load access logs. Please try again later.</p>
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

  const filteredLogs = filterLogs(data);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Access Logs</h2>
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9 bg-gray-700 border-gray-600 text-white"
                placeholder="Search by IP or key..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "successful" | "failed") => setFilterType(value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white md:w-1/4">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status: {filterType === "all" ? "All" : filterType}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="successful">Successful</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700 md:w-1/4"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="font-medium">System Access Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Agent</th>
              </tr>
            </thead>
            <tbody className="bg-gray-850 divide-y divide-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{formatDate(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{log.ipAddress}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {log.key ? log.key.key : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.key ? (
                        <Badge
                          className={
                            log.key.type === "free"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {log.key.type || "Unknown"}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">N/A</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.successful ? (
                        <div className="flex items-center text-green-500">
                          <Check className="mr-1 h-4 w-4" />
                          <span>Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <X className="mr-1 h-4 w-4" />
                          <span>Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 truncate max-w-xs">
                      <div className="text-sm text-gray-400" title={log.userAgent}>
                        {log.userAgent || "Unknown"}
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
            Showing {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPage(page + 1)}
              disabled={filteredLogs.length < limit}
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
