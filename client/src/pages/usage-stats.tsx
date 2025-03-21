import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AreaChart,
  Area,
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

export default function UsageStats() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");
  const { toast } = useToast();

  // Fetch usage statistics
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/stats/usage", timeRange],
  });

  // Generate date range for chart labels
  const generateDateRange = (days: number) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      result.push({
        date: format(date, "yyyy-MM-dd"),
        formattedDate: format(date, "dd/MM", { locale: vi }),
        count: 0,
      });
    }
    return result;
  };

  // Prepare chart data
  const prepareChartData = (rawData: any, days: number) => {
    const dateRange = generateDateRange(days);
    
    if (!rawData || !rawData.daily) return dateRange;
    
    // Map raw data to date range
    return dateRange.map(day => {
      const matchingDay = rawData.daily.find((d: any) => d.date === day.date);
      return {
        ...day,
        count: matchingDay ? matchingDay.count : 0
      };
    });
  };

  // Set color based on key type
  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case "free":
        return "#0078d4";
      case "vip":
        return "#ffb900";
      default:
        return "#888888";
    }
  };

  // Prepare key distribution data
  const prepareKeyDistribution = (rawData: any) => {
    if (!rawData || !rawData.keyDistribution) {
      return [
        { name: "Free", value: 0, color: "#0078d4" },
        { name: "VIP", value: 0, color: "#ffb900" }
      ];
    }
    
    return [
      { name: "Free", value: rawData.keyDistribution.free, color: "#0078d4" },
      { name: "VIP", value: rawData.keyDistribution.vip, color: "#ffb900" }
    ];
  };

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-md">
          <p className="text-gray-300">{`Date: ${label}`}</p>
          <p className="text-primary-light">{`Requests: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Usage Statistics</h2>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20 bg-gray-700" />
            <Skeleton className="h-10 w-20 bg-gray-700" />
            <Skeleton className="h-10 w-20 bg-gray-700" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <Skeleton className="h-6 w-40 bg-gray-700" />
            </div>
            <div className="p-4 h-80">
              <Skeleton className="h-full w-full bg-gray-700" />
            </div>
          </div>

          <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
              <Skeleton className="h-6 w-40 bg-gray-700" />
            </div>
            <div className="p-4 h-80">
              <Skeleton className="h-full w-full bg-gray-700" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-850 rounded-lg shadow border border-gray-700">
              <div className="px-4 py-3 border-b border-gray-700">
                <Skeleton className="h-6 w-40 bg-gray-700" />
              </div>
              <div className="p-4 h-60">
                <Skeleton className="h-full w-full bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-4 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Statistics</h3>
          <p className="text-gray-400">Failed to load usage statistics. Please try again later.</p>
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

  // Prepare chart data based on time range
  const days = timeRange === "7" ? 7 : timeRange === "30" ? 30 : 90;
  const chartData = prepareChartData(data, days);
  const keyDistribution = prepareKeyDistribution(data);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Usage Statistics</h2>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === "7" ? "default" : "secondary"}
            onClick={() => setTimeRange("7")}
            className={timeRange === "7" ? "bg-primary" : "bg-gray-700"}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === "30" ? "default" : "secondary"}
            onClick={() => setTimeRange("30")}
            className={timeRange === "30" ? "bg-primary" : "bg-gray-700"}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === "90" ? "default" : "secondary"}
            onClick={() => setTimeRange("90")}
            className={timeRange === "90" ? "bg-primary" : "bg-gray-700"}
          >
            90 Days
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* API Requests Chart */}
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">API Requests Over Time</h3>
          </div>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="formattedDate" 
                  stroke="#888" 
                  tick={{ fill: '#ccc' }} 
                />
                <YAxis stroke="#888" tick={{ fill: '#ccc' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0078d4" 
                  fill="#0078d4" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Distribution Pie Chart */}
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">Key Type Distribution</h3>
          </div>
          <div className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={keyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {keyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total API Requests */}
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">Total API Requests</h3>
          </div>
          <div className="p-4 text-center">
            <div className="text-5xl font-bold text-primary mb-2">
              {data?.totalRequests?.toLocaleString() || "0"}
            </div>
            <p className="text-gray-400">Over the selected period</p>
          </div>
        </div>

        {/* Active Keys */}
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">Active Keys</h3>
          </div>
          <div className="p-4 text-center">
            <div className="text-5xl font-bold text-green-500 mb-2">
              {data?.activeKeys?.toLocaleString() || "0"}
            </div>
            <p className="text-gray-400">Currently active keys</p>
          </div>
        </div>

        {/* Average Daily Requests */}
        <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-medium">Average Daily Requests</h3>
          </div>
          <div className="p-4 text-center">
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              {data?.avgDailyRequests?.toLocaleString() || "0"}
            </div>
            <p className="text-gray-400">Requests per day</p>
          </div>
        </div>
      </div>
    </div>
  );
}
