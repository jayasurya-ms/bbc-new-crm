import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEETING_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AttendanceModal = ({ open, onClose, meetingId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  // API to fetch active members
  const { data: membersRes, isLoading: membersLoading } = useGetApiMutation({
    url: MEMBER_API.fetchActiveMembers,
    queryKey: ["active-members"],
    options: { enabled: open },
  });

  // API to fetch meeting details
  const { data: meetingRes, isLoading: meetingLoading } = useGetApiMutation({
    url: meetingId ? MEETING_API.byId(meetingId) : "",
    queryKey: ["meeting", meetingId],
    options: { enabled: open && !!meetingId },
  });

  const { trigger: saveAttendance, loading: saveLoading } = useApiMutation();

  const members = membersRes?.data || membersRes || [];

  useEffect(() => {
    if (open && members.length > 0 && meetingRes) {
      const meetingData = meetingRes.data || meetingRes;
      setSearchTerm("");
      const existingAttendanceStr = meetingData.meeting_attendance || "";
      const existingIds = new Set(
        existingAttendanceStr
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id),
      );

      const preSelected = members.filter((m) =>
        existingIds.has(m.id.toString()),
      );
      setSelectedMembers(preSelected);
    } else if (!open) {
      setSelectedMembers([]);
      setSearchTerm("");
    }
  }, [open, members.length, meetingRes]);

  const handleToggleMember = (member) => {
    setSelectedMembers((prev) => {
      const isSelected = prev.some((m) => m.id === member.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMembers(members);
    } else {
      setSelectedMembers([]);
    }
  };

  const filteredMembers = members.filter((m) =>
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      const memberIdsStr = selectedMembers.map((m) => m.id).join(",");
      const res = await saveAttendance({
        url: MEETING_API.updateAttendance(meetingId),
        method: "put",
        data: { meeting_attendance: memberIdsStr },
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(
          res.message || res.msg || "Attendance updated successfully",
        );
        queryClient.invalidateQueries(["active-meetings"]);
        queryClient.invalidateQueries(["inactive-meetings"]);
        onClose();
      } else {
        toast.error(res?.message || res?.msg || "Failed to update attendance");
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || error?.response?.data?.msg;
      toast.error(errorMsg || "Error updating attendance. Please try again.");
    }
  };

  const isAllSelected =
    members.length > 0 && selectedMembers.length === members.length;
  const isLoading = membersLoading || meetingLoading;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <p className="text-sm text-gray-500">
            Select members who attended this meeting
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search Member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="select-all"
                  className="font-semibold cursor-pointer"
                >
                  Select All ({members.length})
                </Label>
              </div>
              <span className="text-sm text-gray-500 font-medium">
                {selectedMembers.length} selected
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No members found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isChecked = selectedMembers.some(
                      (m) => m.id === member.id,
                    );
                    return (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleToggleMember(member)}
                        />
                        <div className="flex flex-col flex-1 leading-none">
                          <Label
                            htmlFor={`member-${member.id}`}
                            className="font-medium text-sm cursor-pointer mb-1"
                          >
                            {member.name}
                          </Label>
                          <span className="text-xs text-gray-500">
                            Mobile: {member.mobile}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saveLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saveLoading || isLoading || selectedMembers.length === 0}
          >
            {saveLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
