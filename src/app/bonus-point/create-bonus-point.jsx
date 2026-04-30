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
import { BONUS_POINT_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialState = {
  bonus_point_date: format(new Date(), "yyyy-MM-dd"),
  bonus_point_description: "",
  bonus_point: "",
};

const CreateBonusPointDialog = ({ open, onClose, id }) => {
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialState);
  const [activeMembers, setActiveMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttendance, setSelectedAttendance] = useState([]);

  const { trigger: fetchMembers } = useApiMutation();
  const { trigger: fetchBonusPoint } = useApiMutation();
  const { trigger: saveBonusPoint, loading } = useApiMutation();

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
        const res = await fetchBonusPoint({
          url: BONUS_POINT_API.byId(id),
          method: "get",
        });
        const rawData = res?.data || res?.bonus_point || res;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setFormData({
            bonus_point_date:
              data.bonus_point_date || format(new Date(), "yyyy-MM-dd"),
            bonus_point_description: data.bonus_point_description || "",
            bonus_point: data.bonus_point || "",
          });

          // Handle attendance mapping
          const attendanceIds = (data.bonus_point_attendance || "")
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id);
          setSelectedAttendance(attendanceIds);
        }
      } catch (err) {
        toast.error("Failed to load bonus point data");
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

  const filteredMembers = activeMembers.filter((m) =>
    (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAttendance.length) {
      toast.error("Please select at least one member");
      return;
    }
    if (formData.bonus_point <= 0 || !formData.bonus_point) {
      toast.error("Please enter bonus points greater than 0");
      return;
    }

    const payload = {
      ...formData,
      bonus_point_attendance: selectedAttendance.join(","),
    };

    try {
      const res = await saveBonusPoint({
        url: isEdit ? BONUS_POINT_API.update(id) : BONUS_POINT_API.create,
        method: isEdit ? "put" : "post",
        data: payload,
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(
          res.message ||
            `Bonus points ${isEdit ? "updated" : "created"} successfully`,
        );
        queryClient.invalidateQueries(["bonus-point-list"]);
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
            {isEdit ? "Edit Bonus Point" : "Add Bonus Point"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 py-4 overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonus_point_date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bonus_point_date"
                type="date"
                value={formData.bonus_point_date}
                onChange={(e) =>
                  setFormData({ ...formData, bonus_point_date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus_point">
                Points <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bonus_point"
                type="number"
                placeholder="Enter points"
                value={formData.bonus_point}
                onChange={(e) =>
                  setFormData({ ...formData, bonus_point: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus_point_description">Description</Label>
            <Textarea
              id="bonus_point_description"
              placeholder="Enter details..."
              value={formData.bonus_point_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bonus_point_description: e.target.value,
                })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Select Members <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search members..."
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
                  ) : filteredMembers.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No members found
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-sm transition-colors"
                      >
                        <Checkbox
                          id={`bonus-${member.id}`}
                          checked={selectedAttendance.includes(
                            member.id.toString(),
                          )}
                          onCheckedChange={() =>
                            handleToggleAttendance(member.id)
                          }
                        />
                        <Label
                          htmlFor={`bonus-${member.id}`}
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
              {selectedAttendance.length} members selected
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
              {isEdit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBonusPointDialog;
