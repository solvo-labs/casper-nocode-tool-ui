import {
  Box,
  CircularProgress,
  Grid,
  Modal,
  Stack,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
import {
  fetchCep78NamedKeys,
  getNftCollection,
  getNftMetadata,
} from "../../utils/api";
import { getMetadataImage } from "../../utils";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CollectionMetada, NFT } from "../../utils/types";
import { CollectionCardAlternate } from "../../components/CollectionCard";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { NftCard } from "../../components/NftCard";
import { CustomButton } from "../../components/CustomButton";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  height: 600,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "black",
  overflow: "scroll",
};
const nftModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  height: 200,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "black",
  overflow: "scroll",
};

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
  const [open, setOpen] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    ""
  );
  const [nftData, setNftData] = useState<NFT[] | any>([]);

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

  const handleOpen = (contract: string) => {
    console.log(contract);
    // setSelectedCollection(contract)
    fetchNft(contract);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedCollection(null);
  };

  const handleOpenNft = () => {
    setOpenApprove(true);
  };
  const handleCloseNft = () => {
    setOpenApprove(false);
  };

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
      setCollections(finalData);
    };

    init();
  }, []);

  const fetchNft = async (contract: string) => {
    setLoading(true);
    if (contract) {
      const nftCollection = await getNftCollection(contract);

      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(contract, index.toString()));
      }

      const nftMetas = await Promise.all(promises);
      const imagePromises = nftMetas.map((e: any) =>
        getMetadataImage(e, FETCH_IMAGE_TYPE.NFT)
      );
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      setNftData(finalData);
      setLoading(false);
      console.log(finalData);
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
                onClick={() => {
                  handleOpen(e.contractHash);
                }}
                title={e.collection_name}
                contractHash={e.contractHash}
                symbol={e.collection_symbol}
              ></CollectionCardAlternate>
              <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                  {loading && <CircularProgress />}
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Approve {e.collection_name}'s NFT
                  </Typography>
                  <Grid container>
                    {nftData.map((e: any, index: number) => (
                      <Grid item lg={4} md={4} sm={6} xs={6}>
                        <NftCard
                          description={e.description}
                          name={e.name}
                          imageURL={e.imageURL}
                          onClick={handleOpenNft}
                        ></NftCard>
                        <Modal open={openApprove} onClose={handleCloseNft}>
                          <Box sx={style}  display={"flex"} alignItems={"center"} justifyContent={"center"}>
                            <Stack spacing={"2rem"}>
                              <Typography
                                display={"flex"}
                                justifyContent={"center"}
                                variant="h6"
                                component="h2"
                              >
                                Are you sure you are about to approve now?
                              </Typography>
                              <Stack
                                direction={"row"}
                                spacing={"2rem"}
                                justifyContent={"center"}
                              >
                                <CustomButton
                                  disabled={false}
                                  label="Deny"
                                  onClick={handleCloseNft}
                                ></CustomButton>
                                <CustomButton
                                  disabled={false}
                                  label="Confirm"
                                  onClick={() => {}}
                                ></CustomButton>
                              </Stack>
                            </Stack>
                          </Box>
                        </Modal>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Modal>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export default ApproveNFT;
