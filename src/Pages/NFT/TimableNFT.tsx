import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { getAllNftsByOwned } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
import { NftCard } from "../../components/NftCard";
import moment from "moment";

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
    // position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
}));

const TimableNFT = () => {
  const classes = useStyles();
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [timeableNFTs, setTimeableNFTs] = useState<any>([]);

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();
      const incomingData = await getAllNftsByOwned(accountHash);

      const finalData = incomingData.filter((nft: any) => nft.metadata.timeable);
      setTimeableNFTs(finalData);
      setLoading(false);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
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
    <Grid container direction={"column"} marginBottom={"2rem"}>
      <Grid container className={classes.titleContainer}>
        <Stack direction={"row"} spacing={2} className={classes.title}>
          <Typography variant="h4">Timeable NFTs</Typography>
        </Stack>
      </Grid>
      <Grid container className={classes.container}>
        {timeableNFTs.map((e: any, index: number) => (
          <Grid item xl={3} lg={4} md={4} sm={6} xs={6} key={index}>
            <NftCard
              description={e.metadata.description}
              name={e.metadata.name}
              asset={e.metadata.asset}
              index={e.token_id}
              owner={e.owner_public_key.slice(0, 20)}
              amIOwner={e.isMyNft}
              timeable={e.metadata.timeable}
              timestamp={e.metadata.timestamp}
            ></NftCard>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default TimableNFT;
