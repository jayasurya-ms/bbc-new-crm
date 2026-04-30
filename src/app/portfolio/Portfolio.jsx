import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ImageUpload from "@/components/image-upload/image-upload";
import { useApiMutation } from "@/hooks/useApiMutation";
import { PORTFOLIO_API } from "@/constants/apiConstants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Loader from "@/components/loader/loader";

const Portfolio = () => {
  const [sliderImages, setSliderImages] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    product_image1: null,
    product_image2: null,
    product_image3: null,
    product_image4: null,
    product_image5: null,
  });
  const [previews, setPreviews] = useState({
    product_image1: "",
    product_image2: "",
    product_image3: "",
    product_image4: "",
    product_image5: "",
  });
  const [ids, setIds] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const { trigger: fetchPortfolio } = useApiMutation();
  const { trigger: updatePortfolio, loading: isUpdating } = useApiMutation();

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setIsFetching(true);
        const res = await fetchPortfolio({
          url: PORTFOLIO_API.fetch,
          method: "get",
        });

        const slider = res?.slider || {};
        setSliderImages(slider);
        setIds(slider.id || null);

        // Populate previews based on existing images
        const newPreviews = {};
        for (let i = 1; i <= 5; i++) {
          const key = `product_image${i}`;
          if (slider[key]) {
            newPreviews[key] =
              `https://businessboosters.club/public/images/product_images/${slider[key]}`;
          }
        }
        setPreviews((prev) => ({ ...prev, ...newPreviews }));
      } catch (error) {
        toast.error("Failed to fetch portfolio data");
      } finally {
        setIsFetching(false);
      }
    };

    loadPortfolio();
  }, []);

  const handleImageChange = (fieldName, file) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [fieldName]: file }));
      const url = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [fieldName]: url }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: null }));
    setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ids) {
      toast.error("No portfolio ID found to update.");
      return;
    }

    // Check if any file is actually selected to update
    const hasChanges = Object.values(selectedFiles).some(
      (file) => file !== null,
    );
    if (!hasChanges) {
      toast.info("No new images selected for update.");
      return;
    }

    const formData = new FormData();
    Object.keys(selectedFiles).forEach((key) => {
      if (selectedFiles[key]) {
        formData.append(key, selectedFiles[key]);
      }
    });

    try {
      // Using POST with _method=PUT to support FormData parsing in Laravel
      const res = await updatePortfolio({
        url: `${PORTFOLIO_API.update(ids)}?_method=PUT`,
        method: "post",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (
        res?.code === "200" ||
        res?.status === "success" ||
        res?.status === 200
      ) {
        toast.success("Portfolio updated successfully");

        // Reset selected files to empty since they've been uploaded
        setSelectedFiles({
          product_image1: null,
          product_image2: null,
          product_image3: null,
          product_image4: null,
          product_image5: null,
        });
      } else {
        toast.error("Failed to update portfolio images");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating portfolio");
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  const hasChanges = Object.values(selectedFiles).some((file) => file !== null);

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Card className="max-w-8xl mx-auto shadow-lg border-t-4 border-t-primary">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 py-5 gap-4">
              <div>
                <div className="text-2xl text-primary uppercase font-bold">
                  Portfolio
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload and manage your portfolio
                </p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !hasChanges}
                  className="w-full sm:w-auto"
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isUpdating ? "Updating..." : "Update Portfolio"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((index) => {
                const key = `product_image${index}`;
                return (
                  <div
                    key={key}
                    className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <ImageUpload
                      id={key}
                      label={`Portfolio ${index}`}
                      previewImage={previews[key]}
                      onFileChange={(e) =>
                        handleImageChange(key, e.target.files?.[0])
                      }
                      onRemove={() => handleRemoveImage(key)}
                      format="IMAGE"
                      maxSize={5}
                      allowedExtensions={["webp", "jpg", "jpeg", "png"]}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
