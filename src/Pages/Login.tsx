import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { WALLETS_NAME } from "../utils/enum";
import { CustomButton } from "../components/CustomButton";
import { makeStyles } from "@mui/styles";
import casperImage from "../assets/casper_wallet.png";
import { ClickUI, ThemeModeType, useClickRef } from "@make-software/csprclick-ui";
import { AccountType } from "@make-software/csprclick-core-types";

const useStyles = makeStyles((_theme: Theme) => ({
  outerContainer: { padding: "1rem", border: "1px solid #BF000C", borderRadius: "0.5rem", justifyContent: "center", alignItems: "center" },
  innerContainer: { justifyContent: "center", alignItems: "center" },
  typography: { color: "#FFFAF0", borderBottom: "1px solid #BF000C" },
  image: { margin: "1.5rem 0", transition: "background-color 300ms" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const clickRef = useClickRef();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (clickRef) {
      const activeAccount = clickRef.getActiveAccount();

      if (activeAccount) {
        navigate("/");
      }

      setLoading(false);
    }
  }, [clickRef]);

  useEffect(() => {
    clickRef?.on("csprclick:signed_in", async (evt: any) => {
      navigate("/");
    });
  }, [clickRef?.on]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "14rem",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container className={classes.outerContainer}>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", margin: "0 auto", padding: "0 12px" }}>
        <ClickUI themeMode={ThemeModeType.dark} />
      </div>
      <Grid container direction="column" className={classes.innerContainer}>
        <Typography variant="h6" className={classes.typography}>
          {WALLETS_NAME.CASPER_WALLET}
        </Typography>
        <img className={classes.image} width={200} src={casperImage} />
      </Grid>
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          margin: "0 auto",
          padding: "0 12px",
        }}
      >
        <CustomButton
          onClick={(event: any) => {
            event.preventDefault();
            window.csprclick.signIn();
          }}
          label="SIGN IN"
          disabled={false}
        />
      </div>
    </Grid>
  );
};

export default Login;
