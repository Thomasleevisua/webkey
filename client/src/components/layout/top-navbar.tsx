import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const [location] = useLocation();
  
  // Get page title based on current location
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Bảng Điều Khiển";
      case "/free-keys":
        return "Quản Lý Key Free";
      case "/vip-keys":
        return "Quản Lý Key VIP";
      case "/api-keys":
        return "Quản Lý API Keys";
      case "/usage-stats":
        return "Thống Kê Sử Dụng";
      case "/access-logs":
        return "Nhật Ký Truy Cập";
      case "/ip-tracking":
        return "Theo Dõi IP";
      case "/settings":
        return "Tùy Chỉnh Hệ Thống";
      default:
        return "THOMAS Admin";
    }
  };

  const currentDate = format(new Date(), "dd/MM/yyyy", { locale: vi });

  return (
    <div className="bg-gray-850 shadow-md border-b border-gray-700">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="text-gray-400 hover:text-white focus:outline-none lg:hidden"
            onClick={onMenuClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h2 className="ml-4 text-xl font-semibold lg:ml-0">{getPageTitle()}</h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              className="bg-gray-700 rounded-md px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56"
              placeholder="Tìm kiếm key..."
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <button className="text-gray-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <span className="h-6 border-l border-gray-700"></span>

          <div className="flex items-center">
            <span className="text-xs text-gray-400">Hôm nay:</span>
            <span className="ml-2 text-sm font-medium">{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
