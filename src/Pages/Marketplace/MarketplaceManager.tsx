import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { NftCard } from "../../components/NftCard";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCep78NamedKeys, getNftCollection, getNftMetadata } from "../../utils/api";
import { CollectionMetada } from "../../utils/types";
import { getMetadataImage } from "../../utils";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [nftData, setNftData] = useState<any>();
  // const [collections, setCollections] = useState<CollectionMetada[] | any>([]);

  const demo = localStorage.getItem("listing");
  const parsedData = JSON.parse(demo || "");

  useEffect(() => {
    if (parsedData) {
      const init = async () => {
        const nftdata = await getNftMetadata(parsedData.collection, parsedData.token_id);
        const image = await getMetadataImage(nftdata.imageURL, FETCH_IMAGE_TYPE.NFT);

        setNftData({ ...nftdata, image });
        setLoading(false);
      };

      init();
    }
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
        <Typography variant="h5">List of NFT's</Typography>
      </Grid>
      <Grid container>
        <Grid item lg={3} md={4} sm={6} xs={6}>
          <NftCard description={nftData.description} name={nftData.name} imageURL={nftData.image} price={parsedData.price} index={0}></NftCard>
          <div style={{ display: "flex", alignItems: "center ", justifyContent: "center" }}>
            <CustomButton onClick={undefined} label={"BUY THIS NFT"} disabled={false}></CustomButton>
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MarketplaceManager;
