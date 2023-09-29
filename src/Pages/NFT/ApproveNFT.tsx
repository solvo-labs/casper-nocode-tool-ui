import { CircularProgress, Grid, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {useEffect, useMemo, useState} from "react";
import {
  fetchCep78NamedKeys,
  fetchMarketplaceNamedKeys,
  fetchRaffleNamedKeys,
  getNftCollection,
  getNftMetadata
} from "../../utils/api";
import { getMetadataImage } from "../../utils";
import { FETCH_IMAGE_TYPE } from "../../utils/enum";
import { useOutletContext } from "react-router-dom";
import {CollectionMetada, Marketplace, NFT, RaffleNamedKeys} from "../../utils/types";
import { CollectionCardAlternate } from "../../components/CollectionCard";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, CLKey, CLByteArray, DeployUtil } from "casper-js-sdk";
import toastr from "toastr";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import {ApproveNFTModal, ListNFTModal} from "../../components/NFTApproveModal.tsx";


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
  modalStyle: { backgroundColor: "rgba(0, 0, 0, 0.75)" },
}));

const ApproveNFT = () => {
  const classes = useStyles();
  const [publicKey, provider] = useOutletContext<[publicKey: string, provider: any]>();
  // const navigate = useNavigate();
  const [collections, setCollections] = useState<CollectionMetada[] | any>([]);
  const [nftData, setNftData] = useState<NFT[] | any>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>("");
  const [selectedTokenId, setSelectedTokenId] = useState<number>(0);

  const [loadingNFT, setLoadingNFT] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [openNFT, setOpenNFT] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const [approveOperatorType, setApproveOperatorType] = useState<string>("default");
  const [selectedOperatorHash, setSelectedOperatorHash] = useState<string>();

  const [marketplaces, setMarketplaces] = useState<Marketplace[]>();
  const [raffles, setRaffles] = useState<RaffleNamedKeys[]>();

  const handleOpenNFT = (contract: string) => {
    setSelectedCollection(contract);
    fetchNft(contract);
    setOpenNFT(true);
  };
  const handleCloseNFT = () => {
    setOpenNFT(false);
    // setSelectedCollection(null);
  };

  const handleOpenApprove = () => {
    setOpenApprove(true);
    setOpenNFT(false);
  };
  const handleCloseApprove = () => {
    setOpenApprove(false);
    setOpenNFT(true);
    setSelectedOperatorHash(undefined);
    setApproveOperatorType("");
  };

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
    setLoadingNFT(true);
    if (contract) {
      const nftCollection = await getNftCollection(contract);

      const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

      let promises = [];
      for (let index = 0; index < nftCount; index++) {
        promises.push(getNftMetadata(contract, index.toString()));
      }

      const nftMetas= await Promise.all(promises);
      const imagePromises = nftMetas.map((e: any) => getMetadataImage(e, FETCH_IMAGE_TYPE.NFT));
      const images = await Promise.all(imagePromises);

      const finalData = nftMetas.map((e: any, index: number) => {
        return {
          ...e,
          imageURL: images[index],
        };
      });

      setNftData(finalData);
      setLoadingNFT(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchMarketplaceNamedKeys(publicKey);
      const finalData: Marketplace[] = data.map((dt) => {
        return { contractHash: dt.key, contractName: dt.name.substring(26), listingCount: 0, feeWallet: "" };
      });

      setMarketplaces(finalData);
      console.log(finalData);
    };

    init();
  }, []);

useEffect(() => {
    const init = async () => {
      const data = await fetchRaffleNamedKeys(publicKey);
      console.log(data);
      setRaffles(data);
    };

    init();
  }, []);

  const approve = async () => {
    setLoading(true)
    try {
      if (selectedOperatorHash) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedCollection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const operatorHash = selectedOperatorHash.replace("hash-", "");

        const args = RuntimeArgs.fromMap({
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(operatorHash, "hex")))),
          token_id: CLValueBuilder.u64(selectedTokenId),
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

          setSelectedOperatorHash("default");
          setApproveOperatorType("");
          setLoading(false);
          setOpenNFT(false);
          setOpenApprove(false);

          toastr.success(response.data, "Approve deployed successfully.");
        } catch (error: any) {
          alert(error.message);
          setLoading(false);
          setSelectedOperatorHash("default");
          setApproveOperatorType("");
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const disable = useMemo(() => {
    const disable = !(selectedOperatorHash != "default" && approveOperatorType);
    return disable;
  }, [selectedOperatorHash, approveOperatorType]);

  if (loading) {
    return (
      <div
        style={{
          height: "60vh",
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
                  handleOpenNFT(e.contractHash);
                }}
                title={e.collection_name}
                contractHash={e.contractHash}
                symbol={e.collection_symbol}
              ></CollectionCardAlternate>
              <ListNFTModal
                  collection={e}
                  open={openNFT}
                  handleClose={handleCloseNFT}
                  loading={loadingNFT}
                  nfts={nftData}
                  handleOpenApprove={handleOpenApprove}
                  selectedNFTIndex={setSelectedTokenId}
              ></ListNFTModal>
              <ApproveNFTModal
                  selected={selectedOperatorHash}
                  marketplaces={marketplaces}
                  raffles={raffles}
                  selectedOnChange={setSelectedOperatorHash}
                  open={openApprove}
                  handleClose={handleCloseApprove}
                  approve={approve}
                  approveOperatorType={approveOperatorType}
                  approveOperatorOnChange={setApproveOperatorType}
                  disable={disable}
              ></ApproveNFTModal>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  );
};

export default ApproveNFT;
