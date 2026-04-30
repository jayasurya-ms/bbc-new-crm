import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEADS_API, MEMBER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState = {
  lead_date: moment().format("YYYY-MM-DD"),
  lead_from_id: "",
  lead_to_id: "",
  lead_amount: "",
};

const CreateLeadDialog = ({ open, onClose, leadId }) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const isEdit = !!leadId;

  const { trigger: fetchLead } = useApiMutation();
  const { trigger: submitLead, loading: isSubmitting } = useApiMutation();

  // Fetch active members for the dropdowns
  const { data: membersRes, isLoading: membersLoading } = useGetApiMutation({
    url: MEMBER_API.fetchActiveMembers,
    queryKey: ["active-members"],
    options: { enabled: open },
  });

  const members = membersRes?.data || membersRes || [];

  useEffect(() => {
    if (!open) return;
    
    if (!isEdit) {
      setFormData(initialState);
      setErrors({});
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchLead({
          url: LEADS_API.byId(leadId),
          method: "get",
        });
        const data = res?.data || res;
        if (data) {
          setFormData({
            lead_date: data.lead_date ? moment(data.lead_date).format("YYYY-MM-DD") : "",
            lead_from_id: data.lead_from_id ? String(data.lead_from_id) : "",
            lead_to_id: data.lead_to_id ? String(data.lead_to_id) : "",
            lead_amount: data.lead_amount || "",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch lead details");
        onClose();
      }
    };
    fetchData();
  }, [open, leadId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.lead_date) newErrors.lead_date = "Date is required";
    if (!formData.lead_from_id) newErrors.lead_from_id = "Lead from is required";
    if (!formData.lead_to_id) newErrors.lead_to_id = "Lead to is required";
    if (!formData.lead_amount) newErrors.lead_amount = "Amount is required";

    if (
      formData.lead_from_id &&
      formData.lead_to_id &&
      formData.lead_from_id === formData.lead_to_id
    ) {
      newErrors.lead_to_id = "Lead From and To cannot be the same";
      toast.error("Lead From and To members cannot be the same");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        ...formData,
        lead_amount: Number(formData.lead_amount),
      };

      const res = await submitLead({
        url: isEdit ? LEADS_API.update(leadId) : LEADS_API.create,
        method: isEdit ? "put" : "post",
        data: payload,
      });

      if (res?.code === 200 || res?.success || res?.status === "success" || res?.status === 200) {
        toast.success(res.message || `Lead ${isEdit ? "updated" : "created"} successfully`);
        queryClient.invalidateQueries(["leads"]);
        onClose();
      } else {
        toast.error(res?.message || res?.msg || "Failed to process request");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.response?.data?.msg || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="lead_date">
              Lead Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              id="lead_date"
              name="lead_date"
              value={formData.lead_date}
              onChange={handleChange}
              className={errors.lead_date ? "border-red-500" : ""}
            />
            {errors.lead_date && (
              <p className="text-sm text-red-500">{errors.lead_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_from_id">
              Lead From <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.lead_from_id}
              onValueChange={(val) => handleSelectChange("lead_from_id", val)}
              disabled={membersLoading}
            >
              <SelectTrigger className={errors.lead_from_id ? "border-red-500" : ""}>
                <SelectValue placeholder={membersLoading ? "Loading..." : "Select Member"} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead_from_id && (
              <p className="text-sm text-red-500">{errors.lead_from_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_to_id">
              Lead To <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.lead_to_id}
              onValueChange={(val) => handleSelectChange("lead_to_id", val)}
              disabled={membersLoading}
            >
              <SelectTrigger className={errors.lead_to_id ? "border-red-500" : ""}>
                <SelectValue placeholder={membersLoading ? "Loading..." : "Select Member"} />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={String(member.id)}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead_to_id && (
              <p className="text-sm text-red-500">{errors.lead_to_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_amount">
              Lead Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              id="lead_amount"
              name="lead_amount"
              placeholder="Enter amount"
              value={formData.lead_amount}
              onChange={handleChange}
              className={errors.lead_amount ? "border-red-500" : ""}
            />
            {errors.lead_amount && (
              <p className="text-sm text-red-500">{errors.lead_amount}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLeadDialog;
