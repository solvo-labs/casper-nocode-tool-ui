import React from "react";
import { Grid, Theme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import TopBar from "../components/TopBar";

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

  return (
    <div className={classes.main}>
      <Grid container spacing={2} className={classes.container}>
        <TopBar />
        <Grid item lg={10} md={9} xs={12}>
          <Grid container direction={"column"} spacing={2}>
            {/* <Grid item><DrawerAppBar /></Grid> */}
            <Outlet />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProtectedRoute;
