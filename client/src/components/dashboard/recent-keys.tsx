import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type KeyType = "all" | "free" | "vip";

export default function RecentKeys() {
  const [keyType, setKeyType] = useState<KeyType>("all");
  const [page, setPage] = useState(1);
  const limit = 5;

  const queryUrl = `/api/keys?page=${page}&limit=${limit}${
    keyType !== "all" ? `&type=${keyType}` : ""
  }`;

  const { data, isLoading, error } = useQuery({
    queryKey: [queryUrl],
  });

  const handleTypeChange = (type: KeyType) => {
    setKeyType(type);
    setPage(1); // Reset to page 1 when changing filter
  };

  if (isLoading) {
    return (
      <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
        <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-medium">Hoạt Động Key Gần Đây</h3>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20 bg-gray-700" />
            <Skeleton className="h-8 w-20 bg-gray-700" />
            <Skeleton className="h-8 w-20 bg-gray-700" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Địa Chỉ IP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Thời Gian
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-850 divide-y divide-gray-700">
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-28 bg-gray-700" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-24 bg-gray-700" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-16 bg-gray-700 rounded-full" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Skeleton className="h-5 w-32 bg-gray-700" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            <Skeleton className="h-5 w-48 bg-gray-700" />
          </div>
          <div className="flex space-x-1">
            <Skeleton className="h-8 w-16 bg-gray-700" />
            <Skeleton className="h-8 w-8 bg-gray-700" />
            <Skeleton className="h-8 w-8 bg-gray-700" />
            <Skeleton className="h-8 w-8 bg-gray-700" />
            <Skeleton className="h-8 w-16 bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-850 rounded-lg shadow border border-red-500 p-4">
        <p className="text-red-500">
          Error loading key data. Please try again later.
        </p>
      </div>
    );
  }

  const { keys, total } = data;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-gray-850 rounded-lg shadow border border-gray-700">
      <div className="px-4 py-3 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Hoạt Động Key Gần Đây</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={keyType === "free" ? "default" : "secondary"}
            onClick={() => handleTypeChange("free")}
            className={keyType === "free" ? "bg-primary" : "bg-gray-700"}
          >
            Key Free
          </Button>
          <Button
            size="sm"
            variant={keyType === "vip" ? "default" : "secondary"}
            onClick={() => handleTypeChange("vip")}
            className={keyType === "vip" ? "bg-primary" : "bg-gray-700"}
          >
            Key VIP
          </Button>
          <Button
            size="sm"
            variant={keyType === "all" ? "default" : "secondary"}
            onClick={() => handleTypeChange("all")}
            className={keyType === "all" ? "bg-primary" : "bg-gray-700"}
          >
            Tất Cả
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Địa Chỉ IP
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Thời Gian
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-850 divide-y divide-gray-700">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Không có dữ liệu key nào.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-white">{key.key}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        key.type === "free"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {key.type === "free" ? "Free" : "VIP"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {key.ipAddress || "Unknown"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        key.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {key.status === "active" ? "Còn Hạn" : "Hết Hạn"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(key.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Hiển thị {keys.length} trong tổng số {total} mục
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-gray-700 text-white"
          >
            Trước
          </Button>
          {[...Array(Math.min(3, totalPages))].map((_, i) => {
            const pageNumber = page <= 2 ? i + 1 : page - 1 + i;
            if (pageNumber <= totalPages) {
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
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-gray-700 text-white"
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
