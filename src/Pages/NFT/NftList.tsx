import { useEffect, useState } from "react";
import { getNftCollection, getNftMetadata } from "../../utils/api";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { NftCard } from "../../components/NftCard";
import { makeStyles } from "@mui/styles";
import { NFT } from "../../utils/types";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
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
  const [publicKey] = useOutletContext<[publickey: string]>();

  useEffect(() => {
    const init = async () => {
      if (nftCollectionHash) {
        const nftCollection = await getNftCollection(nftCollectionHash);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const accountHash = ownerPublicKey.toAccountHashStr();

        setCollectionData(nftCollection);

        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(nftCollectionHash, index.toString(), accountHash.slice(13)));
        }

        const nftMetas = await Promise.all(promises);
        console.log(nftMetas);
        setNftData(nftMetas);
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

  return (
    <Grid container direction={"column"}>
      <Grid container className={classes.titleContainer}>
        <Stack direction={"row"} spacing={2} display={"flex"} alignItems={"baseline"} className={classes.title}>
          <Typography variant="h4">
            <b>{collectionData?.collection_name}</b> Collection
          </Typography>
          <Typography variant="h6">({parseInt(collectionData.number_of_minted_tokens.hex) + "/" + parseInt(collectionData.total_token_supply.hex)})</Typography>
        </Stack>
      </Grid>
      <Grid container className={classes.container}>
        {nftData.map((e: any, index: number) => (
          <Grid item xl={3} lg={4} md={4} sm={6} xs={6} key={index}>
            <NftCard description={e.description} name={e.name} asset={e.asset} index={index} owner={e.owner.slice(0, 20)} amIOwner={e.isMyNft}></NftCard>
          </Grid>
        ))}
        <Grid item xl={3} lg={4} md={4} sm={6} xs={6}>
          <CreateCollectionCard
            text="ADD NFT"
            onClick={() => {
              navigate("/create-nft/" + nftCollectionHash);
            }}
            height={"26.25rem"}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
