import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/stats-card";
import RecentKeys from "@/components/dashboard/recent-keys";
import QuickActions from "@/components/dashboard/quick-actions";
import UsageChart from "@/components/dashboard/usage-chart";
import UserDistribution from "@/components/dashboard/user-distribution";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/stats/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
              <Skeleton className="h-6 w-1/2 bg-gray-700 mb-2" />
              <Skeleton className="h-8 w-1/3 bg-gray-700 mb-3" />
              <Skeleton className="h-4 w-2/3 bg-gray-700" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
            <Skeleton className="h-80 w-full bg-gray-700" />
          </div>
          <div className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
            <Skeleton className="h-80 w-full bg-gray-700" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-850 rounded-lg shadow border border-gray-700 p-4">
              <Skeleton className="h-64 w-full bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-6 text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400">Failed to load dashboard statistics. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Tổng Số Key"
          value={data.totalKeys}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          }
          change={12}
          iconBgColor="bg-blue-500 bg-opacity-20"
        />
        
        <StatsCard
          title="Key Đang Hoạt Động"
          value={data.activeKeys}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          change={8}
          iconBgColor="bg-green-500 bg-opacity-20"
        />
        
        <StatsCard
          title="Người Dùng VIP"
          value={data.vipUsers}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          }
          change={24}
          iconBgColor="bg-yellow-500 bg-opacity-20"
        />
        
        <StatsCard
          title="Yêu Cầu API / Ngày"
          value={data.apiRequests}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          change={-5}
          iconBgColor="bg-purple-500 bg-opacity-20"
        />
      </div>
      
      {/* Key Management and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentKeys />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart data={data.usageStats} />
        <UserDistribution data={data.keyDistribution} total={data.totalKeys} />
      </div>
    </div>
  );
}
