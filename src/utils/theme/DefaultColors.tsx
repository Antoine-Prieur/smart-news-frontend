import { createTheme } from "@mui/material/styles";
import { Plus_Jakarta_Sans } from "next/font/google";

export const plus = Plus_Jakarta_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

const baselightTheme = createTheme({
  direction: "ltr",
  palette: {
    primary: {
      main: "#313e5b",      // Delft Blue - sophisticated dark blue
      light: "#4a5e8a",     // From your Tailwind config
      dark: "#1d2536",      // Darker shade
    },
    secondary: {
      main: "#f9be9c",      // Peach - warm, inviting
      light: "#facaae",     // Light peach
      dark: "#e45c0d",      // Deeper peach/orange
    },
    success: {
      main: "#13DEB9",      // Keep existing - works well with your palette
      light: "#E6FFFA",
      dark: "#02b3a9",
      contrastText: "#ffffff",
    },
    info: {
      main: "#f9bb97",      // Second peach variant
      light: "#fac7aa",     // Light version
      dark: "#f4884a",      // Darker version
      contrastText: "#ffffff",
    },
    error: {
      main: "#FA896B",      // Keep existing - complements your palette
      light: "#FDEDE8",
      dark: "#f3704d",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#f9be9c",      // Use your peach for warnings too
      light: "#fde4d7",     // Very light peach
      dark: "#e45c0d",      // Darker peach
      contrastText: "#ffffff",
    },
    grey: {
      100: "#f6f1ee",       // From desert sand light
      200: "#eee3dd",       // Misty rose variations
      300: "#e5d5cd",       // Desert sand tones
      400: "#d4bbac",       // Desert sand main
      500: "#97694e",       // Desert sand dark
      600: "#313e5b",       // Your delft blue
    },
    text: {
      primary: "#313e5b",   // Delft blue for primary text
      secondary: "#97694e", // Desert sand dark for secondary text
    },
    action: {
      disabledBackground: "rgba(212,187,172,0.12)", // Desert sand with opacity
      hoverOpacity: 0.02,
      hover: "#f6f1ee",     // Very light desert sand
    },
    divider: "#e5d5cd",     // Light desert sand
    background: {
      default: "#fcf8f7",   // Very light misty rose
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: plus.style.fontFamily,
    h1: {
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      fontFamily: plus.style.fontFamily,
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontFamily: plus.style.fontFamily,
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: "1.75rem",
      fontFamily: plus.style.fontFamily,
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.3125rem",
      lineHeight: "1.6rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: "1.6rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: "1.2rem",
    },
    button: {
      textTransform: "capitalize",
      fontWeight: 400,
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.334rem",
    },
    body2: {
      fontSize: "0.75rem",
      letterSpacing: "0rem",
      fontWeight: 400,
      lineHeight: "1rem",
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ".MuiPaper-elevation9, .MuiPopover-root .MuiPaper-elevation": {
          boxShadow:
            "rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px !important",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "7px",
        },
      },
    },
  },
});

export { baselightTheme };
