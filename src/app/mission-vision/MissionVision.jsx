import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/useApiMutation";
import { MISSION_VISION } from "@/constants/apiConstants";
import { toast } from "sonner";
import { Loader2, Target, Eye, Plus } from "lucide-react";
import Loader from "@/components/loader/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const initialState = {
  product_mission: "",
  product_vision: "",
};

const MissionVision = () => {
  const [formData, setFormData] = useState(initialState);
  const [initialData, setInitialData] = useState(initialState);
  const [id, setId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMissionVision, setHasMissionVision] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { trigger: fetchMissionVision } = useApiMutation();
  const { trigger: updateMissionVision, loading: updateLoading } =
    useApiMutation();
  const { trigger: createMissionVision, loading: createLoading } =
    useApiMutation();

  const loadMissionVision = async () => {
    try {
      setIsFetching(true);
      const res = await fetchMissionVision({
        url: MISSION_VISION.fetch,
        method: "get",
      });
      if (res?.mission_vision) {
        setId(res.mission_vision.id);
        const fetchedData = {
          product_mission: res.mission_vision.product_mission || "",
          product_vision: res.mission_vision.product_vision || "",
        };
        setInitialData(fetchedData);
        setFormData(fetchedData);
        setHasMissionVision(true);
      } else {
        setHasMissionVision(false);
      }
    } catch (error) {
      toast.error("Failed to load Mission & Vision data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadMissionVision();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateMissionVision({
        url: `${MISSION_VISION.update}/${id}`,
        method: "put",
        data: formData,
      });

      if (
        res?.code === 200 ||
        res?.code === 201 ||
        res?.status === "success" ||
        res?.message
      ) {
        toast.success(res.message || "Mission & Vision updated successfully");
        setInitialData(formData);
      } else {
        toast.error(res?.message || "Failed to update Mission & Vision");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error updating Mission & Vision",
      );
    }
  };

  const hasChanges = Object.keys(formData).some(
    (key) => formData[key] !== initialData[key],
  );

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Card className="max-w-8xl mx-auto shadow-lg border-t-4 border-t-primary">
        <CardContent>
          <div className="grid grid-cols-2 mb-8 border-b border-gray-200 py-5">
            <div className="flex flex-col justify-center">
              <div className="text-2xl text-primary uppercase">
                Mission & Vision
              </div>
              <p className="text-sm text-muted-foreground">
                Update your company's mission and vision
              </p>
            </div>
            <div className="flex justify-end gap-5 items-center h-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              {hasMissionVision && (
                <Button
                  onClick={handleUpdate}
                  disabled={updateLoading || !hasChanges}
                >
                  {updateLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Mission & Vision
                </Button>
              )}
            </div>
          </div>

          {!hasMissionVision ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="bg-primary/10 p-6 rounded-full">
                <Target className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  No Mission & Vision Found
                </h3>
                <p className="text-muted-foreground">
                  Get started by creating your company's mission and vision
                  statements.
                </p>
              </div>
              <Button onClick={() => setOpenDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Mission & Vision
              </Button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 mb-2 text-md font-semibold">
                    <Target size={20} className="text-primary" />
                    Mission Statement *
                  </Label>
                  <Textarea
                    name="product_mission"
                    value={formData.product_mission || ""}
                    onChange={handleChange}
                    placeholder="Enter your company's mission"
                    className="min-h-[300px] w-full p-4 text-base leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 mb-2 text-md font-semibold">
                    <Eye size={20} className="text-primary" />
                    Vision Statement *
                  </Label>
                  <Textarea
                    name="product_vision"
                    value={formData.product_vision || ""}
                    onChange={handleChange}
                    placeholder="Enter your company's vision"
                    className="min-h-[300px] w-full p-4 text-base leading-relaxed"
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Mission & Vision</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target size={18} className="text-primary" />
                Mission
              </Label>
              <Textarea
                name="product_mission"
                value={formData.product_mission || ""}
                onChange={handleChange}
                placeholder="Enter your company's mission"
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Eye size={18} className="text-primary" />
                Vision
              </Label>
              <Textarea
                name="product_vision"
                value={formData.product_vision || ""}
                onChange={handleChange}
                placeholder="Enter your company's vision"
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionVision;
