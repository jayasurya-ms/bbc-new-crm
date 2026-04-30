import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { SHARE_USER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ShareUserById = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = new URLSearchParams(location.search).get("id");

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: SHARE_USER_API.byId(userId),
    queryKey: ["share-user", userId],
    options: { enabled: !!userId },
  });

  const userData = data?.new_user || data?.data || data || [];

  const columns = [
    {
      header: "SL No",
      accessorKey: "slNo",
      enableSorting: false,
      cell: ({ row }) => row.index + 1,
      width: 60,
    },
    {
      header: "Name",
      accessorKey: "name",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (isError) return <ApiErrorPage onRetry={refetch} />;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/share-user")}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-800">User Share Details</h1>
      </div>

      <DataTable
        data={userData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Details..."
        backendPagination={false}
      />
    </div>
  );
};

export default ShareUserById;
