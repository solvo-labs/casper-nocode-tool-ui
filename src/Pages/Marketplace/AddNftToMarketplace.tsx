import { CircularProgress, Grid, IconButton, Stack, Step, StepLabel, Stepper, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useMemo, useState } from "react";
import { CustomButton } from "../../components/CustomButton";
import { fetchCep78NamedKeys, fetchMarketplaceData, getNftCollection, getNftMetadata, storeListing } from "../../utils/api";
import { CasperHelpers, getMetadataImage } from "../../utils";
import { DONT_HAVE_ANYTHING, FETCH_IMAGE_TYPE } from "../../utils/enum";
// @ts-ignore
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey } from "casper-js-sdk";
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
    minWidth: "70vw",
    justifyContent: "center",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      maxWidth: "90vw",
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

  const handleNext = () => {
    toastr.info("Before listing, you must approve the marketplace for the NFT to be listed. Please make sure you do this");
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    if (activeStep == 0) {
      fetchNft();
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const addWhiteList = async (contract: any, ownerPublicKey: any) => {
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

        await addWhiteList(contract, ownerPublicKey);

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
          console.log(marketplaceHash, selectedCollection, selectedNftIndex, price, nftData[selectedNftIndex], Number(parseInt(marketplaceData.listingCount.hex)));
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
      const imagePromises = result.map((e: any) => getMetadataImage(e.json_schema, FETCH_IMAGE_TYPE.COLLECTION));
      const images = await Promise.all(imagePromises);
      const finalData = result.map((e: any, index: number) => {
        return {
          ...e,
          image: images[index],
        };
      });

      const marketplaceData = await fetchMarketplaceData(marketplaceHash || "");

      setMarketPlaceData(marketplaceData);
      setLoading(false);
      console.log(finalData);
      setCollections(finalData);
    };

    init();
  }, []);

  const fetchNft = async () => {
    setLoading(true);
    if (selectedCollection) {
      const nftCollection = await getNftCollection(selectedCollection);

      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(selectedCollection, index.toString()));
      }

      const nftMetas = await Promise.all(promises);
      const imagePromises = nftMetas.map((e: any) => getMetadataImage(e, FETCH_IMAGE_TYPE.NFT));
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      setNftData(finalData);
      console.log("nft", finalData);

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

      <Grid container justifyContent={"center"} marginY={"2rem"}></Grid>

      {activeStep === 0 && (
        <>
          <h2 style={{ marginTop: 0 }}>Choose a collection</h2>
          <Grid container marginY={"2rem"}>
            {collections.map((e: any, index: number) => (
              <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                <CollectionCardAlternate
                  image={"/public/" + e.image}
                  onClick={() => setSelectedCollection(e.contractHash)}
                  title={"Name: " + e.collection_name}
                  contractHash={e.contractHash}
                  symbol={""}
                  cardHeight={""}
                  mediaHeight={""}
                  cardContentPadding={""}
                  cardContentTitle={""}
                  cardContentSymbol={""}
                  cardContentContractHash={""}
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
        </>
      )}
      {activeStep === 1 && (
        <>
          <Grid container marginY={"2rem"}>
            {nftData.map((e: any, index: number) => (
              <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
                <NftCard
                  description={e.description}
                  name={e.name}
                  imageURL={e.imageURL}
                  onClick={() => {
                    setSelectedNftIndex(index);
                  }}
                  index={index}
                ></NftCard>
              </Grid>
            ))}
          </Grid>
          <Grid container width={"100%"}>
            <Stack width={"100%"} direction={"row"} justifyContent={"space-evenly"}>
              <CustomButton disabled={false} label="Back" onClick={handleBack}></CustomButton>
              <CustomButton disabled={false} label={"Next"} onClick={handleNext}></CustomButton>
            </Stack>
          </Grid>
        </>
      )}
      {activeStep === steps.length && (
        <Grid container direction={"column"} display={"flex"} justifyContent={"center"} justifyItems={"center"} alignContent={"center"}>
          <Stack spacing={"2rem"}>
            <Grid item className={classes.text}>
              <Typography>{selectedCollection}</Typography>
            </Grid>
            <Grid item className={classes.text}>
              <Typography>Nft Index: {selectedNftIndex}</Typography>
            </Grid>
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
            <Grid item className={classes.text}>
              <CustomButton disabled={!(selectedCollection && selectedNftIndex !== undefined && price > 0)} label="Create Listing" onClick={addListing}></CustomButton>
            </Grid>
          </Stack>
        </Grid>
      )}
    </Grid>
  );
};

export default AddNftToMarketplace;
