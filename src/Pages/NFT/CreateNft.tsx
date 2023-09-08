import { useEffect, useMemo, useState } from "react";
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
import ImageUpload from "../../components/ImageUpload";
import { NFTStorage } from "nft.storage";

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
  const [publicKey, provider] =
    useOutletContext<[publickey: string, provider: any]>();
  const classes = useStyles();
  const [nftData, setNftData] = useState<NFT>({
    contractHash: "",
    tokenMetaData: {
      name: "",
      description: "",
      imageURL: "",
    },
  });

  const [file, setFile] = useState<any>();
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  const disable = useMemo(() => {
    let hashLength = nftData.contractHash.length;
    let hashCheck = nftData.contractHash.startsWith("hash-");
    const disable = !(
      nftData.contractHash &&
      nftData.tokenMetaData &&
      hashCheck &&
      hashLength == 69 &&
      !fileLoading
    );
    return disable;
  }, [nftData, fileLoading]);

  const createNft = async () => {
    const contract = new Contracts.Contract();
    contract.setContractHash(nftData.contractHash);

    try {
      console.log(nftData.tokenMetaData);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        token_owner: CLValueBuilder.key(ownerPublicKey),
        token_meta_data: CLValueBuilder.string(
          JSON.stringify(nftData.tokenMetaData)
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
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  useEffect(() => {
    const storeImage = async () => {
      if (file) {
        setFileLoading(true);
        const storage = new NFTStorage({
          token: import.meta.env.VITE_NFT_STORAGE_API_KEY,
        });
        const fileCid = await storage.storeBlob(new Blob([file]));

        const fileUrl = "https://ipfs.io/ipfs/" + fileCid;

        const obj = {
          image: fileUrl,
        };

        const metadata = new Blob([JSON.stringify(obj)], {
          type: "application/json",
        });
        const metadataCid = await storage.storeBlob(metadata);
        const metadataUrl = "https://ipfs.io/ipfs/" + metadataCid;
        setNftData({
          ...nftData,
          tokenMetaData: {
            ...nftData.tokenMetaData,
            imageURL: metadataUrl,
          },
        });
        setFileLoading(false);
      }
    };

    storeImage();
  }, [file]);

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
          <Grid item>
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
              <Typography
                sx={{ borderBottom: "1px solid #FF0011 !important" }}
                variant="button"
              >
                Metadata
              </Typography>
              <ImageUpload
                file={file}
                loading={fileLoading}
                setFile={(data) => setFile(data)}
              ></ImageUpload>
              <CustomInput
                placeholder="Metadata Name"
                label="Metadata Name"
                id="metadataName"
                name="metadataName"
                type="text"
                onChange={(e: any) => {
                  setNftData({
                    ...nftData,
                    tokenMetaData: {
                      ...nftData.tokenMetaData,
                      name: e.target.value,
                    },
                  });
                }}
                value={nftData.tokenMetaData.name}
              ></CustomInput>
              <CustomInput
                placeholder="Metadata Description"
                label="Metadata Description"
                id="metadataDescription"
                name="metadataDescription"
                type="text"
                onChange={(e: any) => {
                  setNftData({
                    ...nftData,
                    tokenMetaData: {
                      ...nftData.tokenMetaData,
                      description: e.target.value,
                    },
                  });
                }}
                value={nftData.tokenMetaData.description}
              ></CustomInput>

              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton
                  onClick={createNft}
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
