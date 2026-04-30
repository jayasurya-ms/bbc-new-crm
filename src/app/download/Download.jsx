import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DOWNLOAD_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import { Download as DownloadIcon, Loader2 } from "lucide-react";

const Download = () => {
  const [downloadingMember, setDownloadingMember] = useState(false);
  const [downloadingMobile, setDownloadingMobile] = useState(false);
  const { trigger: downloadTrigger } = useApiMutation();

  const handleDownload = async (url, fileName, setLoader) => {
    try {
      setLoader(true);
      const res = await downloadTrigger({
        url,
        method: "post",
        data: {},
        options: {
          responseType: "blob",
        },
      });

      if (!res) {
          throw new Error("No data received");
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${fileName} downloaded successfully.`);
    } catch (err) {
      console.error(`Error downloading ${fileName}:`, err);
      toast.error("Error downloading file.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-2xl font-bold text-primary uppercase tracking-tight">
            Download Reports
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Export and download your system data as CSV files
          </p>
        </CardHeader>
        <CardContent className="pt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col items-center p-6 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DownloadIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Member Data</h3>
                <p className="text-xs text-center text-muted-foreground mb-6">
                    Download a comprehensive list of all registered members in CSV format.
                </p>
                <Button
                    className="w-full h-12"
                    onClick={() => handleDownload(DOWNLOAD_API.member, "member.csv", setDownloadingMember)}
                    disabled={downloadingMember}
                >
                    {downloadingMember ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <DownloadIcon className="mr-2 h-4 w-4" />
                    )}
                    {downloadingMember ? "Downloading..." : "Download CSV"}
                </Button>
            </div>

            <div className="flex flex-col items-center p-6 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DownloadIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Mobile User Data</h3>
                <p className="text-xs text-center text-muted-foreground mb-6">
                    Export all mobile application users and their basic information to CSV.
                </p>
                <Button
                    className="w-full h-12"
                    onClick={() => handleDownload(DOWNLOAD_API.mobileUser, "mobileuser.csv", setDownloadingMobile)}
                    disabled={downloadingMobile}
                >
                    {downloadingMobile ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <DownloadIcon className="mr-2 h-4 w-4" />
                    )}
                    {downloadingMobile ? "Downloading..." : "Download CSV"}
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Download;
