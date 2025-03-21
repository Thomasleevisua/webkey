import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface UserDistributionProps {
  data: {
    free: number;
    vip: number;
  };
  total: number;
}

export default function UserDistribution({ data, total }: UserDistributionProps) {
  const chartData = [
    {
      name: "Free",
      value: data.free,
      color: "#0078d4",
      percentage: Math.round((data.free / (total || 1)) * 100),
    },
    {
      name: "VIP",
      value: data.vip,
      color: "#ffb900",
      percentage: Math.round((data.vip / (total || 1)) * 100),
    },
  ];

  const renderLegend = () => {
    return (
      <div className="flex space-x-4 mt-4 justify-center">
        {chartData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 mr-2"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-xs text-gray-400">
              {entry.name} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded shadow-md">
          <p className="text-gray-300 font-medium">{`${payload[0].name}`}</p>
          <p className="text-primary-light">{`Số lượng: ${payload[0].value}`}</p>
          <p className="text-primary-light">{`${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Phân Bố Người Dùng</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-primary rounded hover:bg-primary-dark text-white">
            Loại Key
          </button>
          <button className="px-3 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600 text-white">
            Khu Vực
          </button>
        </div>
      </div>

      <div className="p-4 h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percentage }) => `${name} ${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-bold text-xl"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
        {renderLegend()}
      </div>
    </div>
  );
}
