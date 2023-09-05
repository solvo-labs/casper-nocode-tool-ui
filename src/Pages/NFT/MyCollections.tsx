import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { collectionImage, fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
import CollectionCard from "../../components/CollectionCard";
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

  // const [imageLinks, setImageLinks] = useState<string[]>([]);

  // @to-do add collection model
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const classes = useStyles();
  const navigate = useNavigate();

  const getMetadataImage = async (metadata: any) => {
    try {
      let imageLink: string;
      const parsedData = JSON.parse(metadata.json_schema);
      if (parsedData.imageURL && parsedData.imageURL.startsWith("https://ipfs.io/ipfs/")) {
        const result = await collectionImage(parsedData.imageURL);
        imageLink = result;
        return result;
      } else {
        imageLink = "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";
      }
      return Promise.resolve(imageLink);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return "https://w0.peakpx.com/wallpaper/237/346/HD-wallpaper-gt-r-nissan-japanese-car-cartoon.jpg";
    }
  };

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const data = await fetchCep78NamedKeys(ownerPublicKey.toAccountHashStr());

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);
      const imagePromises = result.map((e: any) => getMetadataImage(e));
      const images = await Promise.all(imagePromises);
      const finalData = result.map((e: any, index: number) => {
        return {
          ...e,
          image: images[index],
        };
      });

      setLoading(false);
      setCollections(finalData);
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
          {/* <CustomButtonText
            disabled={false}
            label="My NFTs"
            onClick={() => {
              navigate("/my-nfts");
            }}
          ></CustomButtonText> */}
          {/* <CustomButtonText
            disabled={false}
            label="My Collections"
            onClick={() => {
              navigate("/my-collections");
            }}
          ></CustomButtonText> */}
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
          {collections.map((e: any) => (
            <Grid item lg={4} md={4} sm={6} xs={6}>
              <CollectionCard
                image={e.image}
                onClick={() => navigate("/nft-list/" + e.contractHash)}
                title={e.collection_name}
                contractHash={e.contractHash}
                symbol={e.collection_symbol}
              ></CollectionCard>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};
