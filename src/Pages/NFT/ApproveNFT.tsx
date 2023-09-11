import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
import { fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import { getMetadataImage } from "../../utils";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CollectionMetada } from "../../utils/types";
import { CollectionCardAlternate } from "../../components/CollectionCard";
// @ts-ignore
import {Contracts,RuntimeArgs,DeployUtil,CLValueBuilder,CLPublicKey} from "casper-js-sdk";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    maxWidth: "70vw",
    minWidth: "70vw",
    justifyContent: "center",
    marginBottom: "2rem",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
      maxWidth: "90vw",
      // marginTop: "4rem",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
}));

const ApproveNFT = () => {
  const classes = useStyles();
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState("");

  const [publicKey, provider, , , , marketplaceWasm] =
    useOutletContext<
      [
        publicKey: string,
        provider: any,
        wasm: any,
        nftWasm: any,
        collectionWasm: any,
        marketplaceWasm: any
      ]
    >();

  console.log(selectedCollection);

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

  if (loading) {
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
    </div>;
  }

  return (
    <>
      <Grid container className={classes.container}>
        <Grid item>
          <Typography variant="h5" className={classes.title}>
            Approve your NFT
          </Typography>
        </Grid>
        <Grid container marginTop={"2rem"}>
          {collections.map((e: any) => (
            <Grid item lg={3} md={3} sm={6} xs={6}>
              <CollectionCardAlternate
                image={e.image}
                onClick={() => navigate("/approve-nft/" + e.contractHash)}
                title={e.collection_name}
                contractHash={e.contractHash}
                symbol={e.collection_symbol}
              ></CollectionCardAlternate>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export default ApproveNFT;
