import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_API, USER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import DataTable from "@/components/common/data-table";
import { toast } from "sonner";
import { Download, FileText, Loader2, Search } from "lucide-react";
import { exportToExcel } from "@/utils/excelUtils";
import moment from "moment";

const AttendenceReport = () => {
  const [fromDate, setFromDate] = useState(moment().format("YYYY-MM-DD"));
  const [toDate, setToDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedPType, setSelectedPType] = useState("all");
  const [pTypes, setPTypes] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isPTypesLoading, setIsPTypesLoading] = useState(false);

  const { trigger: apiTrigger } = useApiMutation();

  useEffect(() => {
    fetchPTypes();
  }, []);

  const fetchPTypes = async () => {
    try {
      setIsPTypesLoading(true);
      const res = await apiTrigger({
        url: USER_API.fetchPType,
        method: "get",
      });
      const data = res?.data || res || [];
      setPTypes(data);
    } catch (error) {
      console.error("Failed to fetch group types:", error);
    } finally {
      setIsPTypesLoading(false);
    }
  };

  const handleFetchReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    try {
      setIsFetching(true);
      const res = await apiTrigger({
        url: REPORT_API.attendance,
        method: "post",
        data: {
          from_date: fromDate,
          to_date: toDate,
          p_type: selectedPType === "all" ? "" : selectedPType,
        },
      });
      
      const data = res?.data || res || [];
      setReportData(Array.isArray(data) ? data : []);
      
      if (Array.isArray(data) && data.length === 0) {
        toast.info("No records found for the selected filters");
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
      toast.error("Failed to fetch report data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const columns = [
      { header: "SL No", key: "slNo", width: 8 },
      { header: "Member Name", key: "name", width: 25 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "Sub Group", key: "user_group", width: 20 },
      { header: "Category", key: "category", width: 25 },
      { header: "Attendance", key: "attendance_count", width: 12 },
      { header: "Ref Received", key: "ref_received", width: 12 },
      { header: "Ref Given", key: "ref_given", width: 12 },
      { header: "1-to-1", key: "onetoone_count", width: 12 },
      { header: "Team Points", key: "team_points", width: 12 },
      { header: "Visitors", key: "visitor_count", width: 12 },
      { header: "Chief Guest", key: "chief_guest_count", width: 12 },
      { header: "New Joining", key: "newjoining_count", width: 12 },
      { header: "Bonus Points", key: "bonus_point", width: 12 },
    ];

    const dataToExport = reportData.map((item, index) => ({
      ...item,
      slNo: index + 1,
      user_group: item.user_group || "N/A",
      category: item.category || "N/A",
    }));

    exportToExcel({
      data: dataToExport,
      columns,
      fileName: `Attendance_Report_${fromDate}_to_${toDate}.xlsx`,
      reportTitle: `Attendance Report (${fromDate} to ${toDate})`,
    });

    toast.success("Excel report generated successfully");
  };

  const columns = [
    {
      header: "SL No",
      accessorKey: "slNo",
      cell: ({ row }) => row.index + 1,
      width: 50,
    },
    {
      header: "Member Name",
      accessorKey: "name",
    },
    {
      header: "Mobile",
      accessorKey: "mobile",
    },
    {
      header: "Sub Group",
      accessorKey: "user_group",
      cell: ({ row }) => row.original.user_group || "-",
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => row.original.category || "-",
    },
    {
      header: "Attendance",
      accessorKey: "attendance_count",
    },
    {
      header: "1-to-1",
      accessorKey: "onetoone_count",
    },
    {
      header: "Ref Given",
      accessorKey: "ref_given",
    },
    {
      header: "Ref Received",
      accessorKey: "ref_received",
    },
    {
      header: "Visitors",
      accessorKey: "visitor_count",
    },
    {
      header: "Team Pts",
      accessorKey: "team_points",
    },
    {
      header: "Chief Guest",
      accessorKey: "chief_guest_count",
    },
    {
      header: "New Joining",
      accessorKey: "newjoining_count",
    },
    {
      header: "Bonus",
      accessorKey: "bonus_point",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Group Type</Label>
              <Select
                value={selectedPType}
                onValueChange={setSelectedPType}
                disabled={isPTypesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {pTypes.map((type) => {
                    const value = type.p_type || type.name || type;
                    return (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleFetchReport} 
                className="flex-1"
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Fetch
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={reportData.length === 0 || isFetching}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <DataTable
            data={reportData}
            columns={columns}
            showPagination={false}
            searchPlaceholder="Search report data..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendenceReport;
