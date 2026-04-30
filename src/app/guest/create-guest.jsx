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
import { GUEST_API, MEMBER_API } from "@/constants/apiConstants";
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
  guest_date: format(new Date(), "yyyy-MM-dd"),
  guest_type: "Visitor",
  guest_from_id: "",
  guest_description: "",
};

const CreateGuestDialog = ({ open, onClose, id }) => {
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialState);
  const [activeMembers, setActiveMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const { trigger: fetchMembers } = useApiMutation();
  const { trigger: fetchGuest } = useApiMutation();
  const { trigger: saveGuest, loading } = useApiMutation();

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
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchGuest({
          url: GUEST_API.byId(id),
          method: "get",
        });
        const rawData = res?.data || res?.guest || res;
        const data = Array.isArray(rawData) ? rawData[0] : rawData;
        if (data) {
          setFormData({
            guest_date: data.guest_date || format(new Date(), "yyyy-MM-dd"),
            guest_type: data.guest_type || "Visitor",
            guest_from_id: (data.guest_from_id || data.guest_from?.id || data.from_id || "").toString(),
            guest_description: data.guest_description || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load visitor/guest data");
        onClose();
      }
    };
    fetchData();
  }, [open, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_from_id) {
      toast.error("Please select a member");
      return;
    }

    try {
      const res = await saveGuest({
        url: isEdit ? GUEST_API.update(id) : GUEST_API.create,
        method: isEdit ? "put" : "post",
        data: formData,
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(res.message || `Record ${isEdit ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries(["guest-list"]);
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
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Visitor/Guest" : "Add Visitor/Guest"}</DialogTitle>
        </DialogHeader>
        
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 py-4 overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="space-y-2">
            <Label htmlFor="guest_date">Date <span className="text-red-500">*</span></Label>
            <Input
              id="guest_date"
              type="date"
              value={formData.guest_date}
              onChange={(e) => setFormData({ ...formData, guest_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_type">Type <span className="text-red-500">*</span></Label>
            <Select
              value={formData.guest_type}
              onValueChange={(value) => setFormData({ ...formData, guest_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visitor">Visitor</SelectItem>
                <SelectItem value="Chief Guest">Chief Guest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_from_id">Member <span className="text-red-500">*</span></Label>
            <Select
              key={`guest-member-${activeMembers.length}-${formData.guest_from_id}`}
              value={formData.guest_from_id}
              onValueChange={(value) => setFormData({ ...formData, guest_from_id: value })}
              disabled={membersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={membersLoading ? "Loading..." : "Select Member"} />
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

          <div className="space-y-2">
            <Label htmlFor="guest_description">Description</Label>
            <Textarea
              id="guest_description"
              placeholder="Enter details..."
              value={formData.guest_description}
              onChange={(e) => setFormData({ ...formData, guest_description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter className="pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
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

export default CreateGuestDialog;
