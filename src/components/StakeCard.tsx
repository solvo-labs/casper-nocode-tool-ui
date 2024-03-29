import React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardActions, CardContent, Chip, Grid, Stack, Theme, Typography } from "@mui/material";
import { PERIOD, STAKE_STATUS } from "../utils/enum";
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
            {stake.status === STAKE_STATUS.WAITING_NOTIFY && <Chip size="small" label="Waiting Notify Reward" color="error" />}
            {stake.status === STAKE_STATUS.WAITING_START_STAKE && <Chip size="small" label="Waiting Start Stake  Period" color="warning" />}
            {stake.status === STAKE_STATUS.STAKEABLE && <Chip size="small" label="Stakable Pool" color="success" />}
            {stake.status === STAKE_STATUS.FAIL && <Chip size="small" label="Fail Pool" color="error" />}
            {stake.status === STAKE_STATUS.WAITING_LOCK_PERIOD && <Chip size="small" label="In Lock Period" color="warning" />}
            {stake.status === STAKE_STATUS.UNSTAKEBLE && <Chip size="small" label="Unstake or Claim your reward" color="warning" />}
            {stake.status === STAKE_STATUS.FINISHED && <Chip size="small" label="Pool Stake process is completed" color="success" />}
            {stake.apr > 0 && <Chip size="small" label={"APR: " + stake.apr + "%"} color="success" />}
          </Grid>
        </Grid>
        <Grid container direction={"row"} justifyContent={"space-between"} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
          <Grid item>
            <Typography variant="body1">Pool Details</Typography>
            <Typography variant="body2" color="text.secondary">
              Token: {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Liquidity: {stake.liquidity} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Reward: {stake.total_reward} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              APR: {stake.fixedApr > 0 ? "Fixed: " + stake.fixedApr + "%" : "Min: " + stake.minApr + "%" + " - Max: " + stake.maxApr + "%"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Capacity: {stake.maxCap} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Min Stake: {stake.minStake} {stake.symbol} - Max Stake: {stake.maxStake} {stake.symbol}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lock Period: {PERIOD[stake.lockPeriod._i]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stake.depositStartTimeFormatted} - {stake.depositEndTimeFormatted}
            </Typography>
          </Grid>
          <Grid item display={"flex"}>
            <Grid container direction={"column"} display={"flex"} justifyContent={"space-between"}>
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  Stake Balance: {stake.my_balance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Claimed Reward: {stake.my_claimed}
                </Typography>
              </Grid>
              <Grid item display={"flex"} justifyContent="flex-end">
                <Stack spacing={1}>
                  {stake.amIOwner && stake.status === STAKE_STATUS.WAITING_NOTIFY && (
                    <>
                      <CustomButton
                        onClick={() => {
                          stakeModal({ show: true, action: "notify", amount: stake.notifyAmount, selectedPool: stake });
                          toastr.warning("Before Notify Reward, you need to provide an allowance.");
                        }}
                        label={"Notify Reward"}
                        disabled={stake.depositEndTime < Date.now()}
                      />
                    </>
                  )}

                  {stake.status === STAKE_STATUS.STAKEABLE && (
                    <>
                      <CustomButton
                        onClick={() => {
                          stakeModal({ show: true, action: "stake", amount: stake.maxStake, selectedPool: stake });
                          toastr.warning("Before staking, you need to provide an allowance.");
                        }}
                        label={"Stake"}
                        disabled={false}
                      />
                    </>
                  )}
                  {stake.status === STAKE_STATUS.UNSTAKEBLE && (
                    <>
                      <CustomButton
                        onClick={() => {
                          stakeModal({ show: true, action: "unstake", amount: stake.my_balance, selectedPool: stake });
                        }}
                        label={"Unstake"}
                        disabled={stake.my_balance <= 0}
                      />
                      <CustomButton
                        onClick={() => {
                          stakeModal({ show: true, action: "claim", amount: 0, selectedPool: stake });
                        }}
                        label={"Claim"}
                        disabled={stake.my_claimed > 0}
                      />
                    </>
                  )}
                  {stake.amIOwner && stake.status > 4 && (
                    <CustomButton
                      onClick={() => {
                        stakeModal({ show: true, action: "refund", amount: 0, selectedPool: stake });
                      }}
                      label={"Refund reward"}
                      disabled={stake.lockPeriod + stake.depositEndTime > Date.now()}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions style={{ justifyContent: "center" }}></CardActions>
    </Card>
  );
};

export default StakeCard;
