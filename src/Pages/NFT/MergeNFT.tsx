import { useEffect, useState } from "react";
import { CircularProgress, Divider, Grid, MenuItem, SelectChangeEvent, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CollectionMetada } from "../../utils/types";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder, CLKey, CLByteArray } from "casper-js-sdk";
import { useNavigate, useOutletContext } from "react-router-dom";
import { SERVER_API, fetchCep78NamedKeys, getAllNftsByOwned, getNftCollection, getNftCollectionDetails, getNftMetadata } from "../../utils/api";
import { CasperHelpers, MERGABLE_NFT_CONTRACT, removeDuplicates } from "../../utils";
import { CustomSelect } from "../../components/CustomSelect";
import { NftCard } from "../../components/NftCard";
import { CustomButton } from "../../components/CustomButton";
import axios from "axios";
import { BurnMode, MetadataMutability, MintingMode } from "../../utils/enum";
import toastr from "toastr";

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
  const [nfts, setNFTS] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCollection, setSelectedCollection] = useState<CollectionMetada | undefined>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const [nftLoading, setNFTLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      const accountHash = ownerPublicKey.toAccountHashStr();

      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollectionDetails(data.key));

      const ownedCollections = await Promise.all(promises);

      const incomingData = await getAllNftsByOwned(accountHash);
      const incomingCollections = incomingData.map((ic: any) => "hash-" + ic.collection);
      const uniqueIncomings = removeDuplicates(incomingCollections);

      const missingCollectionPromises: any = [];

      uniqueIncomings.forEach((uc) => {
        if (ownedCollections.findIndex((oc: any) => oc.contractHash === uc) < 0) {
          missingCollectionPromises.push(getNftCollectionDetails(uc, false));
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
        setSelectedTokenIds([]);
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

        setNFTS(nftMetas.filter((nf) => nf.burnt === false));

        setNFTLoading(false);
      }
    };

    fetchNft();
  }, [selectedCollection]);

  const approve = async () => {
    toastr.warning("Running this operation executes set_approve_for_all. Please make sure that you want to perform this operation.");

    try {
      if (selectedCollection) {
        setLoading(true);
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedCollection.contractHash);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({
          token_owner: ownerPublicKey,
          approve_all: CLValueBuilder.bool(true),
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(MERGABLE_NFT_CONTRACT, "hex")))),
        });

        const deploy = contract.callEntrypoint("set_approval_for_all", args, ownerPublicKey, "casper-test", "10000000000");

        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Approve for all deployed successfully.");
          setLoading(false);
        } catch (error: any) {
          toastr.error("Error: " + error);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const merge = async () => {
    try {
      if (selectedCollection && selectedTokenIds.length > 0) {
        setLoading(true);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        contract.setContractHash("hash-" + MERGABLE_NFT_CONTRACT);

        const args = RuntimeArgs.fromMap({
          collection: CasperHelpers.stringToKey(selectedCollection.contractHash),
          token_ids: CLValueBuilder.list(selectedTokenIds.map((id: any) => CLValueBuilder.u64(id))),
        });

        const fee = (5 * selectedTokenIds.length + 1) * Math.pow(10, 9);

        const deploy = contract.callEntrypoint("merge", args, ownerPublicKey, "casper-test", fee);

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

          toastr.success(response.data, "Merge Nft deployed successfully.");
          window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");
          navigate("/my-collections");

          setLoading(false);
        } catch (error: any) {
          alert(error.message);
        }
      }

      setLoading(false);
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
            {collections
              .filter((col: any) => col.metadata_mutability == MetadataMutability.Immutable && col.minting_mode == MintingMode.Public && col.burn_mode == BurnMode.Burnable)
              .map((collection: any) => {
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
            <Grid item width={"50%"} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
              <Typography variant="subtitle1" marginTop={"2rem"}>
                Now, select the NFTs you want to merge to create a new NFT.
              </Typography>
              <CustomButton disabled={false} label="Approve Collection" onClick={approve}></CustomButton>
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
              {nfts
                .filter((fltr: any) => fltr.mergable == true)
                .map((nft: any) => (
                  <Grid item lg={3} md={3} sm={6} xs={12} key={nft.index}>
                    <NftCard
                      asset={nft.asset}
                      description={nft.description}
                      index={nft.index}
                      name={nft.name}
                      onClick={() => {
                        !selectedTokenIds.includes(nft.index)
                          ? setSelectedTokenIds([...selectedTokenIds, nft.index])
                          : setSelectedTokenIds(selectedTokenIds.filter((item) => item !== nft.index));
                      }}
                      isSelected={selectedTokenIds.includes(nft.index)}
                      amIOwner={nft.isMyNft}
                    ></NftCard>
                  </Grid>
                ))}
            </Grid>
            <Grid item marginTop={"2rem"}>
              <CustomButton disabled={selectedTokenIds.length <= 1 || !selectedCollection} label="Merge NFTs" onClick={merge}></CustomButton>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default MergeNFT;
