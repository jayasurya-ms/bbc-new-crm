import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  X,
  ChevronDown,
  Loader,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { USER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { toast } from "sonner";
import LoaderComponent from "@/components/loader/loader";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

const NewUserView = () => {
  const [newUserData, setNewUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPTypes, setSelectedPTypes] = useState([]);
  const [pTypes, setPTypes] = useState([]);
  const [pTypesLoading, setPTypesLoading] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const userId = new URLSearchParams(location.search).get("id");

  const { trigger: fetchUser } = useApiMutation();
  const { trigger: activateUser, loading: isActivating } = useApiMutation();

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await fetchUser({
          url: USER_API.byId(userId),
          method: "get",
        });
        setNewUserData(res?.new_user || null);
      } catch (error) {
        toast.error("Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  useEffect(() => {
    const fetchPTypes = async () => {
      try {
        setPTypesLoading(true);
        const res = await fetchUser({
          url: USER_API.fetchPType,
          method: "get",
        });
        const data = res?.data || res || [];
        setPTypes(data);
      } catch (error) {
        toast.error("Failed to fetch group types");
      } finally {
        setPTypesLoading(false);
      }
    };
    fetchPTypes();
  }, []);

  const togglePType = (type) => {
    setSelectedPTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleActivate = async () => {
    if (!newUserData?.id) return;
    if (selectedPTypes.length === 0) {
      toast.error("Please select at least one group");
      return;
    }
    try {
      const res = await activateUser({
        url: USER_API.activate(newUserData.id),
        method: "put",
        data: { p_type: selectedPTypes.join(",") },
      });

      toast.success("User activated successfully");
      navigate("/active-user");
    } catch (error) {
      toast.error("Failed to activate user");
    }
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group">
      <div className="mt-0.5 p-1.5 rounded-md bg-gray-50 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  if (loading || !newUserData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex items-center gap-4 border-b pb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/new-user")}
          className="rounded-full h-10 w-10 border-gray-200 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
        <h1 className="text-xl font-bold text-gray-800">User Activation</h1>
      </div>

      {/* Profile Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* Column 1: Image */}
        <div className="flex justify-center md:justify-start">
          <div className="relative group">
            <div className="relative h-32 w-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl">
              <img
                src={
                  newUserData.image
                    ? `https://businessboosters.club/public/images/user_images/${newUserData.image}`
                    : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                }
                alt={newUserData.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                onClick={() => setOpenImageDialog(true)}
              >
                <ImageIcon className="h-8 w-8 text-white animate-in zoom-in duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Name and Info */}
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {newUserData.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full tracking-wider">
              Pending Profile
            </span>
            <span className="text-sm text-muted-foreground font-medium">•</span>
            <span className="text-sm text-muted-foreground font-medium">
              {newUserData.company}
            </span>
          </div>
        </div>

        {/* Column 3: Selection and Activation Section */}
        <div className="flex flex-col gap-3 w-full">
          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-gray-50 border-gray-100 focus:ring-0 hover:bg-gray-50 active:bg-gray-50 shadow-none h-11 rounded-xl flex justify-between items-center px-4 transition-none"
                  disabled={pTypesLoading}
                >
                  <div className="flex gap-1 truncate max-w-[200px]">
                    {selectedPTypes.length > 0 ? (
                      selectedPTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-[10px] h-5 rounded-md px-1 bg-primary/10 text-primary border-none"
                        >
                          {type}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Select Groups
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border-gray-100 shadow-xl"
                align="start"
              >
                <ScrollArea className="h-[200px]">
                  <div className="p-2 space-y-1">
                    {pTypesLoading ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : pTypes.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No types found
                      </div>
                    ) : (
                      pTypes.map((item) => {
                        const typeValue = item.p_type || item.name || item;
                        return (
                          <div
                            key={typeValue}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() => togglePType(typeValue)}
                          >
                            <Checkbox
                              id={`ptype-${typeValue}`}
                              checked={selectedPTypes.includes(typeValue)}
                              onCheckedChange={() => togglePType(typeValue)}
                            />
                            <Label
                              htmlFor={`ptype-${typeValue}`}
                              className="flex-1 text-sm cursor-pointer font-medium"
                            >
                              {typeValue}
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
          >
            {isActivating ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* Basic Contact Info Card */}
        <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden ring-1 ring-gray-100">
          <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <InfoItem icon={Mail} label="Email" value={newUserData.email} />
            <InfoItem icon={Phone} label="Mobile" value={newUserData.mobile} />
            <InfoItem icon={MapPin} label="Area" value={newUserData.area} />
            <div className="flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Referral Code
              </span>
              <span className="text-lg font-black text-primary mt-0.5">
                {newUserData.referral_code || "---"}
              </span>
            </div>
            <InfoItem
              icon={UserIcon}
              label="Gender"
              value={newUserData.gender}
            />
            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={newUserData.dob}
            />
            <InfoItem
              icon={UserIcon}
              label="Spouse Name"
              value={newUserData.spouse_name}
            />
            <InfoItem
              icon={Calendar}
              label="Anniversary"
              value={newUserData.doa}
            />
            <InfoItem
              icon={Briefcase}
              label="Company Short Name"
              value={newUserData.company_short}
            />
            <InfoItem
              icon={Globe}
              label="Website"
              value={newUserData.website}
            />
            <InfoItem
              icon={Briefcase}
              label="Category"
              value={newUserData.category}
            />
            <InfoItem
              icon={Calendar}
              label="Years of Experience"
              value={newUserData.experience}
            />
            <InfoItem
              icon={CheckCircle2}
              label="Products/Services"
              value={newUserData.product}
            />
            <InfoItem
              icon={Phone}
              label="WhatsApp Number"
              value={newUserData.whatsapp_number}
            />
            <InfoItem
              icon={Phone}
              label="Landline"
              value={newUserData.landline}
            />
            <InfoItem
              icon={MapPin}
              label="Full Address"
              value={newUserData.address}
            />
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none rounded-3xl ring-1 ring-white/10">
          <DialogHeader className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenImageDialog(false)}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 backdrop-blur-md"
            >
              <X className="h-6 w-6" />
            </Button>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[50vh] p-4">
            <img
              src={
                newUserData.image
                  ? `https://businessboosters.club/public/images/user_images/${newUserData.image}`
                  : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
              }
              alt={newUserData.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <div className="bg-black/50 backdrop-blur-xl p-6 text-center border-t border-white/5">
            <p className="text-lg font-bold text-white tracking-tight">
              {newUserData.name}
            </p>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              {newUserData.company}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewUserView;
