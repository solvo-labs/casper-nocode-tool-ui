import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  // FormControl,
  Grid,
  // InputLabel,
  // MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { CollectionCardAlternate } from "../../components/CollectionCard";
import {
  fetchCep78NamedKeys,
  getNftCollection,
  getNftMetadata,
} from "../../utils/api";
import { getMetadataImage } from "../../utils";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
const {
  RuntimeArgs,
  CLValueBuilder,
  Contracts,
  CLPublicKey,
  DeployUtil,
} = require("casper-js-sdk");
import { CollectionMetada, NFT } from "../../utils/types";
import { NftCard } from "../../components/NftCard";
import toastr from "toastr";
import axios from "axios";
import { SERVER_API } from "../../utils/api";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "70vw",
    minWidth: "70vw",
    justifyContent: "center",
    // marginTop: "4rem",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      maxWidth: "90vw",
      marginTop: "4rem",
    },
  },
  center: {
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
  stackContainer: {
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
  stepperTitle: {
    // "& .MuiStepLabel-active": { color: "red" },
    // "& .MuiStepLabel-completed": { color: "green" },
    // "& .Mui-disabled .MuiStepIcon-root": { color: "cyan" },
    "& .MuiStepLabel-label.Mui-active": { color: "white" },
    "& .MuiStepLabel-label": { color: "gray" },
    "& .MuiStepLabel-label.Mui-completed": { color: "red" },
  },
}));

const steps = ["Select Collection", "Select the NFT to load"];

const AddNFTtoMarketplace = () => {
  const classes = useStyles();
  const [publicKey, provider, , , , ] = useOutletContext<[publicKey:string, provider:any, wasm:any, nftWasm:any, collectionWasm:any, marketplaceWasm:any]>();
  const [activeStep, setActiveStep] = React.useState(0);
  // const navigate = useNavigate();
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [loading, setLoading] = useState<boolean>(true);
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nftData, setNftData] = useState<NFT[] | any>([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>();

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
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

    console.log(selectedCollection);
    console.log(selectedNftIndex);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
    console.log(selectedCollection);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const data = await fetchCep78NamedKeys(ownerPublicKey.toAccountHashStr());

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);
      const imagePromises = result.map((e: any) =>
        getMetadataImage(e.json_schema, FETCH_IMAGE_TYPE.COLLECTION)
      );
      const images = await Promise.all(imagePromises);
      const finalData = result.map((e: any, index: number) => {
        return {
          ...e,
          image: images[index],
        };
      });

      setLoading(false);
      console.log(finalData);
      setCollections(finalData);
    };

    init();
  }, []);

  // useEffect(() => {
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
      const imagePromises = nftMetas.map((e: any) =>
        getMetadataImage(e, FETCH_IMAGE_TYPE.NFT)
      );
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      setNftData(finalData);
      setLoading(false);
    }
  };

  // init();
  // }, [activeStep, selectedCollection]);

  const addListing = async () => {
    try {
      const contract = new Contracts.Contract();
      contract.setContractHash(
        "hash-ff84a99cfb1cd08f4c4df628d02c5fec71b5f12dc058434414f13aa1e221e287"
      );
      const args = RuntimeArgs.fromMap({
        collection: CLValueBuilder.key(selectedCollection),
        token_id: CLValueBuilder.u64(selectedNftIndex),
        price: CLValueBuilder.u256(75 * 1_000_000_000),
      });
      const deploy = contract.callEntrypoint(
        "add_listing",
        args,
        publicKey,
        "casper-test",
        "10000000000"
      );
      const deployJson = DeployUtil.deployToJson(deploy);
      console.log("deployjson", deployJson);

      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        let signedDeploy = DeployUtil.setSignature(
          deploy,
          sign.signature,
          publicKey
        );
        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        const data = DeployUtil.deployToJson(signedDeploy.val);
        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Nft added to Marketplace successfully.");
        console.log(response.data);

      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
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

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <Typography className={classes.title} variant="h5">
          Add your NFT to Marketplace
        </Typography>
      </Grid>
      <Grid item width={"80%"} marginTop={"4rem"}>
        <Stepper
          activeStep={activeStep}
          sx={{ color: "white" }}
          className={classes.stepperTitle}
        >
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

      <Grid container justifyContent={"center"} marginY={"2rem"}>
        {activeStep === steps.length && <>dasdas</>}
        {activeStep === 0 && (
          <Grid container marginY={"2rem"}>
            {collections.map((e: any) => (
              <Grid item lg={3} md={3} sm={6} xs={6}>
                <CollectionCardAlternate
                  image={e.image}
                  onClick={() => setSelectedCollection(e.contractHash)}
                  title={e.collection_name}
                  contractHash={e.contractHash}
                  symbol={e.collection_symbol}
                ></CollectionCardAlternate>
              </Grid>
            ))}
          </Grid>
        )}
        {activeStep === 1 && (
          <Grid container marginY={"2rem"}>
            {nftData.map((e: any, index: number) => (
              <Grid item lg={3} md={3} sm={6} xs={6}>
                <NftCard
                  description={e.description}
                  name={e.name}
                  imageURL={e.imageURL}
                  onClick={() => {
                    const reindex = index + 1;
                    setSelectedNftIndex(reindex);
                  }}
                ></NftCard>
              </Grid>
            ))}
          </Grid>
        )}
        <Grid container width={"100%"}>
          <Stack
            width={"100%"}
            direction={"row"}
            justifyContent={"space-evenly"}
          >
            <CustomButton
              disabled={activeStep === 0}
              label="Back"
              onClick={handleBack}
            ></CustomButton>
            <CustomButton
              disabled={false}
              label={activeStep === steps.length - 1 ? "Finish" : "Next"}
              onClick={handleNext}
            ></CustomButton>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default AddNFTtoMarketplace;
