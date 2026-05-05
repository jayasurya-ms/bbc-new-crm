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
  Users2Icon,
  GroupIcon,
  UsersRoundIcon,
  UserSearchIcon,
  UserSquare2Icon,
  Users2,
  UserSearch,
  ClipboardListIcon,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";
import { FaUserClock } from "react-icons/fa";
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
      url: "",
      icon: Monitor,
      items: [
        {
          title: "Active",
          url: "/active-meetings",
          icon: MonitorCheck,
        },
        {
          title: "Inactive",
          url: "/inactive-meetings",
          icon: MonitorX,
        },
      ],
    },

    LEAD: {
      title: "Lead",
      url: "/lead",
      icon: ClipboardList,
    },
    ONETOONE: {
      title: "One To One",
      url: "/one-to-one",
      icon: FaUserClock,
    },
    TEAM: {
      title: "Team",
      url: "/team",
      icon: Users2,
    },
    VISITOR_GUEST: {
      title: "Visitor/Guest",
      url: "/visitor-guest",
      icon: UserSearch,
    },
    BONUS_POINT: {
      title: "Bonus Point",
      url: "/bonus-point",
      icon: Badge,
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
    REPORT: {
      title: "Report",
      url: "#2",
      icon: BarChart3,
      items: [
        {
          title: "Attendance Report",
          url: "/report/attendence-report",
          icon: ClipboardListIcon,
        },
        // {
        //   title: "Component Stock",
        //   url: "/report/componentstock",
        //   icon: Boxes,
        // },
        // {
        //   title: "Purchase Product",
        //   url: "/report/purchaseproduct",
        //   icon: FileDown,
        // },
        // {
        //   title: "Purchase Component",
        //   url: "/report/purchasecomponent",
        //   icon: FileDown,
        // },
        // {
        //   title: "Order",
        //   url: "/report/order",
        //   icon: ClipboardList,
        // },
      ],
    },
    SETTINGS: {
      title: "Settings",
      url: "/settings",
      icon: Cog,
    },
  },
};

const USER_ROLE_PERMISSIONS = {
  1: {
    //admin
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      "USERS",
      "MEETINGS",
      // "LEAD",
      "ONETOONE",
      "TEAM",
      "VISITOR_GUEST",
      "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "REPORT",
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
      // "LEAD",
      "ONETOONE",
      "TEAM",
      "VISITOR_GUEST",
      "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "REPORT",
      "SETTINGS",
    ],
  },

  2: {
    //superadmin
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
      "ONETOONE",
      "TEAM",
      "VISITOR_GUEST",
      "BONUS_POINT",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "REPORT",
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
      "TEAM",
      "VISITOR_GUEST",
      "BONUS_POINT",
      "LEAD",
      "ONETOONE",
      "FEEDBACK",
      "CONTACT",
      "SHARE_USER",
      "DOWNLOAD",
      "REPORT",
      "SETTINGS",
    ],
  },

  3: {
    //user
    navMain: [
      "DASHBOARD",
      "PROFILE",
      // "ABOUT_US",
      // "MISSION_AND_VISSION",
      // "PORTFOLIO",
      // "ENQUIRY",
      // "USERS",
      // "MEETINGS",
      // "LEAD",
      // "ONETOONE",
      // "TEAM",
      // "VISITOR_GUEST",
      // "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      // "SHARE_USER",
      // "DOWNLOAD",
      // "REPORT",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      // "ABOUT_US",
      // "MISSION_AND_VISSION",
      // "PORTFOLIO",
      // "ENQUIRY",
      // "USERS",
      // "MEETINGS",
      // "LEAD",
      // "ONETOONE",
      // "TEAM",
      // "VISITOR_GUEST",
      // "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      // "SHARE_USER",
      // "DOWNLOAD",
      // "REPORT",
      "SETTINGS",
    ],
  },

  4: {
    //userType1
    navMain: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      // "USERS",
      // "MEETINGS",
      // "LEAD",
      // "ONETOONE",
      // "TEAM",
      // "VISITOR_GUEST",
      // "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      // "SHARE_USER",
      // "DOWNLOAD",
      // "REPORT",
      "SETTINGS",
    ],
    navMainReport: [
      "DASHBOARD",
      "PROFILE",
      "ABOUT_US",
      "MISSION_AND_VISSION",
      "PORTFOLIO",
      "ENQUIRY",
      // "USERS",
      // "MEETINGS",
      // "LEAD",
      // "ONETOONE",
      // "TEAM",
      // "VISITOR_GUEST",
      // "BONUS_POINT",
      // "FEEDBACK",
      // "CONTACT",
      // "SHARE_USER",
      // "DOWNLOAD",
      // "REPORT",
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

const ADMIN_TYPE_MAP = {
  admin: 1,
  superadmin: 2,
  user: 3,
  usertype1: 4,
};

const useNavigationData = (userTypeKey) => {
  return useMemo(() => {
    const permissions =
      USER_ROLE_PERMISSIONS[userTypeKey] || USER_ROLE_PERMISSIONS[1];

    const buildNavItems = (permissionKeys, config) => {
      if (!permissionKeys) return [];
      return permissionKeys
        .map((key) => {
          if (key === "MASTER_SETTINGS_LIMITED") {
            return LIMITED_MASTER_SETTINGS;
          }
          return config[key];
        })
        .filter(Boolean);
    };

    const navMain = buildNavItems(permissions.navMain, {
      ...NAVIGATION_CONFIG.COMMON,
    });

    const navMainReport = buildNavItems(permissions.navMainReport, {
      ...NAVIGATION_CONFIG.COMMON,
    });

    return { navMain, navMainReport };
  }, [userTypeKey]);
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
  const userTypeKey = ADMIN_TYPE_MAP[user?.admin_type] || 1;
  const { navMain, navMainReport } = useNavigationData(userTypeKey);
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
