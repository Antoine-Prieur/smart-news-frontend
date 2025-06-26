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
import Logo from "../shared/logo/Logo";

const renderMenuItems = (items: any, pathDirect: any, theme: any) => {
  return items.map((item: any) => {
    const Icon = item.icon ? item.icon : IconPoint;
    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      return <Menu subHeading={item.subheader} key={item.subheader} />;
    }

    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius="7px"
        >
          {renderMenuItems(item.children, pathDirect, theme)}
        </Submenu>
      );
    }

    return (
      <Box px={3} key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius="8px"
          icon={itemIcon}
          link={item.href}
          component={Link}
          // ✅ FIXED: Direct styling on MenuItem
          sx={{
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
            // Better contrast for selected state
            '&.selected, &[aria-selected="true"]': {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(74, 94, 138, 0.25) !important"
                  : "rgba(49, 62, 91, 0.15) !important",
              borderLeft: `4px solid ${theme.palette.primary.main} !important`,
              borderRadius: "0 8px 8px 0 !important",
              color: `${theme.palette.text.primary} !important`,
              fontWeight: "600 !important",
              "& .MuiSvgIcon-root, & svg": {
                color: `${theme.palette.primary.main} !important`,
              },
            },
          }}
        >
          {item.title}
        </MenuItem>
      </Box>
    );
  });
};

// ✅ FIXED: Clean wrapper without unnecessary overrides
const SidebarWrapper = styled(Box)(({ theme }) => ({
  height: "100%",
  backgroundColor: theme.palette.background.default,

  // Target the react-mui-sidebar components directly
  "& .react-mui-sidebar": {
    backgroundColor: "transparent !important",
  },

  // Clean menu styling
  "& .MuiBox-root": {
    backgroundColor: "transparent !important",
  },

  // Logo container styling
  "& .logo-section": {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.default,
  },

  // Menu headers
  "& .menu-subheading": {
    color: `${theme.palette.text.secondary} !important`,
    fontWeight: 500,
    textTransform: "uppercase",
    fontSize: "0.75rem",
    letterSpacing: "0.5px",
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  // borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const theme = useTheme();

  return (
    <SidebarWrapper>
      <LogoSection>
        <Logo />
      </LogoSection>

      <MUI_Sidebar
        width="100%"
        showProfile={false}
        themeColor={theme.palette.primary.main}
        themeSecondaryColor={theme.palette.secondary.main}
        style={{
          backgroundColor: "transparent",
          border: "none",
        }}
      >
        <Box sx={{ backgroundColor: "transparent" }}>
          {renderMenuItems(Menuitems, pathDirect, theme)}
        </Box>
      </MUI_Sidebar>
    </SidebarWrapper>
  );
};

export default SidebarItems;
