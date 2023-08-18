import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import {
  CardActionArea,
  CircularProgress,
  Grid,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton, CustomButtonText } from "../../components/CustomButton";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
import CollectionCard from "../../components/CollectionCard";

const useStyles = makeStyles((theme: Theme) => ({
  titleContainer: {
    [theme.breakpoints.down("md")]: {
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  container: {
    maxWidth: "70vw",
    minWidth: "70vw",
    marginTop: "4rem",
    // backgroundColor: "darkgray",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      marginTop: "4rem",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
}));

export const MyCollections = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [loading, setLoading] = useState<boolean>(true);

  // @to-do add collection model
  const [collections, setCollections] = useState<any>([]);
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const data = await fetchCep78NamedKeys(ownerPublicKey.toAccountHashStr());
      
      const promises = data.map((data) => getNftCollection(data.key));
      
      const result = await Promise.all(promises);

      setLoading(false);
      setCollections(result);
      
    };

    init();
  }, []);

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
  };

  return (
    <div>
      <Grid
        container
        className={classes.titleContainer}
        direction={"row"}
        justifyContent={"space-between"}
      >
        <Typography className={classes.title} variant="h4">
          My Collections
        </Typography>
        <Stack direction={"row"} spacing={2}>
          <CustomButtonText
            disabled={false}
            label="My NFTs"
            onClick={() => {
              navigate("/my-nfts");
            }}
          ></CustomButtonText>
          <CustomButtonText
            disabled={false}
            label="My Collections"
            onClick={() => {
              navigate("/my-collections");
            }}
          ></CustomButtonText>
          <CustomButton
            disabled={false}
            label="Mint NFT"
            onClick={() => {
              navigate("/create-nft");
            }}
          ></CustomButton>
        </Stack>
      </Grid>
      <Grid container className={classes.container}>
        <Grid container width={"100%"} justifyContent={"flex-start"}>
          <Grid item lg={4} md={4} sm={6} xs={6}>
            <CreateCollectionCard
              onClick={() => {
                navigate("/create-collection");
              }}
            />
          </Grid>
          {collections.map((e: any) => (
            <Grid item lg={4} md={4} sm={6} xs={6}>
                <CollectionCard
                  onClick={() => navigate("/nft-list/" + e.contractHash)}
                  title={e.collection_name}
                  contractHash={e.contractHash}
                  symbol={e.collection_symbol}
                ></CollectionCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};
