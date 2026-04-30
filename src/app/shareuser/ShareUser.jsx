import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { SHARE_USER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { ArrowRightCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ShareUser = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: SHARE_USER_API.list,
    queryKey: ["share-users"],
  });

  const shareData = data?.new_user || data?.data || data || [];

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
    {
      header: "Views",
      accessorKey: "no_of_counts",
    },
    {
      header: "Action",
      accessorKey: "share_from_id",
      enableSorting: false,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => navigate(`/share-view?id=${row.original.share_from_id}`)}
                className="cursor-pointer text-blue-500 hover:text-blue-700 p-2 inline-block rounded hover:bg-blue-50 transition-colors"
              >
                <ArrowRightCircle className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Go to user details</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
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
    <div className="p-5">
      <DataTable
        data={shareData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Users..."
        backendPagination={false}
      />
    </div>
  );
};

export default ShareUser;
