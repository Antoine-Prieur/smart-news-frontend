import React from "react";
import Menuitems from "./MenuItems";
import { Box, useTheme, styled } from "@mui/material";
import {
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";
import Logo from "../shared/logo/Logo";

const renderMenuItems = (items: any, pathDirect: any) => {
  return items.map((item: any) => {
    const Icon = item.icon ? item.icon : IconPoint;

    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      // Display Subheader
      return <Menu subHeading={item.subheader} key={item.subheader} />;
    }

    //If the item has children (submenu)
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius="7px"
        >
          {renderMenuItems(item.children, pathDirect)}
        </Submenu>
      );
    }

    // If the item has no children, render a MenuItem
    return (
      <Box px={3} key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius="8px"
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem>
      </Box>
    );
  });
};

// Styled wrapper for the sidebar to apply custom background
const SidebarWrapper = styled(Box)(({ theme }) => ({
  height: "100%",
  // Apply your beautiful pastel background
  backgroundColor: theme.palette.background.default, // #fcf8f7
  // Add some subtle styling
  borderRight: `1px solid ${theme.palette.divider}`, // #e5d5cd

  // Override the react-mui-sidebar default styles
  "& .MuiBox-root": {
    backgroundColor: "transparent !important",
  },

  // Style the sidebar content
  "& .sidebar-content": {
    backgroundColor: "transparent",
  },

  // Ensure menu items have proper hover effects with your theme
  "& .menu-item:hover": {
    backgroundColor: theme.palette.action.hover, // #f6f1ee
  },

  // Style selected menu items
  "& .menu-item.selected": {
    backgroundColor: `${theme.palette.primary.light}15`, // Light blue with opacity
    borderLeft: `3px solid ${theme.palette.primary.main}`,
  },
}));

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;

  // Get theme colors
  const theme = useTheme();

  return (
    <SidebarWrapper>
      <MUI_Sidebar
        width={"100%"}
        showProfile={false}
        themeColor={theme.palette.primary.main} // ← Your Delft Blue
        themeSecondaryColor={theme.palette.secondary.main} // ← Your Peach
        // Additional props to try to control background
        backgroundColor={theme.palette.background.default}
        style={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Logo />

        {renderMenuItems(Menuitems, pathDirect)}
      </MUI_Sidebar>
    </SidebarWrapper>
  );
};

export default SidebarItems;
