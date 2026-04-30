import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEETING_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GroupButton } from "@/components/group-button";

const initialState = {
  meeting_date: "",
  meeting_time: "",
  meeting_for: "",
  meeting_description: "",
  meeting_status: "Active",
};

const CreateMeetingDialog = ({ open, onClose, Id }) => {
  const isEdit = Boolean(Id);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(initialState);
  
  // For fetching existing data
  const { trigger: fetchMeeting } = useApiMutation();
  // For saving data
  const { trigger: saveMeeting, loading } = useApiMutation();

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      setFormData(initialState);
      setErrors({});
      return;
    }
    
    const fetchData = async () => {
      try {
        const res = await fetchMeeting({
          url: MEETING_API.byId(Id),
        });
        const data = res.data;
        setFormData({
          meeting_date: data.meeting_date || "",
          meeting_time: data.meeting_time || "",
          meeting_for: data.meeting_for || "",
          meeting_description: data.meeting_description || "",
          meeting_status: data.meeting_status || "Active",
        });
      } catch (err) {
        toast.error(err.message || "Failed to load Meeting data");
      }
    };
    fetchData();
  }, [open, Id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.meeting_date) err.meeting_date = "Required";
    if (!formData.meeting_time) err.meeting_time = "Required";
    if (!formData.meeting_for) err.meeting_for = "Required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res = await saveMeeting({
        url: isEdit ? MEETING_API.update(Id) : MEETING_API.create,
        method: isEdit ? "put" : "post",
        data: formData,
      });

      if (res?.code === 200 || res?.success || res?.status === 200) {
        toast.success(res.message || res.msg || `Meeting ${isEdit ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries(["active-meetings"]);
        queryClient.invalidateQueries(["inactive-meetings"]);
        onClose();
      } else {
        toast.error(res?.message || res?.msg || "Failed to save meeting");
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.response?.data?.msg;
      toast.error(errorMsg || "Something went wrong");
    }
  };

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Meeting" : "Schedule New Meeting"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <Label>Meeting For *</Label>
            <Input
              name="meeting_for"
              placeholder="e.g. Project Discussion"
              value={formData.meeting_for}
              onChange={handleChange}
            />
            {errors.meeting_for && (
              <p className="text-sm text-red-500">{errors.meeting_for}</p>
            )}
          </div>

          <div>
            <Label>Meeting Date *</Label>
            <Input
              type="date"
              name="meeting_date"
              value={formData.meeting_date}
              onChange={handleChange}
              min={todayStr}
            />
            {errors.meeting_date && (
              <p className="text-sm text-red-500">{errors.meeting_date}</p>
            )}
          </div>

          <div>
            <Label>Meeting Time *</Label>
            <Input
              type="time"
              name="meeting_time"
              value={formData.meeting_time}
              onChange={handleChange}
            />
            {errors.meeting_time && (
              <p className="text-sm text-red-500">{errors.meeting_time}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <Label>Meeting Description</Label>
            <Textarea
              name="meeting_description"
              placeholder="Enter detailed description..."
              value={formData.meeting_description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {isEdit && (
            <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
              <Label>Status</Label>
              <GroupButton
                value={formData.meeting_status}
                onChange={(v) =>
                  setFormData((p) => ({
                    ...p,
                    meeting_status: v,
                  }))
                }
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Meeting" : "Schedule Meeting"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
