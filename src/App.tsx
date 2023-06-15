// @ts-ignore
import React, { useEffect } from "react";
import Router from "./router/Router";
import { ThemeProvider } from "@mui/styles";
import { createTheme } from "@mui/material";
import { fetchNamedKeys } from "./utils/api";

const App = () => {
  const theme = createTheme();

  useEffect(() => {
    const init = async () => {
      const x = await fetchNamedKeys("5e542e3bfacb53152a07322519eedd6f6cad1689508d588051603459b4b12590");

      console.log(x);
    };

    init();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router />
    </ThemeProvider>
  );
};

export default App;
