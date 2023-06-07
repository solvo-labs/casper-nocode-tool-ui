import React from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import { APP_NAME, PAGES_NAME } from "../utils/enum";
import { Card, Divider, Grid, List, ListItemButton, Stack, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    backgroundColor: "#0F1429 !important",
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
    height: "92vh",
    color: "white",
    padding: "10px",
    borderRadius: "1rem !important",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      visible: "none",
      display: "none",
    },
  },
  divider: {
    backgroundColor: "white",
    color: "white",
    margin: "0.5rem !important",
  },
  title: {
    color: "white ",
    marginBottom: "0.5rem",
    marginLeft: "0.5rem",
    fontSize: "14px",
  },
  item: {
    color: "white",
    textDecoration: "none",
    fontFamily: "Signika Negative",
    paddingLeft: "0.5rem !important",
    paddingTop: "0.25rem !important",
    paddingBottom: "0.25rem !important",
    "&:hover": {
      backgroundColor: "#91b1cc !important",
      cursor: "pointer",
    },
  },
  selectedItem: {
    color: "white",
    textDecoration: "none",
    fontFamily: "Signika Negative",
    paddingLeft: "0.5rem !important",
    backgroundColor: "#A2C5E3 !important",
    paddingTop: "0.25rem !important",
    paddingBottom: "0.25rem !important",
    "&:hover": {
      cursor: "pointer",
    },
  },
  icon: {
    position: "relative",
    top: "0.2rem",
    marginRight: "0.8rem",
    color: "white",
  },
  titleStack: {
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  menuStack: {
    color: "white",
  },
  link: {
    textDecoration: "none",
    color: "white",
  },
}));

const Sidebar: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  return (
    <Card className={classes.card}>
      <Stack className={classes.titleStack}>
        <Typography
          style={{
            fontWeight: "bold",
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          {APP_NAME.CASPER}
        </Typography>
      </Stack>
      <Stack className={classes.menuStack}>
        <List>
          <Divider className={classes.divider}></Divider>
          <Stack className={classes.title}>
            <Typography> {PAGES_NAME.STAKING} </Typography>
          </Stack>
          <Divider className={classes.divider}></Divider>
          <Stack className={classes.title}>
            <Typography> {PAGES_NAME.DAO} </Typography>
          </Stack>
          <Divider className={classes.divider}></Divider>
          <Stack className={classes.title}>
            <Typography> {PAGES_NAME.TOKEN} </Typography>
          </Stack>

          <ListItemButton
            key={PAGES_NAME.TOKEN_MINT}
            onClick={() => {
              navigate("/token");
            }}
          >
            <Grid item>
              <ViewHeadlineIcon className={classes.icon} />
            </Grid>
            <Typography textAlign="center">{PAGES_NAME.TOKEN_MINT}</Typography>
          </ListItemButton>

          <Divider className={classes.divider}></Divider>
          <Stack className={classes.title}>
            <Typography> {PAGES_NAME.NFT} </Typography>
          </Stack>
        </List>
        <Stack sx={{ margin: "0.5rem" }}>{/* <Logout /> */}</Stack>
      </Stack>
    </Card>
  );
};

export default Sidebar;
