import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { LEADS_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import CreateLeadDialog from "./create-lead";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Leads() {
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState(null);

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: LEADS_API.list,
    queryKey: ["leads"],
  });

  const leadsData = data?.data || data || [];

  const handleCreate = () => {
    setEditId(null);
    setOpenCreate(true);
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
      header: "Date",
      accessorKey: "lead_date",
      cell: ({ row }) =>
        row.original.lead_date
          ? moment(row.original.lead_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "Lead From",
      accessorKey: "lead_from",
      cell: ({ row }) => row.original.lead_from?.name || "N/A",
    },
    {
      header: "Lead To",
      accessorKey: "lead_to",
      cell: ({ row }) => row.original.lead_to?.name || "N/A",
    },
    {
      header: "Amount",
      accessorKey: "lead_amount",
      cell: ({ row }) => row.original.lead_amount || "N/A",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => {
                  setEditId(row.original.id);
                  setOpenCreate(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Lead</TooltipContent>
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
        data={leadsData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Leads..."
        addButton={{
          onClick: handleCreate,
          label: "Add Lead",
        }}
        backendPagination={false} // Assuming full array comes back from API
      />

      <CreateLeadDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        leadId={editId}
      />
    </div>
  );
}

export default Leads;
