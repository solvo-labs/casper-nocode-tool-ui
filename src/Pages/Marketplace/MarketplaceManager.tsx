import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { NftCard } from "../../components/NftCard";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import { CollectionMetada } from "../../utils/types";

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
      maxWidth: "90vw",
      //   marginTop: "4rem",
    },
  },
}));

const MarketplaceManager = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { marketplaceHash } = useParams();
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [loading, setLoading] = useState<boolean>(false);
  // const [collections, setCollections] = useState<CollectionMetada[] | any>([]);

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
    <Grid container direction={"column"} className={classes.container}>
      <Grid item className={classes.container}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h4">Demo Marketplace</Typography>
          <Stack direction={"row"} spacing={2}>
            <CustomButton disabled={false} label="Add Whitelist" onClick={() => {}}></CustomButton>
            <CustomButton disabled={false} label="Add NFT to Marketplace" onClick={() => navigate("/add-nft-to-marketplace/" + marketplaceHash)}></CustomButton>
          </Stack>
        </Stack>
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Typography variant="h5">Non Approved NFT's</Typography>
      </Grid>
      <Grid container>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5">Listed NFT</Typography>
      </Grid>
      <Grid container>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={"sadasd"} name={"asdasd"} imageURL={"asdas"} index={0}></NftCard>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MarketplaceManager;
