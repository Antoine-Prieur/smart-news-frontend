import React from "react";
import Menuitems from "./MenuItems";
import { Box, useTheme } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from '@tabler/icons-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upgrade } from "./Updrade";


const renderMenuItems = (items: any, pathDirect: any) => {

  return items.map((item: any) => {

    const Icon = item.icon ? item.icon : IconPoint;

    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      // Display Subheader
      return (
        <Menu
          subHeading={item.subheader}
          key={item.subheader}
        />
      );
    }

    //If the item has children (submenu)
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius='7px'
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
          borderRadius='8px'
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem >
      </Box>

    );
  });
};


const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  
  // Get theme colors
  const theme = useTheme();

  return (
    < >
      <MUI_Sidebar 
        width={"100%"} 
        showProfile={false} 
        themeColor={theme.palette.primary.main}           // ← Your new Delft Blue
        themeSecondaryColor={theme.palette.secondary.main} // ← Your new Peach
      >

        {/* <Logo img='/images/logos/dark-logo.svg' component={Link} to="/" >Modernize</Logo> */}

        {renderMenuItems(Menuitems, pathDirect)}
      </MUI_Sidebar>

    </>
  );
};
export default SidebarItems;
