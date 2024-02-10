import React from "react";
import { Card, CardContent, Divider, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import casperWalletIcon from "../assets/casper-wallet-icon.svg";
import { makeStyles } from "@mui/styles";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import casperLogo from "../assets/cspr_logo.svg";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  walletPublicKey: {
    color: "white",
    fontFamily: "monospace !important",
    fontSize: "0.9rem !important",
  },
  title: {
    color: "white",
    fontWeight: "bold !important",
    fontSize: "1.2rem !important",
  },
  titleGray: {
    fontSize: "18px !important",
    fontWeight: "700 !important",
    fontFamily: "monospace !important",
    color: "#A9A9A9",
  },
  titleMonospace: {
    fontSize: "1.2rem !important",
    fontWeight: "700 !important",
    fontFamily: "monospace !important",
    color: "#fff !important",
  },
  copyIcon: {
    color: "white !important",
    "&:focus": {
      outline: "none !important",
    },
  },
}));

type Props = {
  publicKey: string;
  casperBalance: number;
  CSPRPrice: number;
  tooltip: boolean;
  handleClick: () => void;
};

const WalletCard: React.FC<Props> = ({ publicKey, casperBalance, CSPRPrice, tooltip, handleClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container display={"flex"} direction={"column"}>
          <Grid container display={"flex"} justifyContent={"space-between"}>
            <img style={{ width: "125px" }} src={casperWalletIcon} alt="casper wallet icon" />
            <Grid item>
              <Grid container direction={"row"} alignItems={"center"} gap={1}>
                <Typography className={classes.walletPublicKey}>{publicKey.slice(0, 5) + "..." + publicKey.slice(-5)}</Typography>
                <Tooltip
                  open={tooltip}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  title="Copied"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        marginTop: "0px !important",
                        borderRadius: "10px",
                        bgcolor: "black",
                        color: "white",
                        fontSize: "1rem",
                      },
                    },
                  }}
                >
                  <IconButton onClick={handleClick} aria-label="delete" className={classes.copyIcon}>
                    <ContentCopyIcon style={{ width: "1.2rem", height: "1.2rem" }} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid container display={"flex"} direction={"row"} justifyContent={"space-between"} marginTop={4}>
            <Typography className={classes.title}>Balance:</Typography>
            <Grid item>
              <Typography className={classes.titleMonospace}>{casperBalance.toFixed(2)} CSPR</Typography>
              <Typography className={classes.titleMonospace}>$ {(CSPRPrice * casperBalance).toFixed(2)}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ backgroundColor: "gray !important", marginBottom: "20px !important", marginTop: "40px !important" }}></Divider>
          <Grid container display={"flex"} direction={"row"} gap={2} alignItems={"center"}>
            <img src={casperLogo} alt="casper logo" />
            <Grid item display={"flex"} flexDirection={"row"} gap={1} alignItems={"baseline"}>
              <Typography className={classes.title}>Casper</Typography>
              <Typography className={classes.titleGray}>CSPR</Typography>
            </Grid>
          </Grid>
          <Grid container display={"flex"} justifyContent={"space-between"} marginTop={4}>
            <Typography className={classes.title}>CSPR/USD:</Typography>
            <Typography className={classes.titleMonospace}>$ {CSPRPrice.toFixed(5)}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
