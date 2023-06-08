import React from "react";
import { Card, Grid, Theme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import TopBar from "../components/TopBar";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: "2rem",
    [theme.breakpoints.down("md")]: {
      padding: "1rem",
    },
  },
}));

const ProtectedRoute: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Grid container spacing={2}>
        <Grid item lg={2} md={3}>
          <TopBar />
        </Grid>
        <Grid item lg={10} md={9} xs={12}>
          <Grid container direction={"column"} spacing={2} sx={{ color: "white" }}>
            {/* <Grid item><DrawerAppBar /></Grid> */}
            <Outlet />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProtectedRoute;
