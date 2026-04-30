import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const itemVariants = {
  open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
  closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
};

export function NavMain({ items, openItem, setOpenItem }) {
  const location = useLocation();

  const handleLinkClick = (e) => {
    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sessionStorage.setItem("sidebarScrollPosition", sidebarContent.scrollTop);
    }
  };

  React.useEffect(() => {
    const sidebarContent = document.querySelector(".sidebar-content");
    const scrollPosition = sessionStorage.getItem("sidebarScrollPosition");

    if (sidebarContent && scrollPosition) {
      sidebarContent.scrollTop = parseInt(scrollPosition);
    }

    // Automatically open the parent menu if a child is active
    if (items && setOpenItem) {
      const activeParent = items.find((item) => {
        if (!item.items || item.items.length === 0) return false;
        return item.items.some((sub) =>
          sub.items?.length
            ? sub.items.some((deepSub) => deepSub.url === location.pathname)
            : sub.url === location.pathname
        );
      });
      
      if (activeParent) {
        setOpenItem(activeParent.title);
      } else {
        setOpenItem(null); // Close dropdowns if navigating to top-level links
      }
    }
  }, [location.pathname, items, setOpenItem]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Home</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const renderItem = (item, depth = 0) => {
            const hasSubItems = item.items && item.items.length > 0;
            const isItemActive = location.pathname === item.url;
            const isParentActive = hasSubItems
              ? item.items.some((sub) =>
                  sub.items?.length
                    ? sub.items.some(
                        (deepSub) => deepSub.url === location.pathname,
                      )
                    : sub.url === location.pathname,
                )
              : isItemActive;

            if (!hasSubItems) {
              return (
                <SidebarMenuItem key={item.title}>
                  <Link to={item.url} onClick={handleLinkClick}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={`
          transition-colors
          ${isItemActive ? "bg-blue-600 text-white font-medium" : "hover:bg-primary/5"}
        `}
                      >
                        {" "}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </motion.div>
                  </Link>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible
                key={item.title}
                asChild
                open={openItem === item.title}
                onOpenChange={(isOpen) => {
                  if (isOpen) {
                    setOpenItem(item.title);
                  } else {
                    setOpenItem(null);
                  }
                }}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={`
          transition-colors
          ${isItemActive ? "bg-blue-500/10 text-blue-600 font-medium" : isParentActive ? "text-blue-600" : "hover:bg-primary/5"}
        `}
                      >
                        {" "}
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </motion.div>
                  </CollapsibleTrigger>
                  <CollapsibleContent
                    as={motion.div}
                    variants={itemVariants}
                    initial="closed"
                    animate={openItem === item.title ? "open" : "closed"}
                  >
                    <SidebarMenuSub
                      className={`border-l border-primary pl-${depth + 2}`}
                    >
                      {item.items.map((sub) => renderItem(sub, depth + 1))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          };

          return renderItem(item);
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
