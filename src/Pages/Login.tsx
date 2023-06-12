import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Icon, Theme, Typography } from "@mui/material";
import { WALLETS_NAME } from "../utils/enum";
import { CustomButton } from "../components/CustomButton";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  outerContainer: { padding: "1rem", border: "1px solid #FF0011", borderRadius: "0.5rem", justifyContent: "center", alignItems: "center" },
  innerContainer: { justifyContent: "center", alignItems: "center" },
  icon: { width: "60% !important", height: "60% !important" },
  typography: { color: "#FFFAF0", borderBottom: "1px solid #FF0011" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const connect = () => {
    const CasperWalletProvider = window.CasperWalletProvider;

    const provider = CasperWalletProvider();

    provider.requestConnection().then(() => {
      navigate("/");
    });
  };

  return (
    <Grid container className={classes.outerContainer}>
      <Grid container direction="row" className={classes.innerContainer}>
        <Typography variant="h6" className={classes.typography}>
          {WALLETS_NAME.CASPER_WALLET}
        </Typography>
        <Icon className={classes.icon}>
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M3.47826 5C1.55727 5 0 6.53229 0 8.42246V30.6685C0 32.5586 1.55727 34.0909 3.47826 34.0909H36.5217C38.4427 34.0909 40 32.5586 40 30.6685V8.42246C40 6.53229 38.4427 5 36.5217 5H3.47826ZM26.4182 8.91186C25.755 8.25933 24.6798 8.25933 24.0166 8.91186L14.4104 18.3639C13.7472 19.0165 13.7473 20.0744 14.4104 20.727L24.0166 30.1791C24.6798 30.8316 25.755 30.8316 26.4182 30.1791L31.8216 24.8623C32.1532 24.536 32.1532 24.007 31.8216 23.6807L29.4201 21.3177C29.0885 20.9915 28.5509 20.9915 28.2193 21.3177L26.118 23.3854C25.6206 23.8748 24.8142 23.8748 24.3168 23.3854L21.3149 20.4316C20.8175 19.9422 20.8175 19.1487 21.3149 18.6593L24.3168 15.7055C24.8142 15.2161 25.6206 15.2161 26.118 15.7055L28.2193 17.7732C28.5509 18.0995 29.0885 18.0995 29.4201 17.7732L31.8216 15.4102C32.1532 15.0839 32.1532 14.5549 31.8216 14.2287L26.4182 8.91186Z"
              fill="#FF0011"
            ></path>
          </svg>
        </Icon>
      </Grid>
      <CustomButton onClick={connect} label="SIGN IN" disabled={false} />
    </Grid>
  );
};

export default Login;
