import React, { useMemo, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { Checkbox, Grid, Stack, Theme, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey} from "casper-js-sdk";
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
  const [publicKey, provider, , , , marketplaceWasm] = useOutletContext<[publicKey:string, provider:any, wasm:any, nftWasm:any, collectionWasm:any, marketplaceWasm:any]>();
  const classes = useStyles();
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const [feeWallet, setFeeWallet] = useState<string>("");
  const [marketplaceName, setMarketplaceName] = useState<string>("");

  const disable = useMemo(() => {
    if (checked) {
      return true;
    }
  }, [checked]);

  const createMarketplace = async () => {
    
    try {
      const contract = new Contracts.Contract();
      const feewallet = CLPublicKey.fromHex(feeWallet);
      
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        fee_wallet: CLValueBuilder.key(feewallet),
        // marketplace_name: CLValueBuilder.string(ownerPublicKey),
      });

      const deploy = contract.install(
        new Uint8Array(marketplaceWasm!),
        args,
        "300000000000",
        ownerPublicKey,
        "casper-test"
      );
      console.log("deploy", deploy);
      const deployJson = DeployUtil.deployToJson(deploy);
      console.log("deployjson", deployJson);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          sign.signature,
          ownerPublicKey
        );
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Marketplace deployed successfully.");
        console.log(response.data);
        

      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    event.target.checked ? setFeeWallet(publicKey) : setFeeWallet("");
  };

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFeeWallet(e.target.value)
            }
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
            {checked && (
              <Typography>
                Used wallet address:{" "}
                {publicKey.slice(0, 10) + "..." + publicKey.slice(-10)}
              </Typography>
            )}
          </Grid>
          <CustomInput
            label="Marketplace Name"
            name="marketplacename"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMarketplaceName(e.target.value)
            }
            placeholder="Marketplace Name"
            type="text"
            value={marketplaceName}
          ></CustomInput>
          <CustomButton
            disabled={false}
            label="Create Marketplace"
            onClick={createMarketplace}
          ></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateMarketplace;
