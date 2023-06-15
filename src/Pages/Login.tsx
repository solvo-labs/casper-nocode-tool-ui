import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Theme, Typography } from "@mui/material";
import { WALLETS_NAME } from "../utils/enum";
import { CustomButton } from "../components/CustomButton";
import { makeStyles } from "@mui/styles";
import casperImage from "../assets/casper_wallet.png";

const useStyles = makeStyles((_theme: Theme) => ({
  outerContainer: { padding: "1rem", border: "1px solid #BF000C", borderRadius: "0.5rem", justifyContent: "center", alignItems: "center" },
  innerContainer: { justifyContent: "center", alignItems: "center" },
  typography: { color: "#FFFAF0", borderBottom: "1px solid #BF000C" },
  image: { margin: "1.5rem 0", transition: "background-color 300ms" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const CasperWalletProvider = window.CasperWalletProvider;
        const provider = CasperWalletProvider();

        const isConnected = await provider.isConnected();

        if (isConnected) {
          navigate("/");
        }
      } catch {}
    };

    const timer = setInterval(() => {
      init();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const connect = () => {
    const CasperWalletProvider = window.CasperWalletProvider;
    const provider = CasperWalletProvider();

    provider
      .requestConnection()
      .then(() => {
        navigate("/");
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  return (
    <Grid container className={classes.outerContainer}>
      <Grid container direction="column" className={classes.innerContainer}>
        <Typography variant="h6" className={classes.typography}>
          {WALLETS_NAME.CASPER_WALLET}
        </Typography>
        <img className={classes.image} width={200} src={casperImage} />
      </Grid>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <CustomButton onClick={connect} label="SIGN IN" disabled={false} />
        <br />
        <CustomButton
          onClick={() => {
            window.open("https://chrome.google.com/webstore/detail/casper-wallet/abkahkcbhngaebpcgfmhkoioedceoigp", "_blank");
          }}
          label="INSTALL"
          disabled={false}
        />
      </div>
    </Grid>
  );
};

export default Login;
