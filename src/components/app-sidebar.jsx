import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AudioWaveform,
  Command,
  Settings2,
  LayoutDashboard,
  ClipboardList,
  Cog,
  Smartphone,
  User,
  Clipboard,
  Download,
  UsersIcon,
  Info,
  Badge,
  Folder,
  UserPlus,
  UserMinus,
  Monitor,
  MonitorCheck,
  MonitorX,
  BookUser,
  Share2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const NAVIGATION_CONFIG = {
  COMMON: {
    DASHBOARD: {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    PROFILE: {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    ABOUT_US: {
      title: "About Us",
      url: "/about-us",
      icon: Info,
    },
    MISSION_AND_VISSION: {
      title: "Mission & Vission",
      url: "/mission-and-vission",
      icon: Badge,
    },
    PORTFOLIO: {
      title: "Portfolio",
      url: "/portfolio",
      icon: Folder,
    },
    ENQUIRY: {
      title: "Enquiry",
      url: "/enquiry",
      icon: AudioWaveform,
    },
    USERS: {
      title: "Users",
      url: "#",
      icon: UsersIcon,
      items: [
        {
          title: "New User",
          url: "/new-user",
          icon: User,
        },
        {
          title: "Active Users",
          url: "/active-user",
          icon: UserPlus,
        },
        {
          title: "Inactive Users",
          url: "/inactive-user",
          icon: UserMinus,
        },
        {
          title: "Mobile Users",
          url: "/mobile-user",
          icon: Smartphone,
        },
      ],
    },
    MEETINGS: {
      title: "Meetings",
      url: "#1",
      icon: Monitor,
      items: [
        {
          title: "Active",
          url: "/meeting-active",
          icon: MonitorCheck,
        },
        {
          title: "Inactive",
          url: "/meeting-inactive",
          icon: MonitorX,
        },
      ],
    },

    LEAD: {
      title: "Lead",
      url: "/lead",
      icon: ClipboardList,
    },
    FEEDBACK: {
      title: "Feedback",
      url: "/feedback",
      icon: Clipboard,
    },
    CONTACT: {
      title: "Contact",
      url: "/contact",
      icon: BookUser,
    },
    SHARE_USER: {
      title: "Share User",
      url: "/share-user",
      icon: Share2,
    },
    DOWNLOAD: {
      title: "Download",
      url: "/download",
      icon: Download,
    },
    // REPORT: {
    //   title: "Report",
    //   url: "#2",
    //   icon: BarChart3,
    //   items: [
    //     {
    //       title: "Finished Stock",
    //       url: "/report/productstock",
    //       icon: PackageCheck,
    //     },
    //     {
    //       title: "Component Stock",
    //       url: "/report/componentstock",
    //       icon: Boxes,
    //     },
    //     {
    //       title: "Purchase Product",
    //       url: "/report/purchaseproduct",
    //       icon: FileDown,
    //     },
    //     {
    //       title: "Purchase Component",
    //       url: "/report/purchasecomponent",
    //       icon: FileDown,
    //     },
    //     {
    //       title: "Order",
    //       url: "/report/order",
    //       icon: ClipboardList,
    //     },
    //   ],
    // },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Cog,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
  },

  2: {
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
  },

  3: {
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
  },

  4: {
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      "LEAD",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "SETTINGS",
    ],
  },
};

const LIMITED_MASTER_SETTINGS = {
  title: "Master Settings",
  url: "#",
  isActive: false,
  icon: Settings2,
  items: [
    {
      title: "Chapters",
      url: "/master/chapter",
    },
  ],
};

const useNavigationData = (userType) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userType] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config, customItems = {}) => {
      return permissionKeys
        .map((key) => {
          if (key === "MASTER_SETTINGS_LIMITED") {
            return LIMITED_MASTER_SETTINGS;
          }
          return config[key];
        })
        .filter(Boolean);
    };

    const navMain = buildNavItems(
      permissions.navMain,
      // { ...NAVIGATION_CONFIG.COMMON, ...NAVIGATION_CONFIG.MODULES },
      { ...NAVIGATION_CONFIG.COMMON },
      // { MASTER_SETTINGS_LIMITED: LIMITED_MASTER_SETTINGS }
    );

    return { navMain };
  }, [userType]);
};

const Logo = ({ className }) => (
  <img src="/logo.png" alt="Logo" className={className} />
);

const TEAMS_CONFIG = [
  {
    logo: Logo,
  },
];

export function AppSidebar({ ...props }) {
  const [openItem, setOpenItem] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const { navMain, navMainReport } = useNavigationData(user?.user_type);
  const initialData = {
    user: {
      name: user?.name || "User",
      email: user?.email || "user@example.com",
    },
    teams: TEAMS_CONFIG,
    navMain,
    navMainReport,
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        <NavMain
          items={initialData.navMain}
          openItem={openItem}
          setOpenItem={setOpenItem}
        />
        {/* <NavMainReport
          items={initialData.navMainReport}
          openItem={openItem}
          setOpenItem={setOpenItem}
        /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export { NAVIGATION_CONFIG, USER_ROLE_PERMISSIONS };
