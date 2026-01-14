import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    primary: {
      main: "#0884b4",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {},
        containedPrimary: {
          backgroundColor: "#0884b4",
          "&:hover": {
            backgroundColor: "#0884b4",
            opacity: 0.9,
          },
        },
      },
    },
  },
});
