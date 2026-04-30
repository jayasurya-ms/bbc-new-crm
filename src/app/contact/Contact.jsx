import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { CONTACT_API } from "@/constants/apiConstants";
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
import { useSelector } from "react-redux";

const Contact = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contactIdToDelete, setContactIdToDelete] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: CONTACT_API.fetch,
    queryKey: ["contact"],
  });

  const { trigger: deleteContact, loading: isDeleting } = useApiMutation();

  const contactData = data?.contact || data?.data || data || [];

  const handleDeleteClick = (id) => {
    setContactIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteContact({
        url: CONTACT_API.delete(contactIdToDelete),
        method: "delete",
      });

      if (res?.code === 200 || res?.status === "success" || res?.status === 200) {
        toast.success(res?.msg || res?.message || "Contact deleted successfully");
        queryClient.invalidateQueries(["contact"]);
      } else {
        toast.error(res?.message || res?.msg || "Failed to delete contact");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete contact"
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
      accessorKey: "contact_name",
    },
    {
      header: "Email",
      accessorKey: "contact_email",
    },
    {
      header: "Mobile",
      accessorKey: "contact_mobile",
    },
    {
      header: "Message",
      accessorKey: "contact_message",
      cell: ({ row }) => {
        const message = row.original.contact_message || "-";
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
        data={contactData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Contacts..."
        backendPagination={false}
      />

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be
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

export default Contact;
