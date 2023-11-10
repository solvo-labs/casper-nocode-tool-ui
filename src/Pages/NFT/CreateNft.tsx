import { useEffect, useMemo, useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { SERVER_API, fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";
import { NFT } from "../../utils/types";
import { CircularProgress, Divider, FormControlLabel, Grid, MenuItem, SelectChangeEvent, Stack, Switch, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import ImageUpload from "../../components/ImageUpload";
import { NFTStorage } from "nft.storage";
import { CustomSelect } from "../../components/CustomSelect";
// import CreatorRouter from "../../components/CreatorRouter";
// import { DONT_HAVE_ANYTHING } from "../../utils/enum";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: "2rem",
    [theme.breakpoints.down("sm")]: {
      marginBottom: "2rem",
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
  const params = useParams();

  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const classes = useStyles();
  const [nftData, setNftData] = useState<NFT>({
    index: 0,
    contractHash: "",
    tokenMetaData: {
      name: "",
      description: "",
      asset: "",
    },
    mergable: true,
    timeable: true,
  });

  const [file, setFile] = useState<any>();
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [collections, setCollections] = useState<any>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>();

  const navigate = useNavigate();

  const handleClear = () => {
    setFile(null);
    setNftData({ ...nftData, tokenMetaData: { ...nftData.tokenMetaData, asset: "" } });
  };

  useEffect(() => {
    const init = async () => {
      if (params.collectionHash) {
        const currentCollection = await getNftCollection(params.collectionHash);

        setSelectedCollection(currentCollection);
      } else {
        const data = await fetchCep78NamedKeys(publicKey);

        const promises = data.map((data) => getNftCollection(data.key));

        const result = await Promise.all(promises);

        setCollections(result);
      }

      setLoading(false);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const disable = useMemo(() => {
    const disable = !selectedCollection || !nftData.tokenMetaData.name || !nftData.tokenMetaData.description || fileLoading;
    return disable;
  }, [nftData, selectedCollection, fileLoading]);

  const createNft = async () => {
    const contract = new Contracts.Contract();
    contract.setContractHash(selectedCollection.contractHash);

    try {
      setLoading(true);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        token_owner: CLValueBuilder.key(ownerPublicKey),
        token_meta_data: CLValueBuilder.string(JSON.stringify(nftData.tokenMetaData)),
      });

      const deploy = contract.callEntrypoint("mint", args, ownerPublicKey, "casper-test", "4000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", deployData, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Mint completed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-collections");
        // setActionLoader(false);
        setLoading(false);
      } catch (error: any) {
        toastr.error("Error: " + error);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
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

        setNftData({
          ...nftData,
          tokenMetaData: {
            ...nftData.tokenMetaData,
            asset: fileUrl,
          },
        });
        setFileLoading(false);
      }
    };

    storeImage();
  }, [file]);

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
    <>
      {/* {collections.length <= 0 && <CreatorRouter explain={DONT_HAVE_ANYTHING.COLLECTION} handleOnClick={() => navigate("/token")}></CreatorRouter>} */}
      {/* {collections.length > 0 && ( */}
      <Grid container className={classes.container}>
        <Grid container className={classes.center}>
          <Grid item>
            <Typography className={classes.title} variant="h5">
              Create NFT
            </Typography>
          </Grid>
          <Grid container className={classes.gridContainer}>
            <Stack spacing={4} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <CustomSelect
                value={collections.length > 0 ? selectedCollection?.contractHash || "default" : "default"}
                label="ERC-20 Token"
                onChange={(event: SelectChangeEvent) => {
                  const data = collections.find((tk: any) => tk.contractHash === event.target.value);
                  setSelectedCollection(data);
                }}
                id={"custom-select"}
                disabled={params.collectionHash !== undefined}
              >
                <MenuItem value="default">
                  <em>{params.collectionHash ? selectedCollection.collection_name : "Select a Collection"}</em>
                </MenuItem>
                {collections.map((tk: any) => {
                  return (
                    <MenuItem key={tk.contractHash} value={tk.contractHash}>
                      {tk.collection_name}
                    </MenuItem>
                  );
                })}
              </CustomSelect>
              <Divider
                // textAlign="left"
                sx={{
                  color: "white",
                  "&::before, &::after": {
                    borderTop: "thin solid red !important",
                  },
                }}
              >
                NFT Metadata
              </Divider>
              <ImageUpload file={file} loading={fileLoading} setFile={(data) => setFile(data)} handleClear={handleClear}></ImageUpload>
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
                disable={fileLoading}
                floor="dark"
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
                disable={fileLoading}
                floor="dark"
              ></CustomInput>
              <FormControlLabel
                sx={{ justifyContent: "start", alignItems: "center", ".MuiFormControlLabel-label.Mui-disabled": { color: "gray" } }}
                labelPlacement="start"
                control={<Switch checked={nftData.mergable} color="error" onChange={() => setNftData({ ...nftData, mergable: !nftData.mergable })} />}
                label="Mergeable NFT"
                disabled={fileLoading}
              />
              <FormControlLabel
                sx={{ justifyContent: "start", alignItems: "center", ".MuiFormControlLabel-label.Mui-disabled": { color: "gray" } }}
                labelPlacement="start"
                control={<Switch checked={nftData.timeable} color="error" onChange={() => setNftData({ ...nftData, timeable: !nftData.timeable })} />}
                label="Timeable NFT"
                disabled={fileLoading}
              />
              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={createNft} disabled={disable} label="Create NFT" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
      {/* )} */}
    </>
  );
};
