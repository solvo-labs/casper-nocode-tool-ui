import React from "react";
import { Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton } from "../../components/CustomButton";
import { NftCard } from "../../components/NftCard";
import { useNavigate } from "react-router-dom";

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
  

  return (
    <Grid
      container
      direction={"column"}
      className={classes.container}
    >
      <Grid item className={classes.container}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography variant="h4">Marketplace name</Typography>
          <CustomButton
            disabled={false}
            label="Add NFT to Marketplace"
            onClick={() => navigate("/add-nft-to-marketplace")}
          ></CustomButton>
        </Stack>
      </Grid>
      <Grid item marginTop={"2rem"}>
        <Typography variant="h5">Non Approved NFT's</Typography>
      </Grid>
      <Grid container>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5">Listed NFT</Typography>
      </Grid>
      <Grid container>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
        <Grid item lg={3} md={3} sm={4} xs={6}>
          <NftCard
            description={"sadasd"}
            name={"asdasd"}
            imageURL={"asdas"}
          ></NftCard>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default MarketplaceManager;
