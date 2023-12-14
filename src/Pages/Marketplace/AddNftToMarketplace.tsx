import { CircularProgress, Grid, Stack, Step, StepLabel, Stepper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { fetchCep78NamedKeys, fetchMarketplaceData, fetchMarketplaceWhitelistData, getNftCollection, getNftMetadata, storeListing } from "../../utils/api";
import { CasperHelpers } from "../../utils";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";
// @ts-ignore
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey, CLKey, CLByteArray } from "casper-js-sdk";
import { CollectionMetada, NFT } from "../../utils/types";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CollectionCardAlternate } from "../../components/CollectionCard";
import { NftCard } from "../../components/NftCard";
import toastr from "toastr";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { CustomInput } from "../../components/CustomInput";
import CreatorRouter from "../../components/CreatorRouter";

const steps = ["Select Collection", "Select the NFT to load"];

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "70vw",
    // minWidth: "70vw",
    justifyContent: "center",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      // maxWidth: "90vw",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
  stepperTitle: {
    // "& .MuiStepLabel-active": { color: "red" },
    // "& .MuiStepLabel-completed": { color: "green" },
    // "& .Mui-disabled .MuiStepIcon-root": { color: "cyan" },
    "& .MuiStepLabel-label.Mui-active": { color: "white" },
    "& .MuiStepLabel-label": { color: "gray" },
    "& .MuiStepLabel-label.Mui-completed": { color: "red" },
  },
  text: {
    display: "flex !important",
    justifyContent: "center !important",
  },
}));

