import { Card, CardContent, Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CollectionMetada } from "../utils/types";
import React from "react";
import CollectionCard from "./CollectionCard";
import { CustomButton } from "./CustomButton";

const useStyles = makeStyles(() => ({
  card: {
    borderRadius: "16px !important",
    border: "1px solid rgba(255, 255, 255, 0.36) !important",
    background: "linear-gradient(109deg, rgba(255, 255, 255, 0.40) 2.16%, rgba(255, 255, 255, 0.10) 100%) !important",
    boxShadow: "0px 4px 24px -1px rgba(0, 0, 0, 0.20) !important",
    backdropFilter: "blur(20px) !important",
    paddingRight: "20px !important",
    paddingLeft: "20px !important",
    paddingTop: "40px !important",
    paddingBottom: "40px !important",
  },
  title: {
    color: "white",
    fontWeight: "bold !important",
    fontSize: "1.5rem !important",
  },
}));

type Props = {
  collections: CollectionMetada[];
  handleCreateCollection: () => void;
  handleCollectionDetail: (contractHash: string) => void;
};

const CollectionListMainMenu: React.FC<Props> = ({ collections, handleCollectionDetail, handleCreateCollection }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title}>My Collections</Typography>
        {collections.length > 0 && (
          <Grid container marginTop={"1rem"}>
            {collections.slice(0, 6).map((e: any, index: number) => (
              <Grid item xl={3} lg={4} md={6} sm={6} xs={12} key={index}>
                <CollectionCard
                  cardHeight={"24rem"}
                  mediaHeight={"200px"}
                  cardContentPadding={"1rem"}
                  cardContentTitle={"1.2rem"}
                  cardContentContractHash={"14px"}
                  image={"/images/casper.png"}
                  onClick={() => handleCollectionDetail(e.contractHash)}
                  title={e.collection_name}
                  contractHash={e.contractHash}
                  symbol={e.collection_symbol}
                  amICreator={e.amICreator}
                  tokenCountText={parseInt(e.number_of_minted_tokens.hex, 16) + " / " + parseInt(e.total_token_supply.hex, 16)}
                ></CollectionCard>
              </Grid>
            ))}
          </Grid>
        )}
        {collections.length <= 0 && (
          <Grid container display={"flex"} alignContent={"center"} direction={"column"} marginTop={4}>
            <Typography className={classes.title}>You have not an any Collection</Typography>
            <Grid item marginTop={"2rem"} display={"flex"} justifyContent={"center"}>
              <CustomButton disabled={false} label="Create Collection" onClick={handleCreateCollection}></CustomButton>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default CollectionListMainMenu;
