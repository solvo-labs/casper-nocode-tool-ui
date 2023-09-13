import React, { useMemo, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { Checkbox, CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey } from "casper-js-sdk";
import toastr from "toastr";
import axios from "axios";
import { SERVER_API } from "../../utils/api";

const useStyles = makeStyles((_theme: Theme) => ({
  container: {
    // wid
  },
  title: {
    marginBottom: "2rem !important",
  },
}));

const CreateMarketplace = () => {
  const [publicKey, provider, , , marketplaceWasm] =
    useOutletContext<[publicKey: string, provider: any, cep18Wasm: ArrayBuffer, cep78Wasm: ArrayBuffer, marketplaceWasm: ArrayBuffer]>();
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const [feeWallet, setFeeWallet] = useState<string>("");
  const [marketplaceName, setMarketplaceName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const disable = useMemo(() => {
    if (checked) {
      return true;
    }
  }, [checked]);

  const createMarketplace = async () => {
    try {
      setLoading(true);
      const contract = new Contracts.Contract();
      const feewallet = CLPublicKey.fromHex(feeWallet);

      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        fee_wallet: CLValueBuilder.key(feewallet),
        contract_name: CLValueBuilder.string(marketplaceName),
      });

      const deploy = contract.install(new Uint8Array(marketplaceWasm), args, "300000000000", ownerPublicKey, "casper-test");
      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Marketplace deployed successfully.");
        console.log(response.data);
      } catch (error: any) {
        alert(error.message);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    event.target.checked ? setFeeWallet(publicKey) : setFeeWallet("");
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

  return (
    <Grid container direction={"column"}>
      <Grid item className={classes.title}>
        <Typography variant="h4">Create your own Marketplace's</Typography>
      </Grid>
      <Grid item>
        <Stack spacing={4}>
          <CustomInput
            label="Fee wallet"
            name="feewallet"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeeWallet(e.target.value)}
            placeholder="Fee wallet"
            type="text"
            value={feeWallet}
            disable={disable}
          ></CustomInput>
          <Grid item>
            <Stack direction={"row"} alignItems={"center"}>
              <Checkbox
                checked={checked}
                onChange={handleChange}
                sx={{
                  color: "red",
                  "&.Mui-checked": {
                    color: "red",
                  },
                }}
              />
              <Typography>Use the wallet I logged into.</Typography>
            </Stack>
            {checked && <Typography>Used wallet address: {publicKey.slice(0, 10) + "..." + publicKey.slice(-10)}</Typography>}
          </Grid>
          <CustomInput
            label="Marketplace Name"
            name="marketplacename"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMarketplaceName(e.target.value)}
            placeholder="Marketplace Name"
            type="text"
            value={marketplaceName}
          ></CustomInput>
          <CustomButton disabled={false} label="Create Marketplace" onClick={createMarketplace}></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateMarketplace;
