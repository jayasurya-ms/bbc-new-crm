import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/useApiMutation";
import { ABOUT_US } from "@/constants/apiConstants";
import { toast } from "sonner";
import { Loader2, Info } from "lucide-react";
import Loader from "@/components/loader/loader";

const AboutUs = () => {
  const [formData, setFormData] = useState({ product_about_us: "" });
  const [initialData, setInitialData] = useState({ product_about_us: "" });
  const [id, setId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const { trigger: fetchAboutUs } = useApiMutation();
  const { trigger: updateAboutUs, loading } = useApiMutation();

  useEffect(() => {
    const loadAboutUs = async () => {
      try {
        setIsFetching(true);
        const res = await fetchAboutUs({
          url: ABOUT_US.fetch,
          method: "get",
        });
        if (res?.aboutUs) {
          setId(res?.aboutUs?.id || null);
          const fetchedData = {
            product_about_us:
              res?.aboutUs?.product_about_us !== null &&
              res?.aboutUs?.product_about_us !== undefined
                ? String(res?.aboutUs?.product_about_us)
                : "",
          };
          setInitialData(fetchedData);
          setFormData(fetchedData);
        }
      } catch (error) {
        toast.error("Failed to load About Us data");
      } finally {
        setIsFetching(false);
      }
    };
    loadAboutUs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(id, "id");

    const apiEndpoint = id == null ? ABOUT_US.create : ABOUT_US.update;
    try {
      const res = await updateAboutUs({
        url: id == null ? apiEndpoint : `${apiEndpoint}/${id}`,
        method: id == null ? "post" : "put",
        data: { product_about_us: formData.product_about_us },
      });

      if (
        res?.code === 200 ||
        res?.code === 201 ||
        res?.status === "success" ||
        res?.message
      ) {
        toast.success(res.message || "About Us updated successfully");
        setInitialData(formData);
      } else {
        toast.error(res?.message || "Failed to update About Us");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating About Us");
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
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-8"
          >
            <div className="grid grid-cols-2 mb-8 border-b border-gray-200 py-5">
              <div className="flex flex-col justify-center">
                <div className="text-2xl text-primary uppercase">About Us</div>
                <p className="text-sm text-muted-foreground">
                  Update information about your company
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
                <Button type="submit" disabled={loading || !hasChanges}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update About Us
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label className="flex items-center gap-1 mb-2 text-md">
                  <Info size={18} />
                  About Us Content *
                </Label>
                <Textarea
                  name="product_about_us"
                  value={formData.product_about_us || ""}
                  onChange={handleChange}
                  placeholder="Enter..."
                  className="min-h-[300px] w-full p-4"
                  rows={12}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutUs;
