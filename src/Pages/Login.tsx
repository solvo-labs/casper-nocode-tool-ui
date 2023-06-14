import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Theme, Typography } from "@mui/material";
import { WALLETS_NAME } from "../utils/enum";
import { CustomButton } from "../components/CustomButton";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  outerContainer: { padding: "1rem", border: "1px solid #BF000C", borderRadius: "0.5rem", justifyContent: "center", alignItems: "center" },
  innerContainer: { justifyContent: "center", alignItems: "center" },
  typography: { color: "#FFFAF0", borderBottom: "1px solid #BF000C" },
  image: { margin: "1.5rem 0", transition: "background-color 300ms" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const connect = () => {
    //CASPER SIGNER
  };

  return (
    <Grid container className={classes.outerContainer}>
      <Grid container direction="column" className={classes.innerContainer}>
        <Typography variant="h6" className={classes.typography}>
          {WALLETS_NAME.CASPER_SIGNER}
        </Typography>
        <img className={classes.image} src="https://cspr.live/assets/images/casper-signer.png" />
      </Grid>
      <CustomButton onClick={connect} label="SIGN IN" disabled={false} />
    </Grid>
  );
};

export default Login;
