import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { NftCard } from "../../components/NftCard";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { SERVER_API, getAllListingForSale } from "../../utils/api";
// @ts-ignore
import { Contracts, RuntimeArgs, DeployUtil, CLValueBuilder, CLPublicKey } from "casper-js-sdk";

import { Listing } from "../../utils/types";
import { CasperHelpers } from "../../utils";
import axios from "axios";
import toastr from "toastr";

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

const BuyNft = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [publicKey, provider, , , , , executeListingWasm] =
    useOutletContext<[publicKey: any, provider: any, cep18Wasm: any, cep78Wasm: any, marketplaceWasm: any, vestingWasm: any, executeListingWasm: any]>();

  const [loading, setLoading] = useState<boolean>(true);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const init = async () => {
      const listingData = await getAllListingForSale();
      setListings(listingData);
      setLoading(false);
    };

    init();
  }, []);

  const buyNft = async (listing: Listing) => {
    try {
      setLoading(true);
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);
      const contract = new Contracts.Contract();

      const args = RuntimeArgs.fromMap({
        marketplace_contract_hash: CasperHelpers.stringToKey(listing.marketplace.slice(5)),
        listing_id: CLValueBuilder.u64(listing.listingIndex + 1),
        amount: CLValueBuilder.u512(listing.price * 1_000_000_000),
      });

      const deploy = contract.install(new Uint8Array(executeListingWasm!), args, "100000000000", ownerPublicKey, "casper-test");

      const deployJson = DeployUtil.deployToJson(deploy);
      console.log("deployJson", deployJson);

      // signer logic
      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        console.log("sign", sign);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        console.log("signedDeploy", signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "Sold successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/buy-nft");
        setLoading(false);
      } catch (error: any) {
        alert(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      toastr.error(err);
      setLoading(false);
    }
  };

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
          <Typography variant="h4" sx={{ borderBottom: "1px solid red" }}>
            Nft List in Sale
          </Typography>
        </Stack>
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Typography variant="h5">List of NFT's</Typography>
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
                onClick={() => {
                  window.open("https://testnet.cspr.live/contract/" + lst.marketplace.slice(5), "_blank");
                }}
                index={0}
              ></NftCard>
              <div style={{ display: "flex", alignItems: "center ", justifyContent: "center" }}>
                <CustomButton onClick={() => buyNft(lst)} label={"BUY THIS NFT"} disabled={false}></CustomButton>
              </div>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default BuyNft;
