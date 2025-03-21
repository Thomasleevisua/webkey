import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";
import { Search, Globe, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function IpTracking() {
  const [searchIp, setSearchIp] = useState("");
  const [currentIp, setCurrentIp] = useState("");
  const { toast } = useToast();

  // Fetch IP tracking data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/logs/ip', currentIp],
    enabled: !!currentIp,
  });

  // Handle IP search
  const handleSearch = () => {
    if (!searchIp.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an IP address to search",
        variant: "destructive",
      });
      return;
    }
    
    // Simple IP validation - could be improved
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(searchIp)) {
      toast({
        title: "Invalid IP Format",
        description: "Please enter a valid IPv4 address (e.g., 192.168.1.1)",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentIp(searchIp);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
  };

  // Prepare data for activity by day chart
  const prepareActivityData = (logs: any[]) => {
    if (!logs || logs.length === 0) return [];
    
    const activityByDay: {[key: string]: {successful: number, failed: number}} = {};
    
    logs.forEach(log => {
      const day = format(new Date(log.timestamp), "dd/MM");
      
      if (!activityByDay[day]) {
        activityByDay[day] = { successful: 0, failed: 0 };
      }
      
      if (log.successful) {
        activityByDay[day].successful += 1;
      } else {
        activityByDay[day].failed += 1;
      }
    });
    
    return Object.entries(activityByDay).map(([date, counts]) => ({
      date,
      successful: counts.successful,
      failed: counts.failed
    }));
  };

  // Prepare data for key type distribution
  const prepareKeyTypeData = (logs: any[]) => {
    if (!logs || logs.length === 0) return [];
    
    const keyTypes: {[key: string]: number} = { 
      free: 0, 
      vip: 0, 
      unknown: 0 
    };
    
    logs.forEach(log => {
      if (log.key && log.key.type) {
        keyTypes[log.key.type] += 1;
      } else {
        keyTypes['unknown'] += 1;
      }
    });
    
    return [
      { name: "Free", value: keyTypes.free, color: "#0078d4" },
      { name: "VIP", value: keyTypes.vip, color: "#ffb900" },
      { name: "Unknown", value: keyTypes.unknown, color: "#888888" }
    ];
  };

  // Calculate success rate
  const calculateSuccessRate = (logs: any[]) => {
    if (!logs || logs.length === 0) return { rate: 0, successful: 0, total: 0 };
    
    const successful = logs.filter(log => log.successful).length;
    return {
      rate: Math.round((successful / logs.length) * 100),
      successful,
      total: logs.length
    };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">IP Address Tracking</h2>
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-9 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter IP address to track (e.g., 127.0.0.1)"
                value={searchIp}
                onChange={(e) => setSearchIp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              className="bg-primary"
              onClick={handleSearch}
            >
              Track IP
            </Button>
          </div>
        </div>
      </div>

      {currentIp && (
        <>
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-850 border-gray-700">
                  <CardHeader>
                    <Skeleton className="h-5 w-40 bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-24 bg-gray-700 mb-2" />
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-4 text-center">
              <h3 className="text-xl font-semibold text-red-500 mb-2">Error Tracking IP</h3>
              <p className="text-gray-400">Failed to retrieve data for IP {currentIp}. Please try again later.</p>
              <Button 
                className="mt-4 bg-primary" 
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {data && (
            <>
              <div className="mb-4">
                <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary" />
                    IP Details: {currentIp}
                  </h3>
                  <div className="text-gray-400 mb-4">
                    Showing all activity logs for this IP address
                  </div>
                </div>
              </div>

              {data.length === 0 ? (
                <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-6 text-center">
                  <div className="text-xl text-gray-400 mb-2">No Data Found</div>
                  <p className="text-gray-500">
                    There are no recorded activities for IP address {currentIp}
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-gray-850 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center">
                          <Activity className="mr-2 h-4 w-4" />
                          Total Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{data.length}</div>
                        <p className="text-xs text-gray-400 mt-1">
                          Total access attempts from this IP
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-850 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-500">
                          {calculateSuccessRate(data).rate}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {calculateSuccessRate(data).successful} successful of {calculateSuccessRate(data).total} attempts
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-850 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400 flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Last Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatDate(data[0].timestamp)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Most recent access attempt
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Activity by Day Chart */}
                    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <h3 className="font-medium">Activity Timeline</h3>
                      </div>
                      <div className="p-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareActivityData(data)}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey="date" stroke="#888" tick={{ fill: '#ccc' }} />
                            <YAxis stroke="#888" tick={{ fill: '#ccc' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="successful" name="Successful" fill="#10B981" />
                            <Bar dataKey="failed" name="Failed" fill="#EF4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Key Type Distribution */}
                    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <h3 className="font-medium">Key Types Used</h3>
                      </div>
                      <div className="p-4 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareKeyTypeData(data)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => 
                                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareKeyTypeData(data).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                              labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Activity Log Table */}
                  <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <h3 className="font-medium">Detailed Activity Log</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Key Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Agent</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-850 divide-y divide-gray-700">
                          {data.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-800">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                {formatDate(log.timestamp)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                {log.key ? log.key.key : "N/A"}
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
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    <span>Success</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-500">
                                    <XCircle className="mr-1 h-4 w-4" />
                                    <span>Failed</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 truncate max-w-xs text-sm text-gray-400">
                                <div title={log.userAgent}>
                                  {log.userAgent || "Unknown"}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {!currentIp && (
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-8 text-center">
          <Globe className="h-16 w-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">IP Tracking Tool</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Enter an IP address in the search box above to view all activity and statistics 
            related to that IP address.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                setSearchIp("127.0.0.1");
                setCurrentIp("127.0.0.1");
              }}
            >
              Track localhost (127.0.0.1)
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => {
                setSearchIp("192.168.1.1");
                setCurrentIp("192.168.1.1");
              }}
            >
              Track 192.168.1.1
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
