import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActions, CardContent, Chip, Grid, Stack, Theme, Typography } from "@mui/material";
import { PERIOD } from "../utils/enum";
import { CustomButton } from "./CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    minWidth: "800px",
    margin: "1rem",
    [theme.breakpoints.down("lg")]: {
      maxHeight: "240px",
      minWidth: "720px",
    },
  },
  title: {
    borderBottom: "1px solid #FF0011 !important",
    marginBottom: "1rem !important",
  },
}));

type Props = {
  stake: any;
  stakeModal: (stake: any) => void;
};

const StakeCard: React.FC<Props> = ({ stake, stakeModal }) => {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid item className={classes.title} style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h5">{stake.name} Stake Pool</Typography>
          <Chip size="small" label="ON GOING" color="success" />
        </Grid>
        <Grid container direction={"row"} justifyContent={"space-between"} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
          <Grid item>
            <Typography variant="body1">Pool Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Token: {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Liquidity: {stake.totalSupply}
            </Typography>
            {stake.my_balance > 0 && (
              <Typography variant="body2" color="text.secondary">
                My Stake Amount: {stake.my_balance}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              APR: {stake.fixedApr > 0 ? "Fixed: " + stake.fixedApr + "%" : "Min: " + stake.minApr + "%" + " - Max: " + stake.maxApr + "%"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Capacity: {stake.maxCap}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Min Stake: {stake.minStake}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Max Stake: {stake.maxStake}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lock Period: {PERIOD[stake.lockPeriod._i]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stake.depositStartTimeFormatted} - {stake.depositEndTimeFormatted}
            </Typography>
          </Grid>
          <Grid item display={"flex"}>
            <Stack spacing={2} justifyContent={"flex-end"}>
              {stake.depositEndTime > Date.now() && (
                <>
                  <CustomButton
                    onClick={() => {
                      stakeModal({ show: true, action: "stake", amount: 0, selectedPool: stake });
                      toastr.warning("Before staking, you need to provide an allowance.");
                    }}
                    label={stake.depositStartTime > Date.now() ? "Waiting For Start Deposit" : "Stake"}
                    disabled={stake.depositStartTime > Date.now()}
                  />
                </>
              )}
              {stake.lockPeriod + stake.depositEndTime >= Date.now() && stake.depositStartTime <= Date.now() && (
                <CustomButton
                  onClick={() => {
                    stakeModal({ show: true, action: "unstake", amount: 0, selectedPool: stake });
                  }}
                  label={"This is lock period"}
                  disabled={true}
                />
              )}
              {stake.lockPeriod + stake.depositEndTime <= Date.now() && stake.my_balance > 0 && stake.my_balance > 0 && (
                <>
                  <CustomButton
                    onClick={() => {
                      stakeModal({ show: true, action: "unstake", amount: 0, selectedPool: stake });
                    }}
                    label={"UnStake"}
                    disabled={false}
                  />
                  <CustomButton
                    onClick={() => {
                      stakeModal({ show: true, action: "claim", amount: 0, selectedPool: stake });
                    }}
                    label={"Claim"}
                    disabled={false}
                  />
                </>
              )}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions style={{ justifyContent: "center" }}></CardActions>
    </Card>
  );
};

export default StakeCard;