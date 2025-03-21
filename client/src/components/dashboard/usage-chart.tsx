import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UsageChartProps {
  data: {
    date: string;
    count: number;
  }[];
}

export default function UsageChart({ data }: UsageChartProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "365">("30");
  
  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), "dd/MM", { locale: vi })
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-md">
          <p className="text-gray-300 font-medium">{`Ngày: ${label}`}</p>
          <p className="text-primary-light">{`Số lượt: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Thống Kê Sử Dụng</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={timeRange === "7" ? "default" : "secondary"}
            onClick={() => setTimeRange("7")}
            className={timeRange === "7" ? "bg-primary" : "bg-gray-700"}
          >
            7 Ngày
          </Button>
          <Button
            size="sm"
            variant={timeRange === "30" ? "default" : "secondary"}
            onClick={() => setTimeRange("30")}
            className={timeRange === "30" ? "bg-primary" : "bg-gray-700"}
          >
            30 Ngày
          </Button>
          <Button
            size="sm"
            variant={timeRange === "365" ? "default" : "secondary"}
            onClick={() => setTimeRange("365")}
            className={timeRange === "365" ? "bg-primary" : "bg-gray-700"}
          >
            365 Ngày
          </Button>
        </div>
      </div>

      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0078d4" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: "#ccc" }} 
              tickLine={{ stroke: "#666" }} 
              axisLine={{ stroke: "#666" }} 
            />
            <YAxis 
              tick={{ fill: "#ccc" }} 
              tickLine={{ stroke: "#666" }}
              axisLine={{ stroke: "#666" }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0078d4"
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
