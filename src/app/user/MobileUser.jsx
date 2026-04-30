import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { USER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Trash2 } from "lucide-react";
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

const MobileUser = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: USER_API.mobile,
    queryKey: ["mobile-users"],
  });

  const { trigger: deleteUser, loading: isDeleting } = useApiMutation();

  const mobileUserData = data?.new_user || [];

  const handleDeleteClick = (id) => {
    setUserIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser({
        url: USER_API.deleteMobile(userIdToDelete),
        method: "delete",
      });
      toast.success("Mobile user deleted successfully");
      queryClient.invalidateQueries(["mobile-users"]);
    } catch (error) {
      toast.error("Failed to delete mobile user");
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
                  onClick={() => handleDeleteClick(row.original.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete User</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        data={mobileUserData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Mobile Users..."
        backendPagination={false}
      />

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mobile user? This action
              cannot be undone.
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

export default MobileUser;
