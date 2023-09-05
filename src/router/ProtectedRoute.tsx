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
  const [nftWasm, setNftWasm] = useState<any>();
  const [collectionWasm, setCollectionWasm] = useState<any>();

  useEffect(() => {
    const init = async () => {
      try {
        const CasperWalletProvider = window.CasperWalletProvider;
        const provider = CasperWalletProvider();

        const isConnected = await provider.isConnected();

        const activePublicKey = await provider.getActivePublicKey();

        const wasm1 = await fetchContract("/cep18.wasm");
        const wasm2 = await fetchContract("/cep47.wasm");
        const colWasm = await fetchContract("/cep78.wasm")

        setWasm(wasm1);
        setNftWasm(wasm2);
        setCollectionWasm(colWasm);
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
      <Grid container spacing={0} className={classes.container} alignContent={"start"}>
        <TopBar publicKey={publicKey} />
        <Grid item lg={12} md={12} xs={12} height={"100vh"} paddingTop={{xl:"12rem", md:"12rem", sm:"10rem", xs: "8rem"}}>
          <Grid container direction={"column"}  spacing={0}>
            {/* <Grid item><DrawerAppBar /></Grid> */}
            <Outlet context={[publicKey, provider, wasm, nftWasm, collectionWasm]} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
