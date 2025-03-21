import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  change: number;
  iconBgColor: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  iconBgColor,
}: StatsCardProps) {
  const isPositiveChange = change >= 0;

  return (
    <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value.toLocaleString()}</h3>
        </div>
        <div className={`${iconBgColor} p-3 rounded-full`}>{icon}</div>
      </div>
      <div className="flex items-center mt-4">
        <span
          className={`${
            isPositiveChange ? "text-green-500" : "text-red-500"
          } flex items-center text-sm`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isPositiveChange
                  ? "M5 10l7-7m0 0l7 7m-7-7v18"
                  : "M19 14l-7 7m0 0l-7-7m7 7V3"
              }
            />
          </svg>
          {Math.abs(change)}%
        </span>
        <span className="text-gray-400 text-xs ml-2">so với tuần trước</span>
      </div>
    </div>
  );
}
