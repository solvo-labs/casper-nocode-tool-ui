import { Box, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Modal, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useEffect, useState } from "react";
import { fetchCep78NamedKeys, fetchMarketplaceNamedKeys, getNftCollection, getNftMetadata } from "../../utils/api";
import { getMetadataImage } from "../../utils";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CollectionMetada, Marketplace, NFT } from "../../utils/types";
import { CollectionCardAlternate } from "../../components/CollectionCard";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, CLKey, CLByteArray, DeployUtil } from "casper-js-sdk";
import { NftCard } from "../../components/NftCard";
import { CustomButton } from "../../components/CustomButton";
import toastr from "toastr";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { CustomSelect } from "../../components/CustomSelect";

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
  const [marketplace, setMarketplace] = useState<Marketplace[]>([]);
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>();
  const [selectedCollection, setSelectedCollection] = useState<string | null>("");
  const [nftData, setNftData] = useState<NFT[] | any>([]);

  const [publicKey, provider] = useOutletContext<[publicKey: string, provider: any]>();

  const handleOpen = (contract: string) => {
    console.log(contract);
    setSelectedCollection(contract);
    fetchNft(contract);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    // setSelectedCollection(null);
  };

  const handleOpenNft = () => {
    setOpenApprove(true);
  };
  const handleCloseNft = () => {
    setOpenApprove(false);
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchMarketplaceNamedKeys(publicKey);
      const filteredData = data.filter((dt) => dt.name === "marketplace_contract_hash");
      setMarketplace(filteredData);
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const result = await Promise.all(promises);
      const imagePromises = result.map((e: any) => getMetadataImage(e.json_schema, FETCH_IMAGE_TYPE.COLLECTION));
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
      const imagePromises = nftMetas.map((e: any) => getMetadataImage(e, FETCH_IMAGE_TYPE.NFT));
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      setNftData(finalData);
      setLoading(false);
    }
  };

  const approve = async () => {
    try {
      if (selectedMarketplace) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedCollection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const marketplaceHash = selectedMarketplace.replace("hash-", "");
        console.log(marketplaceHash);

        const args = RuntimeArgs.fromMap({
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(marketplaceHash, "hex")))),
          token_id: CLValueBuilder.u64(0),
        });

        const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "10000000000");
        console.log(deploy);

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve deployed successfully.");
          handleCloseNft();
          navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
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
            Select Collection and Approve Your Nft
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
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                    Approve {e.collection_name}'s NFT
                  </Typography>
                  <Grid container>
                    {nftData.map((e: any, index: number) => (
                      <Grid item lg={4} md={4} sm={6} xs={6}>
                        <NftCard description={e.description} name={e.name} imageURL={e.imageURL} onClick={handleOpenNft} index={index + 1}></NftCard>
                        <Modal open={openApprove} onClose={handleCloseNft}>
                          <Box sx={style} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                            <Stack spacing={"2rem"}>
                              <FormControl fullWidth>
                                <InputLabel sx={{ color: "black" }}>Ownership Mode</InputLabel>
                                <CustomSelect id="ownershipMode" value={selectedMarketplace} label="Ownership Mode" onChange={(e: any) => setSelectedMarketplace(e.target.value)}>
                                  {marketplace.map((mp: any) => {
                                    return (
                                      <MenuItem key={mp.key} value={mp.key}>
                                        {"Demo Marketplace" + "(" + mp.key.slice(0, 12) + ")"}
                                      </MenuItem>
                                    );
                                  })}
                                </CustomSelect>
                              </FormControl>
                              <Typography display={"flex"} justifyContent={"center"} variant="h6" component="h2">
                                Are you sure you are about to approve now?
                              </Typography>
                              <Stack direction={"row"} spacing={"2rem"} justifyContent={"center"}>
                                <CustomButton disabled={false} label="Deny" onClick={handleCloseNft}></CustomButton>
                                <CustomButton disabled={false} label="Confirm" onClick={approve}></CustomButton>
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
