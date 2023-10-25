import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { NftCard } from "../../components/NftCard";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchMarketplaceData, getMarketplaceListing } from "../../utils/api";
// @ts-ignore
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey } from "casper-js-sdk";

import { Listing, Marketplace } from "../../utils/types";

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

  const [loading, setLoading] = useState<boolean>(true);
  const [marketplaceData, setMarketplaceData] = useState<Marketplace>({ contractHash: "", contractName: "", feeWallet: "", listingCount: 0 });
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const init = async () => {
      if (marketplaceHash) {
        const listingData = await getMarketplaceListing(marketplaceHash);
        setListings(listingData);
        const marketplaceInfo = await fetchMarketplaceData(marketplaceHash);
        setMarketplaceData({ contractHash: marketplaceHash, contractName: marketplaceInfo.contractName, feeWallet: "", listingCount: parseInt(marketplaceInfo.listingCount.hex) });
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
    <Grid container direction={"column"} className={classes.container}>
      <Grid item className={classes.container}>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
          <Stack direction={"row"} spacing={2} display={"flex"} alignItems={"baseline"}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {marketplaceData.contractName} Market List
            </Typography>
            <Typography variant="subtitle1">(Active List Count: {marketplaceData.listingCount})</Typography>
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <CustomButton disabled={false} label="Add NFT to Marketplace" onClick={() => navigate("/add-nft-to-marketplace/" + marketplaceHash)}></CustomButton>
          </Stack>
        </Stack>
      </Grid>
      {!listings.length && (
        <Grid item marginTop={"4rem"}>
          <Typography variant="h6">There are no listed NFTs</Typography>
        </Grid>
      )}
      {listings.length && (
        <>
          <Grid item marginTop={"4rem"}>
            <Typography variant="h6">List of NFT's</Typography>
          </Grid>
          <Grid container>
            {listings.map((lst, index: number) => {
              return (
                <Grid item lg={3} md={4} sm={6} xs={6} key={index}>
                  <NftCard
                    description={lst.nftDescription}
                    name={lst.nftName}
                    asset={lst.nftImage}
                    price={lst.price}
                    index={0}
                    onClick={() => {
                      window.open("https://testnet.cspr.live/contract/" + lst.marketplace.slice(5), "_blank");
                    }}
                    chipTitle={lst.active ? "THIS NFT IS ON-SALE" : "THIS NFT WAS SOLD"}
                    status={lst.active ? "success" : "warning"}
                  ></NftCard>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default MarketplaceManager;
