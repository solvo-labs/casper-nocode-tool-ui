import { useEffect, useMemo, useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { SERVER_API, fetchCep78NamedKeys, getNftCollectionDetails } from "../../utils/api";
import axios from "axios";
import toastr from "toastr";
import { NFT } from "../../utils/types";
import { Box, CircularProgress, Divider, FormControlLabel, Grid, MenuItem, SelectChangeEvent, Stack, Switch, Tab, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import ImageUpload from "../../components/ImageUpload";
import { NFTStorage } from "nft.storage";
import { CustomSelect } from "../../components/CustomSelect";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { CustomDateTime } from "../../components/CustomDateTime";
import moment, { Moment } from "moment";
import { BurnMode, MetadataMutability, MintingMode, OwnerReverseLookupMode } from "../../utils/enum";
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
      mergable: false,
      timeable: false,
      endTime: moment().unix(),
    },
  });

  const [file, setFile] = useState<any>();
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoader] = useState<boolean>(false);
  const [collections, setCollections] = useState<any>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>();
  const [tablValue, setTabValue] = useState("1");

  const [switchValue, setSwitchValue] = useState<{ mergable: boolean; timable: boolean }>({
    mergable: false,
    timable: false,
  });

  const navigate = useNavigate();

  const handleClear = () => {
    setFile(null);
    setNftData({ ...nftData, tokenMetaData: { ...nftData.tokenMetaData, asset: "" } });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
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
        console.log(result);

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

  useEffect(() => {
    const init = () => {
      if (selectedCollection) {
        if (selectedCollection.reporting_mode != OwnerReverseLookupMode.Complate) {
          nftData.tokenMetaData.timeable = false;
          setSwitchValue({ ...switchValue, timable: true });
        } else {
          setSwitchValue({ ...switchValue, timable: false });
          nftData.tokenMetaData.mergable = true;
          nftData.tokenMetaData.timeable = false;
        }
      }
    };
    init();
  }, [selectedCollection]);

  const createNft = async () => {
    setActionLoader(true);
    const contract = new Contracts.Contract();
    contract.setContractHash(selectedCollection.contractHash);

    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const args = RuntimeArgs.fromMap({
        token_owner: CLValueBuilder.key(ownerPublicKey),
        token_meta_data: CLValueBuilder.string(JSON.stringify(nftData.tokenMetaData)),
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
        // navigate("/my-collections");
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
            <TabContext value={tablValue}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  sx={{
                    "& .Mui-selected": {
                      outline: "none",
                    },
                    "& .MuiTab-root": {
                      color: "gray",
                      "&.Mui-selected": {
                        color: "red !important",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "red",
                    },
                  }}
                  onChange={handleTabChange}
                >
                  <Tab label="Standart NFT" value="1" />
                  <Tab label="Custom NFT" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1">
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
                    <Grid paddingTop={2} container justifyContent={"center"}>
                      <CustomButton onClick={createNft} disabled={disable} label="Create NFT" />
                    </Grid>
                  </Stack>
                </Grid>
              </TabPanel>
              <TabPanel value="2">
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
                      {collections
                        .filter(
                          (col: any) => col.metadata_mutability == MetadataMutability.Immutable && col.minting_mode == MintingMode.Public && col.burn_mode == BurnMode.Burnable
                        )
                        .map((tk: any) => {
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
                      disable={fileLoading || switchValue.mergable}
                      floor="dark"
                    ></CustomInput>
                    <Stack>
                      <FormControlLabel
                        sx={{ justifyContent: "start", alignItems: "center", ".MuiFormControlLabel-label.Mui-disabled": { color: "gray" } }}
                        labelPlacement="start"
                        control={
                          <Switch
                            checked={nftData.tokenMetaData.mergable}
                            color="error"
                            onChange={() => {
                              const clonedData = { ...nftData };
                              if (selectedCollection.reporting_mode == OwnerReverseLookupMode.Complate) {
                                setNftData((prevNftData) => ({
                                  ...prevNftData,
                                  tokenMetaData: {
                                    ...prevNftData.tokenMetaData,
                                    mergable: !clonedData.tokenMetaData.mergable,
                                    timeable: clonedData.tokenMetaData.mergable,
                                  },
                                }));
                              } else {
                                clonedData.tokenMetaData.mergable = !clonedData.tokenMetaData.mergable;
                                setNftData(clonedData);
                              }
                            }}
                          />
                        }
                        label="Mergeable NFT"
                        disabled={fileLoading || switchValue.mergable}
                      />
                      <FormControlLabel
                        sx={{ justifyContent: "start", alignItems: "center", ".MuiFormControlLabel-label.Mui-disabled": { color: "gray" } }}
                        labelPlacement="start"
                        control={
                          <Switch
                            disabled={true}
                            checked={nftData.tokenMetaData.timeable}
                            color="error"
                            onChange={() => {
                              const clonedData = { ...nftData };
                              if (selectedCollection.reporting_mode == OwnerReverseLookupMode.Complate) {
                                setNftData((prevNftData) => ({
                                  ...prevNftData,
                                  tokenMetaData: {
                                    ...prevNftData.tokenMetaData,
                                    mergable: clonedData.tokenMetaData.timeable,
                                    timeable: !clonedData.tokenMetaData.timeable,
                                  },
                                }));
                              } else {
                                clonedData.tokenMetaData.timeable = !clonedData.tokenMetaData.timeable;

                                setNftData(clonedData);
                              }
                            }}
                          />
                        }
                        label="Timeable NFT"
                        disabled={fileLoading || switchValue.timable}
                      />
                    </Stack>
                    {nftData.tokenMetaData.timeable && (
                      <>
                        <CustomInput
                          placeholder="Timable Target Address"
                          label="Timable Target Address"
                          name="timableTargetAddress"
                          type="text"
                          onChange={(e: any) => {
                            // setNftData({
                            //   ...nftData,
                            //   tokenMetaData: {
                            //     ...nftData.tokenMetaData,
                            //     description: e.target.value,
                            //   },
                            // });
                          }}
                          value={"nftData.tokenMetaData.targetAddres"}
                          disable={fileLoading}
                          floor="dark"
                        ></CustomInput>
                        <Grid item sx={{ maxWidth: "400px" }}>
                          <CustomDateTime
                            onChange={(e: Moment) => setNftData({ ...nftData, tokenMetaData: { ...nftData.tokenMetaData, endTime: e.unix() } })}
                            value={nftData.tokenMetaData.endTime}
                            dateLabel="Select end date"
                            clockLabel="Select end time"
                            theme="Dark"
                          ></CustomDateTime>
                        </Grid>
                      </>
                    )}
                    <Grid paddingTop={2} container justifyContent={"center"}>
                      <CustomButton
                        onClick={createNft}
                        disabled={disable || nftData.tokenMetaData.timeable ? nftData.tokenMetaData.endTime! <= moment().unix() : false}
                        label="Create Custom NFT"
                      />
                    </Grid>
                  </Stack>
                </Grid>
              </TabPanel>
            </TabContext>
          </Box>
        </Grid>
      </Grid>
      {/* )} */}
    </>
  );
};
