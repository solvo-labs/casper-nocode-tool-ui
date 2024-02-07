import { useEffect, useMemo, useState } from "react";
import { getNftCollection } from "../../utils/api";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { NftCard } from "../../components/NftCard";
import { makeStyles } from "@mui/styles";
import { NFT } from "../../utils/types";
import { CreateCollectionCard } from "../../components/CreateCollectionCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { getContractPackageNFTs } from "../../utils/csprCloud";

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
    setLoading(true);
    const init = async () => {
      if (nftCollectionHash) {
        const nftCollection = await getNftCollection(nftCollectionHash);

        const nftMetas = await getContractPackageNFTs(nftCollectionHash!.slice(5));
        console.log(nftMetas);

        setCollectionData(nftCollection);
        setNftData(nftMetas.filter((nft: any) => nft.is_burned === false));
        setLoading(false);
      }
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  let accountHash = useMemo(() => {
    const ownerPublicKey = CLPublicKey.fromHex(publicKey);
    const accountHash = ownerPublicKey.toAccountHashStr();
    console.log(accountHash.slice(13));

    return accountHash.slice(13);
  }, [publicKey]);

  // useEffect(() => {
  //   const init = async () => {
  //     if (nftCollectionHash) {
  //       const nftCollection = await getNftCollection(nftCollectionHash);
  //       const ownerPublicKey = CLPublicKey.fromHex(publicKey);

  //       const accountHash = ownerPublicKey.toAccountHashStr();

  //       setCollectionData(nftCollection);
  //       console.log(nftCollection);

  //       const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

  //       let promises = [];
  //       for (let index = 0; index < nftCount; index++) {
  //         promises.push(getNftMetadata(nftCollectionHash, index.toString(), accountHash.slice(13)));
  //       }

  //       const nftMetas = await Promise.all(promises);

  //       setNftData(nftMetas.filter((nf) => nf.burnt === false));
  //       setLoading(false);
  //     }
  //   };

  //   init();

  //   const interval = setInterval(() => init(), 30000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

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
    <Grid container direction={"column"} marginBottom={"2rem"}>
      <Grid container className={classes.titleContainer}>
        <Stack direction={"row"} spacing={2} display={"flex"} alignItems={"baseline"} className={classes.title}>
          <Typography variant="h4">
            <b>{collectionData?.collection_name}</b> Collection
          </Typography>
          <Typography variant="h6">({parseInt(collectionData.number_of_minted_tokens.hex) + "/" + parseInt(collectionData.total_token_supply.hex)})</Typography>
        </Stack>
      </Grid>
      <Grid container className={classes.container}>
        {nftData.map((nft: any) => (
          <Grid item xl={3} lg={4} md={4} sm={6} xs={6} key={nft.token_id}>
            <NftCard
              description={nft.onchain_metadata.description}
              name={nft.onchain_metadata.name}
              asset={nft.onchain_metadata.asset}
              index={nft.token_id}
              owner={nft.owner_hash.slice(0, 10)}
              amIOwner={nft.owner_hash == accountHash ? true : false}
              timeable={false} // TODO timable will adding onchain_metadata
              mergeable={false} // TODO mergeble will adding onchain_metadata
            ></NftCard>
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
