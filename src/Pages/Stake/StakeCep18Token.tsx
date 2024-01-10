import { CircularProgress, Grid, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomSelect } from "../../components/CustomSelect";
import { useEffect, useMemo, useState } from "react";
import { ERC20Token } from "../../utils/types";
import { useGetTokens } from "../../hooks/useGetTokens";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CustomButton } from "../../components/CustomButton";
import { DURATION } from "../../utils/enum";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { CasperHelpers } from "../../utils";
import axios from "axios";
import { SERVER_API } from "../../utils/api";

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
  const navigate = useNavigate();
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const { tokens, loading } = useGetTokens(publicKey);
  const [stakeForm, setStakeForm] = useState<{ token: ERC20Token | null; duration: number }>({
    duration: DURATION["Monthly"],
    token: null,
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
      const args = RuntimeArgs.fromMap({
        staked_token: CasperHelpers.stringToKey(stakeForm.token?.contractHash!),
        duration: CLValueBuilder.u64(stakeForm.duration),
      });
      // const deploy = contract.install(stakeWasm, args, "80000000000", ownerPublicKey, "casper-test");
      // const deployJson = DeployUtil.deployToJson(deploy);
      try {
        // const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        // console.log("sign", sign);
        // let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        // signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        // console.log("signedDeploy", signedDeploy);
        // const data = DeployUtil.deployToJson(signedDeploy.val);
        // const response = await axios.post(SERVER_API + "deploy", data, {
        //   headers: { "Content-Type": "application/json" },
        // });
        // toastr.success(response.data, "ERC-20 Token deployed successfully.");
        // navigate("/");
        // loading
        // window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
      } catch (error: any) {
        // loading
        toastr.error("Something went wrong. Error: " + error);
      }
    } catch (error: any) {
      // loading
      toastr.error(error);
    }
  };

  const disable = useMemo(() => {
    return !stakeForm.duration || !stakeForm.token;
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
          <CustomSelect
            value={stakeForm.duration ? DURATION[stakeForm.duration] : "default"}
            label="Stake Period"
            onChange={(event: SelectChangeEvent<{ value: unknown }>) => {
              const selectedValue = event.target.value as keyof typeof DURATION;
              setStakeForm({ ...stakeForm, duration: DURATION[selectedValue] });
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
          <CustomButton disabled={disable} label="Click" onClick={() => console.log(stakeForm)}></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default StakeCep18Token;
