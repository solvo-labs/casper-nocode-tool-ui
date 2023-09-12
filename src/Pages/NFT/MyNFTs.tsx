import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import { CircularProgress, Grid, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomButton, CustomButtonText } from "../../components/CustomButton";

const useStyles = makeStyles((theme: Theme) => ({
  titleContainer: {
    [theme.breakpoints.down("md")]: {
      // marginTop: "10rem",
      paddingLeft: "1rem",
      paddingRight: "1rem",
    },
  },
  container: {
    maxWidth: "70vw",
    minWidth: "70vw",
    marginTop: "4rem",
    // backgroundColor: "darkgray",
    [theme.breakpoints.down("md")]: {
      maxWidth: "95vw",
      marginTop: "4rem",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
}));

export const MyNFTs = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();
  const [loading, setLoading] = useState<boolean>(true);

  // @to-do add collection model
  const [collections, setCollections] = useState<any>([]);
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);

      setLoading(false);
      setCollections(result);
      console.log(collections);
    };

    init();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "calc(100vh - 8rem)",
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
    <Grid>
      <Grid container className={classes.titleContainer} direction={"row"} justifyContent={"space-between"} alignContent={"start"}>
        <Typography className={classes.title} variant="h4">
          My NFTs
        </Typography>
        <Stack direction={"row"} spacing={2}>
          <CustomButtonText
            disabled={false}
            label="My NFTs"
            onClick={() => {
              console.log("weigiwe");
            }}
          ></CustomButtonText>
          <CustomButtonText
            disabled={false}
            label="My Collections"
            onClick={() => {
              navigate("/my-collections");
            }}
          ></CustomButtonText>
          <CustomButton
            disabled={false}
            label="Mint NFT"
            onClick={() => {
              navigate("/create-nft");
            }}
          ></CustomButton>
        </Stack>
      </Grid>
      <Grid container className={classes.container}>
        <Grid container width={"100%"} justifyContent={"flex-start"}></Grid>
      </Grid>
    </Grid>
  );
};
