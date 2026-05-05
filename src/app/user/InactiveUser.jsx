import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { USER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { RefreshCw, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const InactiveUser = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.admin_type === "superadmin";

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: USER_API.inactive,
    queryKey: ["inactive-users"],
  });

  const { trigger: updateStatus } = useApiMutation();
  const { trigger: deleteUser, loading: isDeleting } = useApiMutation();

  const inactiveUserData = data?.inactive || [];

  const handleReactivate = async (id) => {
    try {
      await updateStatus({
        url: USER_API.reactivate(id),
        method: "put",
      });
      toast.success("User reactivated successfully");
      queryClient.invalidateQueries(["inactive-users"]);
    } catch (error) {
      toast.error("Failed to reactivate user");
    }
  };

  const handleDeleteClick = (id) => {
    setUserIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser({
        url: USER_API.delete(userIdToDelete),
        method: "delete",
      });
      toast.success("Inactive user deleted successfully");
      queryClient.invalidateQueries(["inactive-users"]);
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setOpenDeleteDialog(false);
      setUserIdToDelete(null);
    }
  };

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
      header: "Company",
      accessorKey: "company",
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
    },
    {
      header: "Area",
      accessorKey: "area",
    },
    {
      header: "Referral Code",
      accessorKey: "referral_code",
    },
    {
      header: "Action",
      accessorKey: "id",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReactivate(row.original.id)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reactivate User</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isSuperAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(row.original.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete User</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
        data={inactiveUserData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Inactive Users..."
        backendPagination={false}
      />

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this inactive user? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InactiveUser;
