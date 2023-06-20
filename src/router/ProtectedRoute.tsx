import React, { useEffect, useState } from "react";
import { Grid, Theme, LinearProgress } from "@mui/material";
import { Outlet, Navigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import TopBar from "../components/TopBar";
import { fetchContract } from "../utils";

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.down("md")]: {
      padding: "1rem",
    },
  },
  container: {
    color: "#FFFFFF",
    justifyContent: "center",
  },
}));

const ProtectedRoute: React.FC = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [provider, setProvider] = useState<any>();
  const [wasm, setWasm] = useState<any>();

  useEffect(() => {
    const init = async () => {
      try {
        const CasperWalletProvider = window.CasperWalletProvider;
        const provider = CasperWalletProvider();

        const isConnected = await provider.isConnected();

        const activePublicKey = await provider.getActivePublicKey();

        const wasm1 = await fetchContract("../assets/cep18.wasm");

        setWasm(wasm1);
        setProvider(provider);
        setPublicKey(activePublicKey);
        setConnected(isConnected);
        setLoading(false);
      } catch {
        setConnected(false);
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LinearProgress color="inherit" style={{ width: "80%" }} />
      </div>
    );
  }

  return connected ? (
    <div className={classes.main}>
      <Grid container spacing={2} className={classes.container}>
        <TopBar publicKey={publicKey} />
        <Grid item lg={10} md={12} xs={12}>
          <Grid container direction={"column"} spacing={2}>
            {/* <Grid item><DrawerAppBar /></Grid> */}
            <Outlet context={[publicKey, provider, wasm]} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