const AddNftToMarketplace = () => {
  const classes = useStyles();
  const { marketplaceHash } = useParams();

  const [publicKey, provider] = useOutletContext<[publicKey: string, provider: any]>();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [nftData, setNftData] = useState<NFT[] | any>([]);
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(0);
  const [marketplaceData, setMarketPlaceData] = useState<any>();
  const navigate = useNavigate();

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const approve = async () => {
    try {
      if (selectedCollection && marketplaceHash) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedCollection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const operatorHash = marketplaceHash.replace("hash-", "");

        const args = RuntimeArgs.fromMap({
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(operatorHash, "hex")))),
          token_id: CLValueBuilder.u64(selectedNftIndex),
        });

        const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "10000000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve deployed successfully.");
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (error) {
      toastr.error("Error: " + error);
    }
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    if (activeStep == 0) {
      fetchNft();
    }

    if (activeStep == 1) {
      toastr.info("Before listing, you must to  approve the marketplace for the NFT to be listed. Please sign this transaction");

      approve();
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const addWhiteList = async () => {
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);
    const contract = new Contracts.Contract();
    contract.setContractHash(marketplaceHash);

    const whitelistArgs = RuntimeArgs.fromMap({
      collection: CasperHelpers.stringToKey(selectedCollection.slice(5)),
    });

    const deployWhitelist = contract.callEntrypoint("whitelist", whitelistArgs, ownerPublicKey, "casper-test", "10000000000");
    const deployJsonWhitelist = DeployUtil.deployToJson(deployWhitelist);

    try {
      const sign = await provider.sign(JSON.stringify(deployJsonWhitelist), publicKey);
      let signedDeploy = DeployUtil.setSignature(deployWhitelist, sign.signature, ownerPublicKey);
      signedDeploy = DeployUtil.validateDeploy(signedDeploy);
      const data = DeployUtil.deployToJson(signedDeploy.val);
      const response = await axios.post(SERVER_API + "deploy", data, {
        headers: { "Content-Type": "application/json" },
      });

      toastr.success(response.data, "Whitelist added successfully.");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const addListing = async () => {
    setLoading(true);
    if (marketplaceHash) {
      try {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        contract.setContractHash(marketplaceHash);

        const args = RuntimeArgs.fromMap({
          collection: CasperHelpers.stringToKey(selectedCollection.slice(5)),
          token_id: CLValueBuilder.u64(selectedNftIndex),
          price: CLValueBuilder.u256(price * 1_000_000_000),
        });

        const deploy = contract.callEntrypoint("add_listing", args, ownerPublicKey, "casper-test", "10000000000");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });
          // console.log(marketplaceHash, selectedCollection, selectedNftIndex, price, nftData[selectedNftIndex], Number(parseInt(marketplaceData.listingCount.hex)));
          await storeListing(marketplaceHash, selectedCollection, selectedNftIndex, price, nftData[selectedNftIndex], Number(parseInt(marketplaceData.listingCount.hex)));

          toastr.success(response.data, "Listing created successfully.");
          navigate("/marketplace");
          setLoading(false);
        } catch (error: any) {
          toastr.error("Error: " + error.message);
        }
      } catch (error) {
        toastr.error("Error: " + error);
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);

      const marketplaceData = await fetchMarketplaceData(marketplaceHash || "");

      setMarketPlaceData(marketplaceData);
      setLoading(false);
      setCollections(result);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchNft = async () => {
    setLoading(true);
    if (selectedCollection) {
      const nftCollection = await getNftCollection(selectedCollection);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();

      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(selectedCollection, index.toString(), accountHash.slice(13)));
      }

      const nftMetas = await Promise.all(promises);

      const whiteListInfo = await fetchMarketplaceWhitelistData(marketplaceHash || "", selectedCollection.slice(5));
      console.log(whiteListInfo);
      if (whiteListInfo != true) {
        toastr.warning("You must to add whitelist to this marketplace. Please confirm this transaction.");
        addWhiteList();
      }

      setNftData(nftMetas.filter((nf) => nf.burnt === false));
      setLoading(false);
    }
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

  if (!collections.length) {
    return <CreatorRouter explain={DONT_HAVE_ANYTHING.COLLECTION} handleOnClick={() => navigate("/create-collection")}></CreatorRouter>;
  }

  if (!nftData.length && activeStep == 1) {
    return <CreatorRouter explain={DONT_HAVE_ANYTHING.NFT} handleOnClick={() => navigate("/create-nft")}></CreatorRouter>;
  }

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography className={classes.title} variant="h5">
          Add your NFT to Marketplace
        </Typography>
      </Grid>
      <Grid item width={"80%"} marginTop={"4rem"}>
        <Stepper activeStep={activeStep} sx={{ color: "white" }} className={classes.stepperTitle}>
          {steps.map((label, index) => {
            const stepProps: { completed?: boolean } = {};
            const labelProps: {
              optional?: React.ReactNode;
            } = {};
            if (isStepSkipped(index)) {
              stepProps.completed = false;
            }
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Grid>
      {activeStep === 0 && (
        <Grid container marginTop={"4rem"} justifyContent={"center"}>
          <Grid item>
            <Typography variant="h4" fontWeight={"bold"}>
              Choose a collection
            </Typography>
          </Grid>
          <Grid container marginY={"2rem"}>
            {collections.map((e: any, index: number) => (
              <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                <CollectionCardAlternate
                  image={"/images/casper.png"}
                  onClick={() => setSelectedCollection(e.contractHash)}
                  title={e.collection_name}
                  contractHash={e.contractHash}
                  symbol={e.collection_symbol}
                  cardHeight={""}
                  mediaHeight={""}
                  cardContentPadding={""}
                  cardContentTitle={""}
                  cardContentSymbol={""}
                  cardContentContractHash={""}
                  tokenCountText={parseInt(e.number_of_minted_tokens.hex).toString() + "/" + parseInt(e.total_token_supply.hex).toString()}
                ></CollectionCardAlternate>
              </Grid>
            ))}
          </Grid>
          <Grid container width={"100%"}>
            <Stack width={"100%"} direction={"row"} justifyContent={"space-evenly"}>
              <CustomButton disabled={activeStep === 0} label="Back" onClick={handleBack}></CustomButton>
              <CustomButton disabled={!selectedCollection} label={"Next"} onClick={handleNext}></CustomButton>
            </Stack>
          </Grid>
        </Grid>
      )}
      {activeStep === 1 && (
        <Grid container marginTop={"4rem"} justifyContent={"center"}>
          <Grid item>
            <Typography variant="h4" fontWeight={"bold"}>
              Choose a NFT
            </Typography>
          </Grid>
          <Grid container marginY={"2rem"}>
            {nftData
              .filter((fltr: any) => fltr.isMyNft)
              .map((e: any) => (
                <Grid item lg={4} md={4} sm={6} xs={6} key={e.index}>
                  <NftCard
                    description={e.description}
                    name={e.name}
                    asset={e.asset}
                    onClick={() => {
                      setSelectedNftIndex(e.index);
                    }}
                    index={e.index}
                    amIOwner={e.isMyNft}
                    isSelected={selectedNftIndex == e.index}
                  />
                </Grid>
              ))}
          </Grid>
          <Grid container width={"100%"}>
            <Stack width={"100%"} direction={"row"} justifyContent={"space-evenly"}>
              <CustomButton disabled={false} label="Back" onClick={handleBack}></CustomButton>
              <CustomButton disabled={selectedNftIndex == undefined} label={"Next"} onClick={handleNext}></CustomButton>
            </Stack>
          </Grid>
        </Grid>
      )}
      {activeStep === steps.length && (
        <Grid container>
          <Stack spacing={"2rem"} width={"100%"}>
            <Grid item className={classes.text}>
              {collections.map((col: any, index: number) => {
                if (col.contractHash == selectedCollection) {
                  return (
                    <Grid container marginTop={"2rem"} justifyContent={"center"} key={index}>
                      <Typography variant="h5">
                        Selected collection:
                        <b>
                          {col.collection_name} ({col.collection_symbol})
                        </b>
                      </Typography>
                    </Grid>
                  );
                }
              })}
            </Grid>
            <Grid container justifyContent={"center"}>
              <Grid item lg={4} md={4} sm={6} xs={8}>
                <NftCard
                  asset={nftData[selectedNftIndex].asset}
                  description={nftData[selectedNftIndex].description}
                  index={selectedNftIndex}
                  name={nftData[selectedNftIndex].name}
                  amIOwner={nftData[selectedNftIndex].isMyNft}
                ></NftCard>
              </Grid>
            </Grid>
            <Grid display={"flex"} justifyContent={"center"}>
              <CustomInput
                placeholder="Price (CSPR)"
                label="Price (CSPR)"
                id="price"
                name="price"
                type="text"
                onChange={(e: any) => {
                  setPrice(e.target.value);
                }}
                value={price}
              ></CustomInput>
            </Grid>
            <Stack direction={"row"} display={"flex"} justifyContent={"space-evenly"}>
              <CustomButton disabled={false} label="Back" onClick={handleBack}></CustomButton>
              <CustomButton disabled={!(selectedCollection && selectedNftIndex !== undefined && price > 0)} label="Create Listing" onClick={addListing}></CustomButton>
            </Stack>
          </Stack>
        </Grid>
      )}
    </Grid>
  );
};

export default AddNftToMarketplace;
