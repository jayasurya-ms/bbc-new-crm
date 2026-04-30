import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TEAM_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialState = {
  team_date: format(new Date(), "yyyy-MM-dd"),
  team_from_id: "",
  team_description: "",
  team_attendance: "",
};

const CreateTeamDialog = ({ open, onClose, id }) => {
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialState);
  const [activeMembers, setActiveMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttendance, setSelectedAttendance] = useState([]);

  const { trigger: fetchMembers } = useApiMutation();
  const { trigger: fetchTeam } = useApiMutation();
  const { trigger: saveTeam, loading } = useApiMutation();

  // Fetch active members
  useEffect(() => {
    if (open) {
      const getMembers = async () => {
        setMembersLoading(true);
        try {
          const res = await fetchMembers({
            url: MEMBER_API.fetchActiveMembers,
            method: "get",
          });
          const members = res?.data || res || [];
          setActiveMembers(members);
        } catch (error) {
          toast.error("Failed to fetch active members");
        } finally {
          setMembersLoading(false);
        }
      };
      getMembers();
    }
  }, [open]);

  // Fetch existing data for edit
  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      setSelectedAttendance([]);
      setSearchTerm("");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchTeam({
          url: TEAM_API.byId(id),
          method: "get",
        });
        const rawData = res?.data || res?.team || res;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setFormData({
            team_date: data.team_date || format(new Date(), "yyyy-MM-dd"),
            team_from_id: (
              data.team_from_id ||
              data.team_from?.id ||
              data.from_id ||
              ""
            ).toString(),
            team_description: data.team_description || "",
            team_attendance: data.team_attendance || "",
          });

          // Handle attendance mapping
          const attendanceIds = (data.team_attendance || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
          setSelectedAttendance(attendanceIds);
        }
      } catch (err) {
        toast.error("Failed to load team data");
        onClose();
      }
    };
    fetchData();
  }, [open, id]);

  const handleToggleAttendance = (memberId) => {
    const idStr = memberId.toString();
    setSelectedAttendance((prev) => {
      if (prev.includes(idStr)) {
        return prev.filter((id) => id !== idStr);
      } else {
        return [...prev, idStr];
      }
    });
  };

  const filteredMembersForAttendance = activeMembers.filter(
    (m) =>
      m.id.toString() !== formData.team_from_id &&
      (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.team_from_id) {
      toast.error("Please select a member");
      return;
    }
    if (!selectedAttendance.length) {
      toast.error("Please select at least one member for Attendance");
      return;
    }

    const payload = {
      ...formData,
      team_attendance: selectedAttendance.join(","),
    };

    try {
      const res = await saveTeam({
        url: isEdit ? TEAM_API.update(id) : TEAM_API.create,
        method: isEdit ? "put" : "post",
        data: payload,
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(
          res.message ||
            `Team record ${isEdit ? "updated" : "created"} successfully`,
        );
        queryClient.invalidateQueries(["team-list"]);
        onClose();
      } else {
        toast.error(res?.message || "Failed to save record");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Team Record" : "Add Team Record"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-4 overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team_date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="team_date"
                type="date"
                value={formData.team_date}
                onChange={(e) =>
                  setFormData({ ...formData, team_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_from_id">
                Member <span className="text-red-500">*</span>
              </Label>
              <Select
                key={`team-${activeMembers.length}-${formData.team_from_id}`}
                value={formData.team_from_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, team_from_id: value });
                  // Remove from attendance if it was selected there
                  setSelectedAttendance((prev) =>
                    prev.filter((id) => id !== value),
                  );
                }}
                disabled={membersLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      membersLoading ? "Loading..." : "Select Member"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_description">Description</Label>
            <Textarea
              id="team_description"
              placeholder="Enter team description..."
              value={formData.team_description}
              onChange={(e) =>
                setFormData({ ...formData, team_description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Attendance (Team Members) <span className="text-red-500">*</span>.
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search members for attendance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <div className="border rounded-md">
              <ScrollArea className="h-[200px]">
                <div className="p-2 space-y-1">
                  {membersLoading ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Loading members...
                    </div>
                  ) : filteredMembersForAttendance.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No members found
                    </div>
                  ) : (
                    filteredMembersForAttendance.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-sm transition-colors"
                      >
                        <Checkbox
                          id={`attn-${member.id}`}
                          checked={selectedAttendance.includes(
                            member.id.toString(),
                          )}
                          onCheckedChange={() =>
                            handleToggleAttendance(member.id)
                          }
                        />
                        <Label
                          htmlFor={`attn-${member.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          {member.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedAttendance.length} members selected for attendance
            </div>
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || membersLoading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Team" : "Save Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;
