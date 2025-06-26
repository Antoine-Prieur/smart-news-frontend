import { useMediaQuery, Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SidebarItems from "./SidebarItems";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const theme = useTheme();

  const sidebarWidth = "270px";

  // Theme-aware scrollbar styles
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[600]
          : theme.palette.grey[300],
      borderRadius: "15px",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[500]
            : theme.palette.grey[400],
      },
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.grey[800]
          : theme.palette.grey[100],
    },
  };

  // ✅ FIXED: Proper drawer paper styling
  const drawerPaperSx = {
    boxSizing: "border-box",
    width: sidebarWidth,
    backgroundColor: theme.palette.background.default, // Use theme background
    borderRight: `1px solid ${theme.palette.divider}`, // Clean single border
    boxShadow: "none", // Remove any shadow
    ...scrollbarStyles,
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: drawerPaperSx,
            },
          }}
        >
          <SidebarItems />
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            ...drawerPaperSx,
            boxShadow: theme.shadows[8], // Shadow only for mobile overlay
          },
        },
      }}
    >
      <SidebarItems />
    </Drawer>
  );
};

export default MSidebar;
