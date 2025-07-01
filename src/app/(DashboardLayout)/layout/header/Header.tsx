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
  Typography,
  alpha,
} from "@mui/material";
import { IconMenu, IconSun, IconMoon, IconGlobe } from "@tabler/icons-react";
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
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  }));

  const SloganContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    borderRadius: theme.spacing(3),
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease-in-out",
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    "&:hover": {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary.main, 0.12)})`,
      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      transform: "translateX(-50%) translateY(-1px)",
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    [theme.breakpoints.down("sm")]: {
      position: "static",
      transform: "none",
      width: "100%",
      justifyContent: "center",
      marginTop: theme.spacing(1),
      "&:hover": {
        transform: "translateY(-1px)",
      },
    },
  }));

  const SloganText = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    textAlign: "center",
    letterSpacing: "0.025em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  }));

  const ControlsContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginLeft: "auto",
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

        <SloganContainer>
          <IconGlobe
            size={16}
            style={{
              color: theme.palette.primary.main,
              opacity: 0.8,
            }}
          />
          <SloganText variant="body2">
            Because watching the news should not kill your mood
          </SloganText>
        </SloganContainer>

        <ControlsContainer>
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
        </ControlsContainer>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
