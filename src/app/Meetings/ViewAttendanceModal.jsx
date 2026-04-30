import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MEETING_API, MEMBER_API } from "@/constants/apiConstants";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import moment from "moment";
import { useState, useMemo } from "react";

const MemberList = ({
  title,
  members,
  icon: Icon,
  colorClass,
  bgClass,
  borderClass,
}) => (
  <div className="flex-1 min-w-[280px] flex flex-col">
    <div
      className={`p-3 rounded-t-lg ${bgClass} border ${borderClass} border-b-0 flex items-center justify-between`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <h3 className={`font-bold text-sm ${colorClass}`}>{title}</h3>
      </div>
      <span
        className={`px-2 py-0.5 rounded-full font-bold text-xs ${bgClass} ${colorClass} border ${borderClass}`}
      >
        {members.length}
      </span>
    </div>
    <div
      className={`border ${borderClass} rounded-b-lg flex-grow flex flex-col overflow-hidden bg-white`}
    >
      <div className="overflow-y-auto max-h-[300px] p-2 space-y-1">
        {members.length === 0 ? (
          <div className="py-8 text-center text-gray-400 italic text-sm">
            No members found
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="p-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 flex items-center gap-3 rounded"
            >
              <div
                className={`w-2 h-2 rounded-full ${bgClass} border ${borderClass}`}
              />
              <div className="flex flex-col flex-grow leading-none">
                <span className="text-sm font-medium text-gray-800 mb-1">
                  {member.name}
                </span>
                <span className="text-[10px] text-gray-400">
                  {member.mobile}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ViewAttendanceModal = ({ open, onClose, meetingId }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allMembersRes, isLoading: membersLoading } = useGetApiMutation({
    url: MEMBER_API.fetchMembers,
    queryKey: ["all-members"],
    options: { enabled: open },
  });

  const { data: meetingRes, isLoading: meetingLoading } = useGetApiMutation({
    url: meetingId ? MEETING_API.byId(meetingId) : "",
    queryKey: ["meeting", meetingId],
    options: { enabled: open && !!meetingId },
  });

  const allMembers = allMembersRes?.data || allMembersRes || [];

  const { attendedMembers, notAttendedMembers } = useMemo(() => {
    const meetingData = meetingRes?.data || meetingRes;
    if (!allMembers.length || !meetingData)
      return { attendedMembers: [], notAttendedMembers: [] };

    const attendedStr = meetingData.meeting_attendance || "";
    const attendedIdsSet = new Set(
      attendedStr
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id),
    );

    const attended = [];
    const notAttended = [];

    allMembers.forEach((member) => {
      if (attendedIdsSet.has(member.id.toString())) {
        attended.push(member);
      } else {
        notAttended.push(member);
      }
    });

    return { attendedMembers: attended, notAttendedMembers: notAttended };
  }, [allMembers, meetingRes]);

  const filteredAttended = attendedMembers.filter((m) =>
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredNotAttended = notAttendedMembers.filter((m) =>
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isLoading = membersLoading || meetingLoading;
  const meetingData = meetingRes?.data || meetingRes || {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>View Attendance Details</DialogTitle>
          <p className="text-sm text-gray-500">
            Comparing attended and not attended member lists
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Date
                </span>
                <span className="text-gray-900">
                  {meetingData.meeting_date
                    ? moment(meetingData.meeting_date).format("DD-MM-YYYY")
                    : "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Time
                </span>
                <span className="text-gray-900">
                  {meetingData.meeting_time || "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Meeting For
                </span>
                <span className="text-gray-900">
                  {meetingData.meeting_for || "-"}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-600 block mb-1">
                  Description
                </span>
                <span
                  className="text-gray-900 truncate block"
                  title={meetingData.meeting_description}
                >
                  {meetingData.meeting_description || "-"}
                </span>
              </div>
            </div>

            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <MemberList
                title="Attended"
                members={filteredAttended}
                icon={CheckCircle2}
                colorClass="text-emerald-700"
                bgClass="bg-emerald-50"
                borderClass="border-emerald-200"
              />
              <MemberList
                title="Not Attended"
                members={filteredNotAttended}
                icon={XCircle}
                colorClass="text-red-700"
                bgClass="bg-red-50"
                borderClass="border-red-200"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t mt-2">
          <Button variant="outline" onClick={onClose} className="px-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAttendanceModal;
