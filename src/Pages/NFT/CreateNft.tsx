import { useEffect, useMemo, useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder, CLKey, CLByteArray, CLAccountHash } from "casper-js-sdk";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { SERVER_API, fetchCep78NamedKeys, getNftCollectionDetails } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";
import { Box, CircularProgress, Divider, FormControlLabel, Grid, MenuItem, SelectChangeEvent, Stack, Switch, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import ImageUpload from "../../components/ImageUpload";
import { NFTStorage } from "nft.storage";
import { CustomSelect } from "../../components/CustomSelect";
import { CustomDateTime } from "../../components/CustomDateTime";
import moment, { Moment } from "moment";
import { BurnMode, MetadataMutability, MintingMode, NFT_TYPES, OwnerReverseLookupMode } from "../../utils/enum";
import { CasperHelpers, DAPPEND_NFT_CONTRACT } from "../../utils";
import { NftMetadataForm } from "../../utils/types";

const defaultNftMetadata: NftMetadataForm = { name: "", description: "", asset: "" };

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

  const [publicKey, provider, , , , , , , , , , timeableNftDepositWasm] =
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
        timeableNftDepositWasm: any
      ]
    >();
  const classes = useStyles();

  const [nftMetadata, setNftMetadata] = useState<NftMetadataForm>(defaultNftMetadata);
  const [file, setFile] = useState<any>();
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoader] = useState<boolean>(false);
  const [collections, setCollections] = useState<any>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>();
  const [nftType, setNftType] = useState<NFT_TYPES>(NFT_TYPES.Standart);

  const navigate = useNavigate();

  const handleClear = () => {
    setFile(null);
    setNftMetadata({ ...nftMetadata, asset: "" });
  };

  useEffect(() => {
    const init = async () => {
      if (params.collectionHash) {
        const currentCollection = await getNftCollectionDetails(params.collectionHash);

        setSelectedCollection(currentCollection);
      } else {
        const data = await fetchCep78NamedKeys(publicKey);

        const promises = data.map((data) => getNftCollectionDetails(data.key));

        const result = await Promise.all(promises);

        setCollections(result);
      }

      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      if (
        selectedCollection.metadata_mutability == MetadataMutability.Immutable &&
        selectedCollection.minting_mode == MintingMode.Public &&
        selectedCollection.burn_mode == BurnMode.Burnable
      ) {
        if (selectedCollection.reporting_mode == OwnerReverseLookupMode.Complate) {
          setNftType(NFT_TYPES.Timeable);
          setNftMetadata({ ...defaultNftMetadata, timeable: true, timestamp: moment().unix() });
          toastr.warning("You can create only Timeable nft for this collection");
        } else {
          setNftType(NFT_TYPES.Mergeable);
          setNftMetadata({ ...defaultNftMetadata, mergeable: true });
        }
      } else {
        setNftType(NFT_TYPES.Standart);
        setNftMetadata(defaultNftMetadata);
      }
    }
  }, [selectedCollection]);

  const disable = useMemo(() => {
    const disable = !selectedCollection || !nftMetadata.name || !nftMetadata.description || fileLoading;
    return disable;
  }, [nftMetadata, selectedCollection, fileLoading]);

  const createNft = async () => {
    setActionLoader(true);
    const contract = new Contracts.Contract();
    contract.setContractHash(selectedCollection.contractHash);

    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        token_owner: CLValueBuilder.key(ownerPublicKey),
        token_meta_data: CLValueBuilder.string(JSON.stringify(nftMetadata)),
      });

      const deploy = contract.callEntrypoint("mint", args, ownerPublicKey, "casper-test", "4000000000");

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", deployData, {
          headers: { "Content-Type": "application/json" },
        });
        setActionLoader(false);

        toastr.success(response.data, "Mint completed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
        navigate("/my-collections");
      } catch (error: any) {
        toastr.error("Error: " + error);
        setActionLoader(false);
      }
    } catch (error) {
      setActionLoader(false);
      toastr.error("Error: " + error);
    }
  };

  const approve = async () => {
    toastr.warning("Running this operation executes set_approve_for_all. Please make sure that you want to perform this operation.");

    try {
      if (selectedCollection) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedCollection.contractHash);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({
          token_owner: ownerPublicKey,
          approve_all: CLValueBuilder.bool(true),
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(DAPPEND_NFT_CONTRACT, "hex")))),
        });

        const deploy = contract.callEntrypoint("set_approval_for_all", args, ownerPublicKey, "casper-test", "10000000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve for all deployed successfully.");
          setLoading(false);
        } catch (error: any) {
          toastr.error("Error: " + error);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const createTimeableNft = async () => {
    if (selectedCollection.number_of_minted_tokens === 0) {
      await approve();
    }

    setActionLoader(true);

    try {
      const contract = new Contracts.Contract();
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const targetAddress = CLPublicKey.fromHex(nftMetadata.targetAddress);

      let finalMetadata: any = {
        ...nftMetadata,
        timestamp: (nftMetadata.timestamp || 0) * 1000,
      };

      const args = RuntimeArgs.fromMap({
        collection: CasperHelpers.stringToKey(selectedCollection.contractHash),
        metadata: CLValueBuilder.string(JSON.stringify(finalMetadata)),
        target_address: CLValueBuilder.key(targetAddress),
        amount: CLValueBuilder.u512(5 * 1_000_000_000),
        nft_contract_hash: new CLAccountHash(Buffer.from(DAPPEND_NFT_CONTRACT, "hex")),
      });

      const deploy = contract.install(
        new Uint8Array(timeableNftDepositWasm),
        args,
        "20000000000",
        ownerPublicKey,
        "casper-test"
        // [publicKey]
      );

      const deployJson = DeployUtil.deployToJson(deploy);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const deployData = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", deployData, {
          headers: { "Content-Type": "application/json" },
        });
        setActionLoader(false);

        toastr.success(response.data, "Mint completed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
        navigate("/my-collections");
      } catch (error: any) {
        toastr.error("Error: " + error);
        setActionLoader(false);
      }
    } catch (error) {
      setActionLoader(false);
      toastr.error("Error: " + error);
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

        setNftMetadata({
          ...nftMetadata,
          asset: fileUrl,
        });
        setFileLoading(false);
      }
    };

    storeImage();
  }, [file]);

  if (loading || actionLoading) {
    return (
      <div
        style={{
          height: "50vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {actionLoading && (
          <Typography sx={{ marginY: "2rem" }} variant="subtitle1">
            Your NFT is being created.
          </Typography>
        )}
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
          <Box sx={{ width: "100%", typography: "body1", marginTop: "2rem" }}>
            <Grid container className={classes.gridContainer}>
              <Stack spacing={4} direction={"column"} marginTop={4} className={classes.stackContainer}>
                <CustomSelect
                  value={collections.length > 0 ? selectedCollection?.contractHash || "default" : "default"}
                  label="Collection"
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
                    setNftMetadata({
                      ...nftMetadata,
                      name: e.target.value,
                    });
                  }}
                  value={nftMetadata.name}
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
                    setNftMetadata({
                      ...nftMetadata,
                      description: e.target.value,
                    });
                  }}
                  value={nftMetadata.description}
                  disable={fileLoading}
                  floor="dark"
                />
                {nftType != NFT_TYPES.Standart && (
                  <Stack>
                    {nftType == NFT_TYPES.Mergeable && (
                      <FormControlLabel
                        sx={{ justifyContent: "start", alignItems: "center", ".MuiFormControlLabel-label.Mui-disabled": { color: "gray" } }}
                        labelPlacement="start"
                        control={
                          <Switch
                            checked={nftMetadata.mergeable}
                            color="error"
                            onChange={() => {
                              setNftMetadata({ ...nftMetadata, mergeable: !nftMetadata.mergeable });
                            }}
                          />
                        }
                        label="Mergeable NFT"
                        disabled={fileLoading}
                      />
                    )}
                  </Stack>
                )}
                {nftType == NFT_TYPES.Timeable && (
                  <>
                    <CustomInput
                      placeholder="NFT Target Address"
                      label="NFT Target Address"
                      name="timableTargetAddress"
                      type="text"
                      onChange={(e: any) => {
                        setNftMetadata({
                          ...nftMetadata,

                          targetAddress: e.target.value,
                        });
                      }}
                      value={nftMetadata.targetAddress || ""}
                      disable={fileLoading}
                      floor="dark"
                    />
                    <Grid item sx={{ maxWidth: "400px" }}>
                      <CustomDateTime
                        onChange={(e: Moment) => setNftMetadata({ ...nftMetadata, timestamp: e.unix() })}
                        value={nftMetadata.timestamp}
                        dateLabel="Select end date"
                        clockLabel="Select end time"
                        theme="Dark"
                      />
                    </Grid>
                  </>
                )}
                <Grid paddingTop={2} container justifyContent={"center"}>
                  <CustomButton
                    onClick={nftMetadata.timeable ? createTimeableNft : createNft}
                    disabled={disable || nftMetadata.timeable ? nftMetadata.timestamp! <= moment().unix() : false}
                    label="Create NFT"
                  />
                </Grid>
              </Stack>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      {/* )} */}
    </>
  );
};
