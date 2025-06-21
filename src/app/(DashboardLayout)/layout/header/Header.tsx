import React, { useState, useContext } from "react";
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
import Logo from "../shared/logo/Logo";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    // Use the pastel background from your theme
    background: theme.palette.background.default, // This is your #fcf8f7
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    // Add a more visible border at the bottom
    borderBottom: `1px solid ${theme.palette.divider}`, // Slightly thicker border
    position: "relative",
    zIndex: 1200, // Ensure it stays above content
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

  // Styled logo container for header
  const LogoContainer = styled(Box)(({ theme }) => ({
    height: "45px",
    width: "auto",
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(2),
    // Hide logo on mobile when sidebar is available
    [theme.breakpoints.down("lg")]: {
      display: "none",
    },
  }));

  // Custom styled switch to match your theme
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

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Here you would typically call a context method to actually change the theme
    // For now, this is just a visual toggle
    console.log("Theme toggle clicked:", !isDarkMode ? "Dark" : "Light");
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* Logo - always visible on desktop */}
        <LogoContainer>
          <Logo />
        </LogoContainer>

        {/* Mobile menu button */}
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

        {/* Spacer to push content to the right */}
        <Box flexGrow={1} />

        {/* Theme Toggle Switch */}
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
                  onChange={handleThemeToggle}
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

          {/* Theme icon indicator */}
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
