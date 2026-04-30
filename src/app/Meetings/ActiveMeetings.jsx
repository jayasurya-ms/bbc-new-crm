import ApiErrorPage from "@/components/api-error/api-error";
import DataTable from "@/components/common/data-table";
import Loader from "@/components/loader/loader";
import { Button } from "@/components/ui/button";
import { MEETING_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Edit, ClipboardCheck, Eye } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import CreateMeetingDialog from "./create-meeting";
import AttendanceModal from "./AttendanceModal";
import ViewAttendanceModal from "./ViewAttendanceModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ActiveMeetings = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [editId, setEditId] = useState(null);

  const [openAttendance, setOpenAttendance] = useState(false);
  const [attendanceMeetingId, setAttendanceMeetingId] = useState(null);

  const [openViewAttendance, setOpenViewAttendance] = useState(false);
  const [viewAttendanceMeetingId, setViewAttendanceMeetingId] = useState(null);

  const { data, isLoading, isError, refetch } = useGetApiMutation({
    url: MEETING_API.activeList,
    queryKey: ["active-meetings"],
  });

  const meetingsData = data?.data || data || [];

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
    },
    {
      header: "Date",
      accessorKey: "meeting_date",
      cell: ({ row }) =>
        row.original.meeting_date
          ? moment(row.original.meeting_date).format("DD-MM-YYYY")
          : "-",
    },
    {
      header: "Time",
      accessorKey: "meeting_time",
    },
    {
      header: "Meeting For",
      accessorKey: "meeting_for",
    },
    {
      header: "Actions",
      accessorKey: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const meetingDate = row.original.meeting_date;
        const today = moment().format("YYYY-MM-DD");
        const isPastOrToday = meetingDate <= today;

        return (
          <div className="flex items-center gap-2">
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
                <TooltipContent>Edit Meeting</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isPastOrToday && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                        onClick={() => {
                          setAttendanceMeetingId(row.original.id);
                          setOpenAttendance(true);
                        }}
                      >
                        <ClipboardCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mark Attendance</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                        onClick={() => {
                          setViewAttendanceMeetingId(row.original.id);
                          setOpenViewAttendance(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Attendance</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
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
        data={meetingsData}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Search Meetings..."
        addButton={{
          onClick: handleCreate,
          label: "Add Meeting",
        }}
        backendPagination={false} // Since API returns full array
      />

      <CreateMeetingDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        Id={editId}
      />

      <AttendanceModal
        open={openAttendance}
        onClose={() => setOpenAttendance(false)}
        meetingId={attendanceMeetingId}
      />

      <ViewAttendanceModal
        open={openViewAttendance}
        onClose={() => setOpenViewAttendance(false)}
        meetingId={viewAttendanceMeetingId}
      />
    </div>
  );
};

export default ActiveMeetings;
