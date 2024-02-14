import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { SERVER_API, contractHashToContractPackageHash, fetchErc20TokenDetails, getAllCep18StakePools } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { CasperHelpers, STORE_CEP_18_STAKE_CONTRACT } from "../../utils";
import moment from "moment";
import toastr from "toastr";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import axios from "axios";
import { makeStyles } from "@mui/styles";
import StakeCard from "../../components/StakeCard";
import StakeModal from "../../components/StakeModal";
import { STAKE_STATUS } from "../../utils/enum";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "80vw",
    marginBottom: "2rem",
    justifyContent: "center !important",
    [theme.breakpoints.down("lg")]: {
      maxWidth: "60vw",
    },
  },
  title: {
    borderBottom: "1px solid #FF0011 !important",
    marginBottom: "2rem !important",
    textAlign: "center",
  },
}));

const JoinStakes = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [pools, setPools] = useState<any>([]);
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const [showStakeModal, setShowStakeModal] = useState<{ show: boolean; amount: number; action?: "stake" | "unstake" | "claim" | "notify"; selectedPool?: any }>({
    show: false,
    amount: 0,
  });

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const accountHash = ownerPublicKey.toAccountHashStr();

      const data = await getAllCep18StakePools("hash-" + STORE_CEP_18_STAKE_CONTRACT, accountHash.slice(13));
      const now = Date.now();

      if (data.length > 0) {
        const tokenDetailPromises = data.map((dt: any, index: number) => fetchErc20TokenDetails("hash-" + dt.token));
        const tokenDetails = await Promise.all(tokenDetailPromises);
        const allPoolsData = data.map((dt: any, index: number) => {
          const currentToken = tokenDetails[index];
          const decimal = parseInt(currentToken.decimals.hex, 16);
          const maxApr = parseInt(dt.max_apr.hex, 16);
          const minApr = parseInt(dt.min_apr.hex, 16);
          const fixedApr = parseInt(dt.fixed_apr.hex, 16);
          const minStake = parseInt(dt.min_stake.hex, 16) / Math.pow(10, decimal);
          const maxStake = parseInt(dt.max_stake.hex, 16) / Math.pow(10, decimal);
          const maxCap = parseInt(dt.max_cap.hex, 16) / Math.pow(10, decimal);
          const totalSupply = dt.total_supply ? parseInt(dt.total_supply.hex, 16) / Math.pow(10, decimal) : 0;
          const depositEndTime = parseInt(dt.deposit_end_time.hex, 16);
          const depositStartTime = parseInt(dt.deposit_start_time.hex, 16);
          const depositStartTimeFormatted = moment(depositStartTime).format("MMMM Do YYYY, HH:mm");
          const depositEndTimeFormatted = moment(depositEndTime).format("MMMM Do YYYY, HH:mm");
          const lockPeriod = moment(parseInt(dt.lock_period.hex, 16));
          const liquidity = dt.liquidity ? parseInt(dt.liquidity.hex, 16) / Math.pow(10, decimal) : 0;
          const apr = dt.apr ? parseInt(dt.apr.hex, 16) : 0;
          const total_reward = dt.total_reward ? parseInt(dt.total_reward.hex, 16) / Math.pow(10, decimal) : 0;
          const my_balance = dt.my_balance ? dt.my_balance / Math.pow(10, decimal) : 0;
          const my_claimed = dt.my_claimed ? dt.my_claimed / Math.pow(10, decimal) : 0;
          const notified = dt.notified;
          let notifyAmount = 0;

          let status;
          const lockPeriodTime = depositEndTime + parseInt(dt.lock_period.hex, 16);

          if (!notified && now > depositEndTime) {
            status = STAKE_STATUS.FAIL;
          }

          if (!notified && now < depositEndTime) {
            status = STAKE_STATUS.WAITING_NOTIFY;
          }

          if (notified && now < depositStartTime) {
            status = STAKE_STATUS.WAITING_START_STAKE;
          }

          if (notified && now >= depositStartTime && now <= depositEndTime) {
            status = STAKE_STATUS.STAKEABLE;
          }

          if (notified && now > depositEndTime && now < lockPeriodTime) {
            status = STAKE_STATUS.WAITING_LOCK_PERIOD;
          }

          if (notified && now > lockPeriodTime) {
            status = STAKE_STATUS.UNSTAKEBLE;
          }

          if (notified && now > lockPeriodTime && my_balance <= 0 && my_claimed > 0) {
            status = STAKE_STATUS.FINISHED;
          }

          return {
            key: dt.key,
            name: currentToken.name,
            symbol: currentToken.symbol,
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
            token: dt.token,
            decimal,
            amIOwner: dt.amIOwner,
            apr,
            liquidity,
            my_balance,
            my_claimed,
            total_reward,
            status,
            notifyAmount,
          };
        });

        const finalData = allPoolsData.filter(
          (pool: any) => !pool.amIOwner && pool.status !== STAKE_STATUS.FINISHED && pool.status !== STAKE_STATUS.WAITING_NOTIFY && pool.status !== STAKE_STATUS.FAIL
        );

        setPools(finalData);
      }

      setLoading(false);
    };
    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const increaseAllowance = async () => {
    setLoading(true);
    if (showStakeModal.selectedPool) {
      const contract = new Contracts.Contract();
      const selectedPool = showStakeModal.selectedPool;

      contract.setContractHash("hash-" + selectedPool.token);

      const contractPackageHash = await contractHashToContractPackageHash(selectedPool.key.slice(5));
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const args = RuntimeArgs.fromMap({
        spender: CasperHelpers.stringToKey(contractPackageHash),
        amount: CLValueBuilder.u256(showStakeModal.amount * Math.pow(10, selectedPool.decimal)),
      });

      const deploy = contract.callEntrypoint("increase_allowance", args, ownerPublicKey, "casper-test", "1000000000");
      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });

        toastr.success(response.data, "Allowance increased successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        setLoading(false);
      } catch (error: any) {
        alert(error.message);
        setLoading(false);
      }
    } else {
      toastr.error("Please Select a token for allowance");
      setLoading(false);
    }
  };

  const stake = async () => {
    setLoading(true);

    const contract = new Contracts.Contract();
    const selectedPool = showStakeModal.selectedPool;
    contract.setContractHash(selectedPool.key);

    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      amount: CLValueBuilder.u256(showStakeModal.amount * Math.pow(10, selectedPool.decimal)),
    });

    const deploy = contract.callEntrypoint("stake", args, ownerPublicKey, "casper-test", "2500000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, {
        headers: { "Content-Type": "application/json" },
      });

      toastr.success(response.data, "Staked successfully.");

      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
      setShowStakeModal({ show: false, amount: 0 });
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const unStake = async () => {
    setLoading(true);

    const contract = new Contracts.Contract();
    const selectedPool = showStakeModal.selectedPool;
    contract.setContractHash(selectedPool.key);

    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      amount: CLValueBuilder.u256(showStakeModal.amount * Math.pow(10, selectedPool.decimal)),
    });

    const deploy = contract.callEntrypoint("unstake", args, ownerPublicKey, "casper-test", "2000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, {
        headers: { "Content-Type": "application/json" },
      });

      toastr.success(response.data, "Unstaked successfully.");

      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
      setShowStakeModal({ show: false, amount: 0 });
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  const claim = async () => {
    setLoading(true);
    const contract = new Contracts.Contract();

    const selectedPool = showStakeModal.selectedPool;
    contract.setContractHash(selectedPool.key);

    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({});

    const deploy = contract.callEntrypoint("claim", args, ownerPublicKey, "casper-test", "2000000000");

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", data, {
        headers: { "Content-Type": "application/json" },
      });

      toastr.success(response.data, "Claimed successfully.");

      window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
      setShowStakeModal({ show: false, amount: 0 });
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

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
      <Typography className={classes.title} variant="h5">
        There are no stake pools
      </Typography>
    );
  }

  return (
    <Grid container className={classes.container}>
      <Grid item style={{ display: "flex" }}>
        <Typography className={classes.title} variant="h5">
          JOIN POOL STAKE CEP-18 TOKEN
        </Typography>
      </Grid>
      <Grid container style={{ display: "flex", justifyContent: "center" }}>
        {pools.map((pl: any, index: number) => (
          <Grid item key={index} xl={8} style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", marginTop: "1rem" }}>
            <StakeCard stake={pl} key={index} stakeModal={setShowStakeModal}></StakeCard>
            <StakeModal
              handleStakeModal={setShowStakeModal}
              showStakeModal={showStakeModal}
              claim={claim}
              stake={stake}
              unStake={unStake}
              increaseAllowance={increaseAllowance}
            ></StakeModal>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default JoinStakes;
