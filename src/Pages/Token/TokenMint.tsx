import { Grid, Stack, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import { CustomInput } from "../../components/CustomInput";
import { Token } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { ERC20Client } from "casper-erc20-js-client-test";
import { CasperClient, CLPublicKey, DeployUtil } from "casper-js-sdk";

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
  const [data, setData] = useState<Token>({
    name: "",
    symbol: "",
    decimal: 9,
    supply: 0,
    description: "",
  });

  const classes = useStyles();

  const fetchContract = async () => {
    try {
      const wasmUrl = new URL("../assets/erc20_token.wasm", import.meta.url).href;
      const response = await fetch(wasmUrl);
      const buffer = await response.arrayBuffer();

      return buffer;
    } catch (error) {
      console.error("WebAssembly load error:", error);
    }
  };

  const mintToken = async () => {
    const casperClient = new CasperClient("https://rpc.testnet.casperlabs.io/rpc");

    const erc20 = new ERC20Client(
      casperClient, // CasperClient
      "", // Contract Hash optional
      "" // Contract Package Hash optional
    );

    const contract = await fetchContract();
    const pubkey = "02023e4cd902b76b2a8c8becd120440d122fb406a3918e681e2f1c6282fdd2af915a";

    const ownerPublicKey = CLPublicKey.fromHex(pubkey);

    const deploy = await erc20.installERC20(
      new Uint8Array(contract!), // Contract wasm
      {
        name: "AFC",
        symbol: "AFC",
        decimals: 9,
        totalSupply: 10000,
      },
      60_000_000_000, // Payment Amount
      ownerPublicKey,
      "casper-test"
    );

    const CasperWalletProvider = window.CasperWalletProvider;

    const provider = CasperWalletProvider();

    const deployJson = DeployUtil.deployToJson(deploy);

    console.log(deployJson);

    provider
      .sign(JSON.stringify(deployJson), pubkey)
      .then((res: any) => {
        if (res.cancelled) {
          alert("Sign cancelled");
        } else {
          const signedDeploy = DeployUtil.setSignature(deploy, res.signature, CLPublicKey.fromHex(pubkey));
          // alert("Sign successful: " + JSON.stringify(signedDeploy, null, 2));
        }
      })
      .catch((err: any) => {
        alert("Error: " + err);
      });
  };

  // const mintToken = () => {
  //   setData({
  //     name: "",
  //     symbol: "",
  //     decimal: 9,
  //     supply: 0,
  //     description: "",
  //   });

  //   const CasperWalletProvider = window.CasperWalletProvider;

  //   const provider = CasperWalletProvider();

  //   const casperClient = new casper.CasperClient("https://rpc.testnet.casperlabs.io/rpc");

  //   const pubkey = "02023e4cd902b76b2a8c8becd120440d122fb406a3918e681e2f1c6282fdd2af915a";
  //   // console.log(pubkey);
  //   const hash = new casper.CLPublicKey.fromHex(pubkey);

  //   console.log(hash);

  //   // const accounthash = new casper.CLAccountHash(hash);
  //   // const keyPairOfContract = new casper.CLKey(accounthash);

  //   // let deploy = casper.DeployUtil.makeDeploy(
  //   //   new casper.DeployUtil.DeployParams(new casper.CLPublicKey.fromHex(pubkey), "casper-test", 1, 1800000),
  //   //   casper.DeployUtil.ExecutableDeployItem.newModuleBytes(
  //   //     getBinary(),
  //   //     casper.RuntimeArgs.fromMap({
  //   //       decimals: casper.CLValueBuilder.u8(TOKEN_DECIMALS),
  //   //       name: casper.CLValueBuilder.string(TOKEN_NAME),
  //   //       symbol: casper.CLValueBuilder.string(TOKEN_SYMBOL),
  //   //       total_supply: casper.CLValueBuilder.u256(TOKEN_SUPPLY),
  //   //     })
  //   //   ),
  //   //   casper.DeployUtil.standardPayment(200000000000)
  //   // );

  //   // provider
  //   //   .sign(JSON.stringify(deployJson), accountPublicKey)
  //   //   .then((res: any) => {
  //   //     if (res.cancelled) {
  //   //       alert("Sign cancelled");
  //   //     } else {
  //   //       const signedDeploy = DeployUtil.setSignature(deploy, res.signature, CLPublicKey.fromHex(accountPublicKey));
  //   //       alert("Sign successful: " + JSON.stringify(signedDeploy, null, 2));
  //   //     }
  //   //   })
  //   //   .catch((err) => {
  //   //     alert("Error: " + err);
  //   //   });
  // };

  const disable = !(data.name && data.symbol && data.supply && data.decimal && data.description);

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
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
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
              <CustomInput
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
              />
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
              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={mintToken} disabled={false} label="Mint Token" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default TokenMint;
