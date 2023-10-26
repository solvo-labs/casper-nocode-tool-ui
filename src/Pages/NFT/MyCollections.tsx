import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchCep78NamedKeys, getAllNftsByOwned, getNftCollection } from "../../utils/api";
import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
import CollectionCard from "../../components/CollectionCard";
import { CollectionMetada } from "../../utils/types";
import { removeDuplicates } from "../../utils";

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
    // marginTop: "4rem",
    marginBottom: "2rem",
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
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();

      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const ownedCollections = await Promise.all(promises);

      const incomingData = await getAllNftsByOwned(accountHash);
      const incomingCollections = incomingData.map((ic: any) => "hash-" + ic.collection);
      const uniqueIncomings = removeDuplicates(incomingCollections);

      const missingCollectionPromises: any = [];

      uniqueIncomings.forEach((uc) => {
        if (ownedCollections.findIndex((oc: any) => oc.contractHash === uc) < 0) {
          missingCollectionPromises.push(getNftCollection(uc, false));
        }
      });

      if (missingCollectionPromises.length > 0) {
        const missingCollections = await Promise.all(missingCollectionPromises);
        setCollections([...ownedCollections, ...missingCollections]);
      } else {
        setCollections(ownedCollections);
      }

      setLoading(false);
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
  }

  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.titleContainer} direction={"row"} justifyContent={"space-between"}>
        <Typography className={classes.title} variant="h4">
          My Collections
        </Typography>
        <Stack direction={"row"} spacing={2}>
          <CustomButton
            disabled={false}
            label="Mint NFT"
            onClick={() => {
              navigate("/create-nft");
            }}
          ></CustomButton>
        </Stack>
      </Grid>
      <Grid container sx={{ marginTop: "2rem" }}>
        <Grid container width={"100%"} justifyContent={"flex-start"}>
          <Grid item lg={4} md={4} sm={6} xs={6}>
            <CreateCollectionCard
              onClick={() => {
                navigate("/create-collection");
              }}
            />
          </Grid>
          {collections.map((e: any, index: number) => (
            <Grid item lg={4} md={4} sm={6} xs={6} key={index}>
              <CollectionCard
                cardHeight={"360px"}
                mediaHeight={"200px"}
                cardContentPadding={"1rem"}
                cardContentTitle={"24px"}
                cardContentSymbol={"20px"}
                cardContentContractHash={"14px"}
                image={"/images/casper.png"}
                onClick={() => navigate("/nft-list/" + e.contractHash)}
                title={e.collection_name}
                contractHash={e.contractHash}
                symbol={e.collection_symbol}
                amICreator={e.amICreator}
                tokenCountText={parseInt(e.number_of_minted_tokens.hex, 16) + " / " + parseInt(e.total_token_supply.hex, 16)}
              ></CollectionCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};
