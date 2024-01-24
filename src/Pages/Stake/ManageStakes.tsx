import { Box, Card, CardActions, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchErc20TokenDetails, fetchErc20TokenMeta, getAllCep18StakePools } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { STORE_CEP_18_STAKE_CONTRACT } from "../../utils";
import { CustomButton } from "../../components/CustomButton";
import moment from "moment";
import { PERIOD } from "../../utils/enum";

const ManageStakes = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [pools, setPools] = useState<any>([]);

  useEffect(() => {
    const init = async () => {
      const data = await getAllCep18StakePools("hash-" + STORE_CEP_18_STAKE_CONTRACT);

      if (data.length > 0) {
        const tokenDetailPromises = data.map((dt: any) => fetchErc20TokenDetails("hash-" + dt.token));
        const tokenDetails = await Promise.all(tokenDetailPromises);
        const finalData = data.map((dt: any, index: number) => {
          const currentToken = tokenDetails[index];
          const decimal = parseInt(currentToken.decimals.hex, 16);
          const maxApr = parseInt(dt.max_apr.hex, 16);
          const minApr = parseInt(dt.min_apr.hex, 16);
          const fixedApr = parseInt(dt.fixed_apr.hex, 16);
          const minStake = parseInt(dt.min_stake.hex, 16) / Math.pow(10, decimal);
          const maxStake = parseInt(dt.max_stake.hex, 16) / Math.pow(10, decimal);
          const maxCap = parseInt(dt.max_cap.hex, 16) / Math.pow(10, decimal);
          const totalSupply = parseInt(dt.total_supply.hex, 16) / Math.pow(10, decimal);
          const depositEndTime = moment(parseInt(dt.deposit_end_time.hex, 16));
          const depositStartTime = moment(parseInt(dt.deposit_start_time.hex, 16));
          const depositStartTimeFormatted = moment(parseInt(dt.deposit_start_time.hex, 16)).format("MMMM Do YYYY, HH:mm");
          const depositEndTimeFormatted = moment(parseInt(dt.deposit_end_time.hex, 16)).format("MMMM Do YYYY, HH:mm");
          const lockPeriod = moment(parseInt(dt.lock_period.hex, 16));

          return {
            key: dt.key,
            name: currentToken.name,
            symbol: currentToken.symbol,
            depositStartTime,
            depositEndTime,
            maxApr,
            minApr,
            fixedApr,
            minStake,
            maxStake,
            maxCap,
            totalSupply,
            lockPeriod,
            depositEndTimeFormatted,
            depositStartTimeFormatted,
          };
        });
        setPools(finalData);
      }

      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <Typography style={{ borderBottom: "1px solid #FF0011 !important", marginBottom: "1rem", textAlign: "center" }} variant="h5">
        There are no stake pools
      </Typography>
    );
  }
  console.log(pools);
  return (
    <>
      <Typography style={{ borderBottom: "1px solid #FF0011 !important", marginBottom: "1rem", textAlign: "center" }} variant="h5">
        STAKE CEP-18 TOKEN
      </Typography>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {pools.map((pl: any, index: number) => (
          <Card key={index} sx={{ minWidth: 500, flex: "1 0 30%", marginBottom: "16px" }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {pl.name}({pl.symbol}) Stake Pool
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Liquidity : {pl.totalSupply} ({pl.symbol})
              </Typography>

              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {pl.depositStartTimeFormatted} - {pl.depositEndTimeFormatted}
              </Typography>
              <Typography variant="body2">
                APR : {pl.fixedApr > 0 ? "Fixed APR : " + pl.fixedApr + "%" : "Min APR:" + pl.minApr + "%" + " - Max APR: " + pl.maxApr + "%"}
                <br />
                Cap : {pl.cap} ({pl.symbol}) , Min Stake : {pl.minStake} ({pl.symbol}) , Max Stake : {pl.maxStake} ({pl.symbol})
                <br />
                Lock Period : {PERIOD[pl.lockPeriod - pl.depositEndTime]}
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              {pl.depositEndTime > Date.now() ? (
                <CustomButton onClick={() => {}} label="Stake" disabled={false} />
              ) : (
                <CustomButton onClick={() => {}} label="Claim" disabled={false} />
              )}
            </CardActions>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ManageStakes;
