import { CircularProgress, FormControlLabel, Grid, MenuItem, SelectChangeEvent, Stack, Switch, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomSelect } from "../../components/CustomSelect";
import { useEffect, useMemo, useState } from "react";
import { ERC20Token, StakeForm } from "../../utils/types";
import { useGetTokens } from "../../hooks/useGetTokens";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CustomButton } from "../../components/CustomButton";
import { PERIOD } from "../../utils/enum";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder, CLAccountHash } from "casper-js-sdk";
import { CasperHelpers, STORE_CEP_18_STAKE_CONTRACT } from "../../utils";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { CustomInput } from "../../components/CustomInput";
import { CustomDateTime } from "../../components/CustomDateTime";
import { Moment } from "moment";
import toastr from "toastr";
import CustomStakeDateSelect from "../../components/CustomStakeDateSelect";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "50vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "80vw",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "90vw",
      marginBottom: 2,
      marginTop: 2,
      padding: "24px",
    },
  },
  title: {
    borderBottom: "1px solid #FF0011 !important",
  },
}));

const StakeCep18Token = () => {
  const classes = useStyles();
  const [publicKey, provider, , , , , , , , , , , stakeWasm] =
    useOutletContext<
      [
        publickey: string,
        provider: any,
        cep18Wasm: any,
        cep78Wasm: any,
        marketplaceWasm: any,
        vestingWasm: any,
        executeListingWasm: any,
        raffleWasm: any,
        buyTicketWasm: any,
        lootboxWasm: any,
        lootboxDepositWasm: any,
        timeableNftDepositWasm: any,
        stakeWasm: any
      ]
    >();
  const { tokens, loading } = useGetTokens(publicKey);
  const [stakeForm, setStakeForm] = useState<StakeForm>({
    lockPeriod: {
      unit: 1,
      period: PERIOD["Day"],
    },
    token: null,
    minStake: 0,
    maxStake: 0,
    maxCap: 0,
    fixedApr: 0,
    minApr: 0,
    maxApr: 0,
    depositStartTime: Date.now() / 1000,
    depositEndTime: Date.now() / 1000,
  });
  const [isFixedApr, setIsFixedApr] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const createStake = async () => {
    setActionLoading(true);
    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const contract = new Contracts.Contract();

      if (stakeForm.token) {
        const decimal = Number(stakeForm.token.decimals.hex);

        const periodMilisec = stakeForm.lockPeriod.period * stakeForm.lockPeriod.unit;
        const args = RuntimeArgs.fromMap({
          token: CasperHelpers.stringToKey(stakeForm.token.contractHash),
          min_stake: CLValueBuilder.u256(stakeForm.minStake * Math.pow(10, decimal)),
          max_stake: CLValueBuilder.u256(stakeForm.maxStake * Math.pow(10, decimal)),
          max_cap: CLValueBuilder.u256(stakeForm.maxCap * Math.pow(10, decimal)),
          fixed_apr: CLValueBuilder.u64(isFixedApr ? stakeForm.fixedApr : 0),
          min_apr: CLValueBuilder.u64(isFixedApr ? 0 : stakeForm.minApr),
          max_apr: CLValueBuilder.u64(isFixedApr ? 0 : stakeForm.maxApr),
          lock_period: CLValueBuilder.u64(periodMilisec),
          deposit_start_time: CLValueBuilder.u64(stakeForm.depositStartTime * 1000),
          deposit_end_time: CLValueBuilder.u64(stakeForm.depositEndTime * 1000),
          storage_key: new CLAccountHash(Buffer.from(STORE_CEP_18_STAKE_CONTRACT, "hex")),
        });

        const deploy = contract.install(new Uint8Array(stakeWasm), args, "150000000000", ownerPublicKey, "casper-test");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);

          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "CEP-18 Stake Contract deployed successfully.");
          navigate("/manage-stake");

          window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
          setActionLoading(false);
        } catch (error: any) {
          // loading
          toastr.error("Something went wrong. Error: " + error);
          setActionLoading(false);
        }
      }
    } catch (error: any) {
      // loading
      setActionLoading(false);
      toastr.error(error);
    }
  };

  const disable = useMemo(() => {
    let aprLimit: boolean;
    if (isFixedApr) {
      aprLimit = !stakeForm.fixedApr;
    } else {
      aprLimit = !stakeForm.minApr || !stakeForm.maxApr || stakeForm.minApr >= stakeForm.maxApr;
    }
    const timeLimit = stakeForm.depositStartTime * 1000 <= Date.now() || stakeForm.depositEndTime <= stakeForm.depositStartTime;
    return (
      !stakeForm.maxCap ||
      !stakeForm.maxStake ||
      !stakeForm.minStake ||
      stakeForm.minStake > stakeForm.maxStake ||
      stakeForm.maxCap <= stakeForm.maxStake ||
      stakeForm.maxCap <= stakeForm.minStake ||
      aprLimit ||
      timeLimit
    );
  }, [stakeForm]);

  if (loading || actionLoading) {
    return (
      <div
        style={{
          height: "calc(100vh - 8rem)",
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

  return (
    <Grid container className={classes.container} direction={"column"}>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Typography variant="h5" className={classes.title}>
          Create Cep18 Stake Pool
        </Typography>
      </Grid>
      <Grid item marginTop={"4rem"}>
        <Stack spacing={4}>
          <CustomSelect
            value={stakeForm.token ? stakeForm.token?.contractHash : "default"}
            label="ERC-20 Token"
            onChange={(event: SelectChangeEvent) => {
              const data = tokens.find((tk) => tk.contractHash === event.target.value);
              data ? setStakeForm({ ...stakeForm, token: data }) : setStakeForm({ ...stakeForm, token: null });
            }}
            id={"custom-select"}
          >
            <MenuItem value="default">
              <em>Select an ERC-20 Token</em>
            </MenuItem>
            {tokens.map((tk) => {
              return (
                <MenuItem key={tk.contractHash} value={tk.contractHash}>
                  {tk.name + "(" + tk.symbol + ")"}
                </MenuItem>
              );
            })}
          </CustomSelect>
          <CustomInput
            placeholder="Min Stake"
            label="Min Stake"
            id="minStake"
            name="minStake"
            type="number"
            value={stakeForm.minStake || ""}
            onChange={(e: any) => setStakeForm({ ...stakeForm, minStake: Number(e.target.value) })}
          />
          <CustomInput
            placeholder="Max Stake"
            label="Max Stake"
            id="maxStake"
            name="maxStake"
            type="number"
            value={stakeForm.maxStake || ""}
            onChange={(e: any) => setStakeForm({ ...stakeForm, maxStake: Number(e.target.value) })}
          />
          <CustomInput
            placeholder="Max Cap"
            label="Max Cap"
            id="maxCap"
            name="maxCap"
            type="number"
            value={stakeForm.maxCap || ""}
            onChange={(e: any) => setStakeForm({ ...stakeForm, maxCap: Number(e.target.value) })}
          />
          <FormControlLabel
            style={{ justifyContent: "start" }}
            labelPlacement="start"
            control={
              <Switch
                checked={isFixedApr}
                color="warning"
                onChange={() => {
                  setIsFixedApr(!isFixedApr);
                  setStakeForm({ ...stakeForm, minApr: 0, maxApr: 0, fixedApr: 0 });
                }}
              />
            }
            label="Fixed Apr"
          />
          {isFixedApr ? (
            <CustomInput
              placeholder="Fixed APR %"
              label="Fixed APR"
              id="fixedApr"
              name="fixedApr"
              type="number"
              value={stakeForm.fixedApr || ""}
              onChange={(e: any) => setStakeForm({ ...stakeForm, fixedApr: Number(e.target.value) })}
            />
          ) : (
            <>
              <CustomInput
                placeholder="Min APR %"
                label="Min APR"
                id="minApr"
                name="minApr"
                type="number"
                value={stakeForm.minApr || ""}
                onChange={(e: any) => setStakeForm({ ...stakeForm, minApr: Number(e.target.value) })}
              />
              <CustomInput
                placeholder="Max APR %"
                label="Max APR"
                id="maxApr"
                name="maxApr"
                type="number"
                value={stakeForm.maxApr || ""}
                onChange={(e: any) => setStakeForm({ ...stakeForm, maxApr: Number(e.target.value) })}
              />
            </>
          )}

          <CustomDateTime
            value={stakeForm.depositStartTime}
            label="Deposit Start Time"
            theme={"Dark"}
            onChange={(e: Moment) => setStakeForm({ ...stakeForm, depositStartTime: e.unix() })}
          />
          <CustomDateTime
            value={stakeForm.depositEndTime}
            label="Deposit End Time"
            theme={"Dark"}
            onChange={(e: Moment) => setStakeForm({ ...stakeForm, depositEndTime: e.unix() })}
          />
          {/* <CustomDateTime></CustomDateTime> */}
          {/* <CustomSelect
            value={stakeForm.lockPeriod ? PERIOD[stakeForm.lockPeriod] : "default"}
            label="Stake Lock Period"
            onChange={(event: SelectChangeEvent<{ value: unknown }>) => {
              const selectedValue = event.target.value as keyof typeof PERIOD;
              setStakeForm({ ...stakeForm, lockPeriod: PERIOD[selectedValue] });
            }}
            id={"custom-select"}
          >
            <MenuItem value="default">
              <em>Select Stake Period</em>
            </MenuItem>
            {durationList.map((dur: string) => {
              return (
                <MenuItem key={dur} value={dur}>
                  {dur}
                </MenuItem>
              );
            })}
          </CustomSelect> */}
          <CustomStakeDateSelect stakeForm={stakeForm} handleState={setStakeForm}></CustomStakeDateSelect>
          <CustomButton disabled={disable} label="Create Stake Pool" onClick={createStake}></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default StakeCep18Token;
