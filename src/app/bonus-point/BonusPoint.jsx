import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { BONUS_POINT_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import CreateBonusPointDialog from "./create-bonus-point";

const BonusPoint = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [idToDelete, setIdToDelete] = useState(null);

  const queryClient = useQueryClient();

  // Fetch Bonus Point List
  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: BONUS_POINT_API.list,
    queryKey: ["bonus-point-list"],
  });

  // Fetch Active Members for mapping IDs to names
  const { data: membersRes } = useGetApiMutation({
    url: MEMBER_API.fetchActiveMembers,
    queryKey: ["active-members"],
  });

  const { trigger: deleteBonusPoint, loading: isDeleting } = useApiMutation();

  const bonusPointData = listData?.data || [];
  const members = membersRes?.data || membersRes || [];

  const getMemberNames = (idsString) => {
    if (!idsString) return "-";
    const ids = idsString.split(",").map((id) => id.trim());
    const names = ids
      .map((id) => members.find((m) => m.id.toString() === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "Loading names...";
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (id) => {
    setEditingId(id);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBonusPoint({
        url: BONUS_POINT_API.delete(idToDelete),
        method: "delete",
      });
      toast.success("Bonus point record deleted successfully");
      queryClient.invalidateQueries(["bonus-point-list"]);
    } catch (error) {
      toast.error("Failed to delete record");
    } finally {
      setOpenDeleteDialog(false);
      setIdToDelete(null);
    }
  };

  const columns = [
    {
      header: "SL No",
      cell: ({ row }) => row.index + 1,
      width: 60,
    },
    {
      header: "Date",
      accessorKey: "bonus_point_date",
      cell: ({ row }) =>
        format(new Date(row.original.bonus_point_date), "dd-MM-yyyy"),
    },
    {
      header: "Members",
      accessorKey: "bonus_point_attendance",
      cell: ({ row }) => (
        <div title={getMemberNames(row.original.bonus_point_attendance)}>
          {getMemberNames(row.original.bonus_point_attendance)}
        </div>
      ),
    },
    {
      header: "Points",
      accessorKey: "bonus_point",
      cell: ({ row }) => (
        <span className="font-bold">{row.original.bonus_point}</span>
      ),
    },
    {
      header: "Description",
      accessorKey: "bonus_point_description",
      cell: ({ row }) => (
        <div title={row.original.bonus_point_description}>
          {row.original.bonus_point_description || "-"}
        </div>
      ),
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(row.original.id)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
              <TooltipContent>Delete</TooltipContent>
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
        data={bonusPointData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Bonus Points..."
        addButton={{
          onClick: handleOpenAdd,
          label: "Add Bonus Point",
        }}
      />

      {/* Add/Edit Dialog */}
      <CreateBonusPointDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        id={editingId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this bonus point record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700"
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

export default BonusPoint;
