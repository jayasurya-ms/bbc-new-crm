import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ONETOONE_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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

const initialState = {
  onetoone_date: format(new Date(), "yyyy-MM-dd"),
  onetoone_from_id: "",
  onetoone_to_id: "",
};

const CreateOneToOneDialog = ({ open, onClose, id }) => {
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialState);
  const [activeMembers, setActiveMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const { trigger: fetchMembers } = useApiMutation();
  const { trigger: fetchOneToOne } = useApiMutation();
  const { trigger: saveOneToOne, loading } = useApiMutation();

  // Fetch active members manually in useEffect as requested
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

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchOneToOne({
          url: ONETOONE_API.byId(id),
          method: "get",
        });
        const rawData = res?.data || res?.onetoone || res;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setFormData({
            onetoone_date: data.onetoone_date || format(new Date(), "yyyy-MM-dd"),
            onetoone_from_id: (data.onetoone_from_id || data.onetoone_from?.id || data.from_id || "").toString(),
            onetoone_to_id: (data.onetoone_to_id || data.onetoone_to?.id || data.to_id || "").toString(),
          });
        }
      } catch (err) {
        toast.error("Failed to load one-to-one data");
        onClose();
      }
    };
    fetchData();
  }, [open, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.onetoone_from_id || !formData.onetoone_to_id) {
      toast.error("Please select both members");
      return;
    }
    if (formData.onetoone_from_id === formData.onetoone_to_id) {
      toast.error("Members must be different");
      return;
    }

    try {
      const res = await saveOneToOne({
        url: isEdit ? ONETOONE_API.update(id) : ONETOONE_API.create,
        method: isEdit ? "put" : "post",
        data: formData,
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(
          res.message ||
            `One-to-one ${isEdit ? "updated" : "created"} successfully`,
        );
        queryClient.invalidateQueries(["onetoone-list"]);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit One To One" : "Add One To One"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="onetoone_date">
              Date <span className="text-red-600">*</span>
            </Label>
            <Input
              id="onetoone_date"
              type="date"
              value={formData.onetoone_date}
              onChange={(e) =>
                setFormData({ ...formData, onetoone_date: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onetoone_from_id">
              From Member <span className="text-red-600">*</span>
            </Label>
            <Select
              key={`from-${activeMembers.length}-${formData.onetoone_from_id}`}
              value={formData.onetoone_from_id}
              onValueChange={(value) =>
                setFormData({ ...formData, onetoone_from_id: value })
              }
              disabled={membersLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    membersLoading ? "Loading members..." : "Select Member"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeMembers
                  .filter((m) => m.id.toString() !== formData.onetoone_to_id)
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="onetoone_to_id">
              To Member <span className="text-red-600">*</span>
            </Label>
            <Select
              key={`to-${activeMembers.length}-${formData.onetoone_to_id}`}
              value={formData.onetoone_to_id}
              onValueChange={(value) =>
                setFormData({ ...formData, onetoone_to_id: value })
              }
              disabled={membersLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    membersLoading ? "Loading members..." : "Select Member"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {activeMembers
                  .filter((m) => m.id.toString() !== formData.onetoone_from_id)
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOneToOneDialog;
