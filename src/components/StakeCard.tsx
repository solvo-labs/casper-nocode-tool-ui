import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActions, CardContent, Chip, Grid, Stack, Theme, Typography } from "@mui/material";
import { PERIOD } from "../utils/enum";
import { CustomButton } from "./CustomButton";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    minWidth: "800px",
    [theme.breakpoints.down("lg")]: {
      maxHeight: "260px",
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
          <Typography variant="h5">
            {stake.name} ({stake.symbol}) Stake Pool
          </Typography>
          <Grid gap={1} display={"flex"}>
            {!stake.notified && <Chip size="small" label="Waiting Notify Reward" color="error" />}
            {stake.notified && <Chip size="small" label="Notify Reward Complated" color="info" />}
            {Date.now() < stake.depositEndTime._i && Date.now() > stake.depositStartTime._i && <Chip size="small" label="Active" color="success" />}
            {Date.now() > stake.depositEndTime._i && <Chip size="small" label="Deposit Time Ended" color="warning" />}
          </Grid>
        </Grid>
        <Grid container direction={"row"} justifyContent={"space-between"} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
          <Grid item>
            <Typography variant="body1">Pool Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Token: {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Liquidity: {stake.totalSupply} {stake.symbol}
            </Typography>
            {/* {stake.my_balance > 0 && (
              <Typography variant="body2" color="text.secondary">
                My Stake Amount: {stake.my_balance}
              </Typography>
            )} */}
            <Typography variant="body2" color="text.secondary">
              APR: {stake.fixedApr > 0 ? "Fixed: " + stake.fixedApr + "%" : "Min: " + stake.minApr + "%" + " - Max: " + stake.maxApr + "%"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Capacity: {stake.maxCap} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Min Stake: {stake.minStake} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Max Stake: {stake.maxStake} {stake.symbol}
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
              {/* // Notify */}
              {!stake.notified && stake.amIOwner && (
                <>
                  <CustomButton
                    onClick={() => {
                      stakeModal({ show: true, action: "notify reward", amount: 0, selectedPool: stake });
                      toastr.warning("Before Notify Reward, you need to provide an allowance.");
                    }}
                    label={"Notify Reward"}
                    disabled={stake.depositEndTime < Date.now()}
                  />
                </>
              )}
              {/* Claim & Unstake */}
              {/* TODO check balance */}
              {stake.lockPeriod + stake.depositEndTime <= Date.now() && (
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
              {/* Stake */}
              {stake.depositEndTime > Date.now() && (
                <>
                  <CustomButton
                    onClick={() => {
                      stakeModal({ show: true, action: "stake", amount: 0, selectedPool: stake });
                      toastr.warning("Before staking, you need to provide an allowance.");
                    }}
                    label={stake.depositStartTime > Date.now() ? "Wait For Stake" : "Stake"}
                    disabled={stake.depositStartTime > Date.now()}
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
