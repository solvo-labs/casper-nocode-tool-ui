import { Grid, Stack, Theme, CircularProgress, Switch, FormControlLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";

import axios from "axios";
import { ERC20TokenForm } from "../../utils/types";
import { CustomInput } from "../../components/CustomInput";
import { fetchContract } from "../../utils";
import { CustomButton } from "../../components/CustomButton";
import { useNavigate, useOutletContext } from "react-router-dom";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down("sm")]: {
      marginBottom: 2,
      marginTop: 2,
      padding: "24px",
    },
  },
  center: {
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    },
  },
  title: {
    fontWeight: 500,
    fontSize: "26px",
    position: "relative",
    top: "3rem",
    borderBottom: "1px solid #FF0011 !important",
  },
  gridContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
    padding: "1rem",
  },
  stackContainer: {
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
  buttonContainer: {
    textAlign: "start",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const TokenMint: React.FC = () => {
  const [data, setData] = useState<ERC20TokenForm>({
    name: "",
    symbol: "",
    decimal: 9,
    supply: 0,
    enableMintBurn: true,
  });

  const [actionLoader, setActionLoader] = useState<boolean>(false);

  const classes = useStyles();
  const navigate = useNavigate();

  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();

  const mintToken = async () => {
    // wallet
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    // contract
    const wasm = await fetchContract("../assets/cep18.wasm");

    const contract = new Contracts.Contract();

    // parameters
    const args = RuntimeArgs.fromMap({
      name: CLValueBuilder.string(data.name),
      symbol: CLValueBuilder.string(data.symbol),
      decimals: CLValueBuilder.u8(data.decimal),
      total_supply: CLValueBuilder.u256(data.supply * Math.pow(10, data.decimal)),
      enable_mint_burn: CLValueBuilder.bool(data.enableMintBurn),
    });

    const deploy = contract.install(new Uint8Array(wasm!), args, "110000000000", ownerPublicKey, "casper-test");

    const deployJson = DeployUtil.deployToJson(deploy);

    // signer logic
    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      setActionLoader(true);

      let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const data = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post("http://localhost:1923/deploy", data, { headers: { "Content-Type": "application/json" } });
      toastr.success(response.data, "ERC-20 Token deployed successfully.");

      navigate("/my-tokens");
      setActionLoader(false);
    } catch (error: any) {
      alert(error.message);
    }

    // provider
    //   .sign(JSON.stringify(deployJson), publicKey)
    //   .then((res: any) => {
    //     if (res.cancelled) {
    //       alert("Sign cancelled");
    //     } else {
    //       const signedDeploy = DeployUtil.setSignature(deploy, res.signature, ownerPublicKey);

    //       axios.post("http://localhost:1923/install", signedDeploy, { headers: { "Content-Type": "application/json" } }).then((response) => {
    //         console.log(response.data);
    //       });

    //       // alert("Sign successful: " + JSON.stringify(signedDeploy, null, 2));
    //     }
    //   })
    //   .catch((err: any) => {
    //     alert("Error: " + err);
    //   });
  };

  const disable = !(data.name && data.symbol && data.supply && data.decimal);

  if (actionLoader) {
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
    <div
      style={{
        height: "calc(100vh-5rem)",
        minWidth: "21rem",
        padding: "1rem",
      }}
    >
      <Grid container className={classes.container}>
        <Grid container className={classes.center}>
          <h5 className={classes.title}>Mint Token</h5>

          <Grid container className={classes.gridContainer}>
            <Stack spacing={4} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <CustomInput
                placeholder="Name"
                label="Name"
                id="name"
                name="name"
                type="text"
                value={data.name}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    name: e.target.value,
                  })
                }
              />
              {/* <CustomInput
                placeholder="Description"
                label="Description"
                id="description"
                name="description"
                type="text"
                value={data.description}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    description: e.target.value,
                  })
                }
              /> */}
              <CustomInput
                placeholder="Symbol"
                label="Symbol"
                id="symbol"
                name="symbol"
                type="text"
                value={data.symbol}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    symbol: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Supply"
                label="Supply"
                id="supply"
                name="supply"
                type="number"
                value={data.supply}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    supply: e.target.value,
                  })
                }
              />
              <CustomInput
                placeholder="Decimal"
                label="Decimal"
                id="decimal"
                name="decimal"
                type="number"
                value={data.decimal}
                onChange={(e: any) =>
                  setData({
                    ...data,
                    decimal: e.target.value,
                  })
                }
              />
              <FormControlLabel
                style={{ justifyContent: "start" }}
                labelPlacement="start"
                control={<Switch checked={data.enableMintBurn} color="warning" onChange={() => setData({ ...data, enableMintBurn: !data.enableMintBurn })} />}
                label="Enable Mint & Burn"
              />

              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={mintToken} disabled={disable} label="Mint Token" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default TokenMint;
