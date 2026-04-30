import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { FEEDBACK_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { TrashIcon } from "lucide-react";
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

const Feedback = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: FEEDBACK_API.fetch,
    queryKey: ["feedback"],
  });

  const { trigger: deleteFeedback, loading: isDeleting } = useApiMutation();

  const feedbackData = data?.feedback || data?.data || data || [];

  const handleDeleteClick = (id) => {
    setContactIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteFeedback({
        url: FEEDBACK_API.delete(contactIdToDelete),
        method: "delete",
      });

      if (res?.code === 200 || res?.status === "success" || res?.status === 200) {
        toast.success(res?.msg || res?.message || "Feedback deleted successfully");
        queryClient.invalidateQueries(["feedback"]);
      } else {
        toast.error(res?.message || res?.msg || "Failed to delete feedback");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete feedback"
      );
    } finally {
      setOpenDeleteDialog(false);
      setContactIdToDelete(null);
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
      accessorKey: "feedback_name",
    },
    {
      header: "Type",
      accessorKey: "feedback_type",
    },
    {
      header: "Mobile",
      accessorKey: "feedback_mobile",
    },
    {
      header: "Subject",
      accessorKey: "feedback_subject",
    },
    {
      header: "Message",
      accessorKey: "feedback_description",
      cell: ({ row }) => {
        const message = row.original.feedback_description || "-";
        return (
          <div className="max-w-[250px] truncate" title={message}>
            {message}
          </div>
        );
      },
    },
    {
      header: "Action",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteClick(row.original.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
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
        data={feedbackData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Feedback..."
        backendPagination={false}
      />

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent modal from closing immediately
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

export default Feedback;
