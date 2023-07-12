import React, { useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useOutletContext } from "react-router-dom";
import { SERVER_API } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";
import { NFT } from "../../utils/types";
import { Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";

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
}));

export const CreateNft = () => {
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const classes = useStyles();
  const [nftData, setNftData] = useState<NFT>({
    contractHash: "",
    tokenMetaData: {},
  });

  let hashLength = nftData.contractHash.length;
  let hashCheck = nftData.contractHash.startsWith("hash-");
  const disable = !(nftData.contractHash && nftData.tokenMetaData && hashCheck && hashLength == 69)

  const createNft = async () => {
    const contract = new Contracts.Contract();

    // "hash-5480fd53270a9768dc9c37ac41921a583d7f19095479f89552cda74185cca66c"
    contract.setContractHash(nftData.contractHash);
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);

    const args = RuntimeArgs.fromMap({
      token_owner: CLValueBuilder.key(ownerPublicKey),
      token_meta_data: CLValueBuilder.string(nftData.tokenMetaData
        // JSON.stringify({
        //   name: "Kaaacca2",
        //   description: "hello",
        //   asset:
        //     "https://maritime.sealstorage.io/ipfs/bafkreia2xhh4rh5tmlpy5srlzzezvm2nabm7rcvuhtjexhj5hh42yidiku",
        // }
        // )
      ),
    });

    const deploy = contract.callEntrypoint(
      "mint",
      args,
      ownerPublicKey,
      "casper-test",
      "2000000000"
    );

    const deployJson = DeployUtil.deployToJson(deploy);

    try {
      const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

      // setActionLoader(true);

      let signedDeploy = DeployUtil.setSignature(
        deploy,
        sign.signature,
        ownerPublicKey
      );

      signedDeploy = DeployUtil.validateDeploy(signedDeploy);

      const deployData = DeployUtil.deployToJson(signedDeploy.val);

      const response = await axios.post(SERVER_API + "deploy", deployData, {
        headers: { "Content-Type": "application/json" },
      });
      toastr.success(response.data, "Mint completed successfully.");
      window.open(
        "https://testnet.cspr.live/deploy/" + response.data,
        "_blank"
      );

      // navigate("/my-tokens");
      // setActionLoader(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

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
          <Grid item marginBottom={"3rem"} marginTop={"8rem"}>
            <Typography className={classes.title} variant="h5">
              Create NFT
            </Typography>
          </Grid>
          <Grid container className={classes.gridContainer}>
            <Stack
              spacing={4}
              direction={"column"}
              marginTop={4}
              className={classes.stackContainer}
            >
              <CustomInput
                placeholder="Collection Address"
                label="Collection Address"
                id="collectionAddress"
                name="collectionAddress"
                type="text"
                onChange={(e: any) => {
                  setNftData({
                    ...nftData,
                    contractHash: e.target.value,
                  });
                }}
                value={nftData.contractHash}
              ></CustomInput>
              {/* //TODO nft metadata input */}
              <CustomInput
                placeholder="Metadata"
                label="NFT Metadata"
                id="tokenMetadata"
                name="tokenMetadata"
                type="text"
                onChange={(e: any) => {
                  setNftData({
                    ...nftData,
                    tokenMetaData: e.target.value,
                  });
                }}
                value={"nftData"}
              ></CustomInput>

              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton
                  onClick={() => {
                    console.log(nftData);
                  }}
                  disabled={disable}
                  label="Create NFT"
                />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
