import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { WALLETS_NAME } from "../utils/enum";
import { CustomButton } from "../components/CustomButton";
import { makeStyles } from "@mui/styles";
import casperImage from "../assets/casper_wallet.png";
import { ClickUI, ThemeModeType, useClickRef } from "@make-software/csprclick-ui";

const useStyles: any = makeStyles((_theme: Theme) => ({
  outerContainer: { padding: "40px 10px 40px 10px", backgroundColor: "#161D3B", borderRadius: "12px", justifyContent: "center", alignItems: "center" },
  innerContainer: { justifyContent: "center", alignItems: "center", gap: "2rem", minWidth: "360px" },
  typography: { color: "#FFFFFF" },
  image: { margin: "1.5rem 0", transition: "background-color 300ms" },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const clickRef = useClickRef();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (clickRef?.getActiveAccount()) {
      navigate("/");
      setLoading(false);
    } else {
      navigate("/login");
      setLoading(false);
    }
  }, [clickRef]);

  useEffect(() => {
    clickRef?.on("csprclick:signed_in", async () => {
      navigate("/");
    });
  }, [clickRef?.on]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Grid container className={classes.outerContainer}>
      <div style={{ display: "flex", flexDirection: "row", width: "100%", margin: "0 auto", padding: "0 12px" }}>
        <ClickUI themeMode={ThemeModeType.dark} show1ClickModal={false} />
      </div>
      <Grid container direction="column" className={classes.innerContainer}>
        <Typography variant="h6" className={classes.typography}>
          {WALLETS_NAME.CASPER_WALLET}
        </Typography>
        <img className={classes.image} width={200} src={casperImage} />
        <CustomButton
          onClick={(event: any) => {
            event.preventDefault();
            window.csprclick.signIn();
          }}
          label="SIGN IN"
          disabled={false}
        />
      </Grid>
    </Grid>
  );
};

export default Login;
