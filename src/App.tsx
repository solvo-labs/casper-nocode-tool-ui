// @ts-ignore
import React, { useEffect } from "react";
import Router from "./router/Router";
import { ThemeProvider } from "@mui/styles";
import { createTheme } from "@mui/material";
import { ThemeProvider as XThemeProvider } from "styled-components";
import { CsprClickInitOptions } from "@make-software/csprclick-core-client";
import { ClickProvider, CsprClickThemes } from "@make-software/csprclick-ui";

const clickOptions: CsprClickInitOptions = {
  appName: "Casper dApp",
  appId: "csprclick-template",
  contentMode: "IFRAME",
  providers: ["casper-wallet", "casperdash", "ledger", "casper-signer"],
};

const App = () => {
  const theme = createTheme({});

  return (
    <ClickProvider options={clickOptions}>
      <ThemeProvider theme={theme}>
        <XThemeProvider theme={{ ...CsprClickThemes.dark }}>
          <Router />
        </XThemeProvider>
      </ThemeProvider>
    </ClickProvider>
  );
};

export default App;
