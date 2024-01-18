import { CircularProgress, Grid, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomSelect } from "../../components/CustomSelect";
import { useEffect, useMemo, useState } from "react";
import { ERC20Token } from "../../utils/types";
import { useGetTokens } from "../../hooks/useGetTokens";
import { useOutletContext } from "react-router-dom";
import { CustomButton } from "../../components/CustomButton";
import { DURATION } from "../../utils/enum";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { CasperHelpers } from "../../utils";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { CustomInput } from "../../components/CustomInput";
import { CustomDateTime } from "../../components/CustomDateTime";
import { Moment } from "moment";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "50vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
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
  const [stakeForm, setStakeForm] = useState<{
    token: ERC20Token | null;
    lockPeriod: number;
    minStake: number;
    maxStake: number;
    maxCap: number;
    fixedApr: number;
    minApr: number;
    maxApr: number;
    depositStartTime: number;
    depositEndTime: number;
  }>({
    lockPeriod: DURATION["Monthly"],
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
  const [durationList, setDurationList] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const durationArray: string[] = Object.keys(DURATION).filter((key) => isNaN(Number(key)));
      setDurationList(durationArray);
    };
    init();
  }, []);

  const createStake = async () => {
    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const contract = new Contracts.Contract();

      if (stakeForm.token) {
        const decimal = Number(stakeForm.token.decimals.hex);

        const args = RuntimeArgs.fromMap({
          token: CasperHelpers.stringToKey(stakeForm.token.contractHash),
          min_stake: CLValueBuilder.u256(stakeForm.minStake * Math.pow(10, decimal)),
          max_stake: CLValueBuilder.u256(stakeForm.maxStake * Math.pow(10, decimal)),
          max_cap: CLValueBuilder.u256(stakeForm.maxCap * Math.pow(10, decimal)),

          // fixed case
          fixed_apr: CLValueBuilder.u64(stakeForm.fixedApr),
          min_apr: CLValueBuilder.u64(stakeForm.minApr),
          max_apr: CLValueBuilder.u64(stakeForm.maxApr),

          lock_period: CLValueBuilder.u64(stakeForm.lockPeriod),
          deposit_start_time: CLValueBuilder.u64(stakeForm.depositStartTime * 1000),
          deposit_end_time: CLValueBuilder.u64(stakeForm.depositEndTime * 1000),
        });

        const deploy = contract.install(stakeWasm, args, "80000000000", ownerPublicKey, "casper-test");
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
          // navigate("/");

          window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
        } catch (error: any) {
          // loading
          toastr.error("Something went wrong. Error: " + error);
        }
      }
    } catch (error: any) {
      // loading
      toastr.error(error);
    }
  };

  const disable = useMemo(() => {
    return !stakeForm.lockPeriod || !stakeForm.token;
  }, [stakeForm]);

  if (loading) {
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
          Stake Cep18 Token
        </Typography>
      </Grid>
      <Grid item marginTop={"5rem"} width={"50%"}>
        <Stack spacing={4}>
          <CustomSelect
            value={stakeForm.token ? stakeForm.token?.contractHash : "default"}
            label="ERC-20 Token"
            onChange={(event: SelectChangeEvent) => {
              const data = tokens.find((tk) => tk.contractHash === event.target.value);
              if (data) {
                setStakeForm({ ...stakeForm, token: data });
              }
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
          <CustomInput
            placeholder="Fixed APR %"
            label="Fixed APR"
            id="fixedApr"
            name="fixedApr"
            type="number"
            value={stakeForm.fixedApr || ""}
            onChange={(e: any) => setStakeForm({ ...stakeForm, fixedApr: Number(e.target.value) })}
          />{" "}
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
          <CustomSelect
            value={stakeForm.lockPeriod ? DURATION[stakeForm.lockPeriod] : "default"}
            label="Stake Period"
            onChange={(event: SelectChangeEvent<{ value: unknown }>) => {
              const selectedValue = event.target.value as keyof typeof DURATION;
              setStakeForm({ ...stakeForm, lockPeriod: DURATION[selectedValue] });
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
          </CustomSelect>
          <CustomButton disabled={disable} label="Stake" onClick={createStake}></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default StakeCep18Token;
