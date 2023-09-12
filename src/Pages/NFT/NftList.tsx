import { useEffect, useState } from "react";
import { getNftCollection, getNftMetadata } from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { NftCard } from "../../components/NftCard";
import { makeStyles } from "@mui/styles";
import { getMetadataImage } from "../../utils";
import { NFT } from "../../utils/types";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
// import { CollectionMetada } from "../../utils/types";

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

export const NftList = () => {
  const params = useParams();
  const nftCollectionHash = params.collectionHash;
  const [nftData, setNftData] = useState<NFT[]>([]);
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(true);
  const [collectionData, setCollectionData] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (nftCollectionHash) {
        const nftCollection = await getNftCollection(nftCollectionHash);

        setCollectionData(nftCollection);

        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(nftCollectionHash, index.toString()));
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
        setLoading(false);
      }
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

  console.log(nftData);

  return (
    <Grid container direction={"column"}>
      <Grid container className={classes.titleContainer}>
        <Typography variant="h4" className={classes.title}>
          {collectionData?.collection_name} Collection {parseInt(collectionData.number_of_minted_tokens.hex) + "/" + parseInt(collectionData.total_token_supply.hex)}
        </Typography>
      </Grid>

      <Grid container className={classes.container}>
        {nftData.map((e: any, index: number) => (
          <Grid item lg={3} md={3} sm={4} xs={6}>
            <NftCard description={e.description} name={e.name} imageURL={e.imageURL} index={index + 1}></NftCard>
          </Grid>
        ))}
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <CreateCollectionCard
            text="ADD NFT"
            onClick={() => {
              navigate("/create-nft/" + nftCollectionHash);
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
