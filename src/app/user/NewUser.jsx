import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { USER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Eye, TrashIcon } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const NewUser = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const isSuperAdmin = user?.admin_type === "superadmin";

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: USER_API.new,
    queryKey: ["new-users"],
  });

  const { trigger: deleteUser, loading: isDeleting } = useApiMutation();

  const userData = data?.new_user || [];

  const handleDeleteClick = (id) => {
    setUserIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteUser({
        url: USER_API.delete(userIdToDelete),
        method: "delete",
      });

      if (res?.code === 200 || res?.status === "success" || res?.status === 200) {
        toast.success(res?.msg || "User deleted successfully");
        queryClient.invalidateQueries(["new-users"]);
      } else {
        toast.error(res?.message || "Failed to delete user");
      }
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/user-view?id=${row.original.id}`)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
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
        data={userData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search New Users..."
        backendPagination={false}
      />

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this new user? This action cannot be
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

export default NewUser;
