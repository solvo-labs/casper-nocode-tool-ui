import React, { useEffect, useState } from "react";
import { Grid, Theme, LinearProgress } from "@mui/material";
import { Outlet, Navigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import TopBar from "../components/TopBar";
import { delay, fetchContract } from "../utils";

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
  const [cep18Wasm, setCep18Wasm] = useState<ArrayBuffer>();
  const [cep78Wasm, setCep78Wasm] = useState<ArrayBuffer>();
  const [marketplaceWasm, setMarketplaceWasm] = useState<ArrayBuffer>();
  const [vestingWasm, setVestingWasm] = useState<ArrayBuffer>();
  const [executeListingWasm, setExecuteListingWasm] = useState<ArrayBuffer>();
  const [raffleWasm, setRaffleWasm] = useState<ArrayBuffer>();
  const [buyTicketWasm, setBuyTicketWasm] = useState<ArrayBuffer>();
  const [lootboxWasm, setLootboxWasm] = useState<ArrayBuffer>();
  const [lootboxDepositWasm, setLootboxDepositWasm] = useState<ArrayBuffer>();
  const [timeableNftDepositWasm, setTimeableNftDepositWasm] = useState<ArrayBuffer>();

  useEffect(() => {
    const init = async () => {
      try {
        await delay(100);
        const CasperWalletProvider = window.CasperWalletProvider;
        const provider = CasperWalletProvider();
        const isConnected = await provider.isConnected();

        if (isConnected) {
          const activePublicKey = await provider.getActivePublicKey();

          const cep18_contract = await fetchContract("/cep18.wasm");
          const cep78_contract = await fetchContract("/cep78.wasm");
          const marketplace_contract = await fetchContract("/marketplace.wasm");
          const vesting_contract = await fetchContract("/vesting.wasm");
          const execute_listing_contract = await fetchContract("/execute_listing_call.wasm");
          const raffle_contract = await fetchContract("/raffle.wasm");
          const buy_ticket_contract = await fetchContract("/raffle_deposit.wasm");
          const lootbox_contract = await fetchContract("/lootbox.wasm");
          const lootbox_deposit_contract = await fetchContract("/lootbox_deposit_contract.wasm");
          const timeable_nft_deposit_contract = await fetchContract("/timeable_nft_deposit.wasm");

          setCep18Wasm(cep18_contract);
          setCep78Wasm(cep78_contract);
          setMarketplaceWasm(marketplace_contract);
          setVestingWasm(vesting_contract);
          setExecuteListingWasm(execute_listing_contract);
          setRaffleWasm(raffle_contract);
          setBuyTicketWasm(buy_ticket_contract);
          setLootboxWasm(lootbox_contract);
          setLootboxDepositWasm(lootbox_deposit_contract);
          setTimeableNftDepositWasm(timeable_nft_deposit_contract);

          setProvider(provider);
          setPublicKey(activePublicKey);
          setConnected(isConnected);
        }

        setLoading(false);
      } catch {
        setConnected(false);
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const handleConnected = () => {
      setConnected(false);
    };

    window.addEventListener("casper-wallet:activeKeyChanged", handleConnected);

    return () => {
      window.removeEventListener("casper-wallet:activeKeyChanged", handleConnected);
    };
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
        <Grid item lg={12} md={12} xs={12} height={"100vh"} paddingTop={{ xl: "12rem", lg: "12rem", md: "10rem", sm: "8rem", xs: "8rem" }}>
          <Grid container direction={"column"} spacing={0}>
            {/* <Grid item><DrawerAppBar /></Grid> */}
            <Outlet
              context={[
                publicKey,
                provider,
                cep18Wasm,
                cep78Wasm,
                marketplaceWasm,
                vestingWasm,
                executeListingWasm,
                raffleWasm,
                buyTicketWasm,
                lootboxWasm,
                lootboxDepositWasm,
                timeableNftDepositWasm,
              ]}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoute;
