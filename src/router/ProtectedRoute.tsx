import React, { useEffect, useState } from "react";
import { Card, Grid, Theme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import GoogleFontLoader from "react-google-font-loader";
import SideBar from "../components/SideBar";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: "2rem",
    overflow: "scrool",
    [theme.breakpoints.down("md")]: {
      padding: "1rem",
    },
  },
}));

export const ProtectedRoute = () => {
  const classes = useStyles();

  return (
    <div
      style={{
        backgroundColor: "#E7EBF1",
      }}
      className={classes.container}
    >
      <Grid container spacing={2}>
        <Grid item lg={2} md={3}>
          <SideBar />
        </Grid>
        <Grid item lg={10} md={9} xs={12}>
          <Grid container direction={"column"} spacing={2}>
            <Grid item>{/* <DrawerAppBar /> */}</Grid>
            <Grid item sx={{ width: "100%" }}>
              <Card
                sx={{
                  borderRadius: "40px",
                }}
              >
                <div>
                  <Outlet />
                </div>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
