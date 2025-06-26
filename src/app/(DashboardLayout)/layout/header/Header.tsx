import React from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  IconButton,
  Switch,
  FormControlLabel,
  useTheme,
  Tooltip,
} from "@mui/material";
import { IconMenu, IconSun, IconMoon } from "@tabler/icons-react";
import { useThemeContext } from "@/contexts/ThemeContext";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.default,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: "relative",
    zIndex: 1200,
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(3),
    display: "flex",
    alignItems: "center",
  }));

  const ThemeSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase": {
      color: theme.palette.grey[300],
      "&.Mui-checked": {
        color: theme.palette.primary.main,
        "& + .MuiSwitch-track": {
          backgroundColor: theme.palette.primary.light,
          opacity: 0.7,
        },
      },
    },
    "& .MuiSwitch-track": {
      backgroundColor: theme.palette.grey[400],
      opacity: 0.5,
    },
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
            color: theme.palette.text.secondary,
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Box flexGrow={1} />

        <Box
          display="flex"
          alignItems="center"
          sx={{
            gap: 1,
            bgcolor: "transparent",
          }}
        >
          <Tooltip
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <FormControlLabel
              control={
                <ThemeSwitch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  size="small"
                />
              }
              label=""
              sx={{
                margin: 0,
                display: "flex",
                alignItems: "center",
              }}
            />
          </Tooltip>

          <IconButton
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              cursor: "default",
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
            disableRipple
          >
            {isDarkMode ? <IconMoon size={18} /> : <IconSun size={18} />}
          </IconButton>
        </Box>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
