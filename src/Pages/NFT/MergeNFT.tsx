import { useEffect, useState } from "react";
import { CircularProgress, Divider, Grid, MenuItem, SelectChangeEvent, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CollectionMetada, NFT } from "../../utils/types";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useOutletContext } from "react-router-dom";
import { SERVER_API, fetchCep78NamedKeys, getAllNftsByOwned, getNftCollection, getNftMetadata } from "../../utils/api";
import { CasperHelpers, MERGABLE_NFT_CONTRACT, removeDuplicates } from "../../utils";
import { CustomSelect } from "../../components/CustomSelect";
import { NftCard } from "../../components/NftCard";
import { CustomButton } from "../../components/CustomButton";
import axios from "axios";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    minWidth: "90vw",
    marginBottom: "4rem",
    // backgroundColor: "gray",
    [theme.breakpoints.down("xl")]: {
      minWidth: "80vw",
    },
    [theme.breakpoints.down("md")]: {
      minWidth: "90vw",
    },
  },
  title: {
    borderBottom: "1px solid red",
  },
}));

const MergeNFT = () => {
  const classes = useStyles();
  const [publicKey, provider] = useOutletContext<[publickey: string, provider: any]>();
  const [collections, setCollections] = useState<CollectionMetada[]>([]);
  const [nfts, setNFTS] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCollection, setSelectedCollection] = useState<CollectionMetada | undefined>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [nftLoading, setNFTLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();

      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const ownedCollections = await Promise.all(promises);

      const incomingData = await getAllNftsByOwned(accountHash);
      const incomingCollections = incomingData.map((ic: any) => "hash-" + ic.collection);
      const uniqueIncomings = removeDuplicates(incomingCollections);

      const missingCollectionPromises: any = [];

      uniqueIncomings.forEach((uc) => {
        if (ownedCollections.findIndex((oc: any) => oc.contractHash === uc) < 0) {
          missingCollectionPromises.push(getNftCollection(uc, false));
        }
      });

      if (missingCollectionPromises.length > 0) {
        const missingCollections = await Promise.all(missingCollectionPromises);
        setCollections([...ownedCollections, ...missingCollections]);
      } else {
        setCollections(ownedCollections);
      }

      setLoading(false);
    };

    init();

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchNft = async () => {
      if (selectedCollection) {
        setNFTLoading(true);
        const nftCollection = await getNftCollection(selectedCollection.contractHash);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const accountHash = ownerPublicKey.toAccountHashStr();

        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(selectedCollection.contractHash, index.toString(), accountHash.slice(13)));
        }

        const nftMetas = await Promise.all(promises);

        setNFTS(nftMetas);
        console.log(nftMetas);

        setNFTLoading(false);
      }
    };

    fetchNft();
  }, [selectedCollection]);

  const merge = async () => {
    try {
      if (selectedCollection && !selectedTokenIds.length) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        contract.setContractHash(MERGABLE_NFT_CONTRACT);

        const args = RuntimeArgs.fromMap({
          collection: CasperHelpers.stringToKey(selectedCollection.contractHash),
          token_ids: CLValueBuilder.list(selectedTokenIds.map((id: any) => CLValueBuilder.u64(id))),
        });

        const deploy = contract.callEntrypoint("merge", args, ownerPublicKey, "casper-test", "12000000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

          // setActionLoader(true);

          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

          signedDeploy = DeployUtil.validateDeploy(signedDeploy);

          const deployedData = DeployUtil.deployToJson(signedDeploy.val);

          const response = await axios.post(SERVER_API + "deploy", deployedData, {
            headers: { "Content-Type": "application/json" },
          });
          // toastr.success(response.data, selectedToken.name + " Token minted successfully.");
          window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
          // navigate("/my-tokens");
          // setActionLoader(false);
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (error) {
      console.log(error);
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
    <Grid container className={classes.container}>
      <Grid item display={"flex"} width={"100%"} justifyContent={"center"}>
        <Typography variant="h5" className={classes.title}>
          Merge NFT
        </Typography>
      </Grid>
      <Grid container display={"flex"} marginTop={"2rem"} alignItems={"center"} direction={"column"}>
        <Grid item width={"50%"}>
          <Typography variant="subtitle1">
            Combine your own create or NFTs acquired through our platform. Select from the NFTs in your collection and merge them into a <b> "Single Unique NFT"</b>.
          </Typography>
          <Typography variant="subtitle1" marginTop={"2rem"}>
            Firstly, select your collection.
          </Typography>
        </Grid>
        <Grid item marginTop={"2rem"} width={"40%"}>
          <CustomSelect
            value={selectedCollection ? selectedCollection.contractHash : "default"}
            id="collectionHash"
            onChange={(event: SelectChangeEvent) => {
              const data = collections.find((tk: any) => tk.contractHash === event.target.value);
              setSelectedCollection(data);
            }}
          >
            <MenuItem value="default">
              <em>Select a Collection</em>
            </MenuItem>
            {collections.map((collection: any) => {
              return (
                <MenuItem key={collection.contractHash} value={collection.contractHash}>
                  {collection.collection_name}
                </MenuItem>
              );
            })}
          </CustomSelect>
        </Grid>
        {nftLoading && (
          <div
            style={{
              height: "25vh",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </div>
        )}
        {!nftLoading && nfts.length != 0 && (
          <Grid container display={"flex"} marginTop={"2rem"} alignItems={"center"} direction={"column"}>
            <Grid item width={"50%"}>
              <Typography variant="subtitle1" marginTop={"2rem"}>
                Now, select the NFTs you want to merge to create a new NFT.
              </Typography>
            </Grid>
            <Divider
              // textAlign="left"
              sx={{
                marginTop: "2rem",
                width: "50%",
                color: "white",
                "&::before, &::after": {
                  borderTop: "thin solid red !important",
                },
              }}
            >
              Your NFTs
            </Divider>
            <Grid container width={"80%"} marginTop={"2rem"}>
              {nfts.map((nft: any, index: number) => (
                <Grid item lg={3} md={3} sm={6} xs={12} key={index}>
                  <NftCard
                    asset={nft.asset}
                    description={nft.description}
                    index={index}
                    name={nft.name}
                    onClick={() => {
                      !selectedTokenIds.includes(nft.index)
                        ? setSelectedTokenIds([...selectedTokenIds, nft.index])
                        : setSelectedTokenIds(selectedTokenIds.filter((item) => item !== index));
                    }}
                    isSelected={selectedTokenIds.includes(index)}
                  ></NftCard>
                </Grid>
              ))}
            </Grid>
            <Grid item marginTop={"2rem"}>
              <CustomButton disabled={selectedTokenIds.length <= 0 || !selectedCollection} label="Merge NFTs" onClick={merge}></CustomButton>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default MergeNFT;
