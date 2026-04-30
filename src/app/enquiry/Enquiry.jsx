import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { ENQUIRY_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";

const Enquiry = () => {
  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: ENQUIRY_API.fetch,
    queryKey: ["enquiry"],
  });

  const enquiryData = data?.enquiry || data?.data || data || [];

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
          <div
            className="max-w-[300px] truncate"
            title={message}
          >
            {message}
          </div>
        );
      },
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
        data={enquiryData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Enquiries..."
        backendPagination={false} // API returns a complete list
      />
    </div>
  );
};

export default Enquiry;
