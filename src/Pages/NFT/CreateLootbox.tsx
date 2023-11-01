import { CircularProgress, Grid, LinearProgress, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import ImageUpload from "../../components/ImageUpload";
import { useEffect, useMemo, useState } from "react";
import { NFTStorage } from "nft.storage";
import { CollectionMetada, LootboxInputData, NFT } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { SERVER_API, fetchCep78NamedKeys, getNftCollection, getNftMetadata } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
// @ts-ignore
import {
  RuntimeArgs,
  DeployUtil,
  CLValueBuilder,
  Contracts,
  CLKey,
  CasperClient,
  CLByteArray,
  Keys,
  CLPublicKey,
  Signer,
  CasperServiceByJsonRPC,
  CLAccountHash,
} from "casper-js-sdk";
import { CustomSelect } from "../../components/CustomSelect";
import { CasperHelpers } from "../../utils";
import axios from "axios";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginBottom: "4rem",
    minWidth: "70vw",
    [theme.breakpoints.down("lg")]: {
      minWidth: "90vw",
    },
  },
  inputContainer: {
    width: "30vw",
    [theme.breakpoints.down("lg")]: {
      width: "40vw",
    },
    [theme.breakpoints.down("md")]: {
      width: "60vw",
    },
    [theme.breakpoints.down("sm")]: {
      width: "80vw",
    },
  },
}));

export const CreateLootbox = () => {
  const [publicKey, provider, , , , , , , , lootboxWasm] =
    useOutletContext<
      [
        publicKey: any,
        provider: any,
        cep18Wasm: any,
        cep78Wasm: any,
        marketplaceWasm: any,
        vestingWasm: any,
        executeListingWasm: any,
        raffleWasm: any,
        buyTicketWasm: any,
        lootboxWasm: any
      ]
    >();
  const classes = useStyles();

  const [collections, setCollections] = useState<CollectionMetada[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);

  const [file, setFile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingNFT, setLoadingNFT] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [lootbox, setLootbox] = useState<LootboxInputData>({
    name: "",
    desciption: "",
    asset: "",
    collection: undefined,
    lootbox_price: 0,
    items_per_lootbox: 0,
    max_lootboxes: 0,
    max_items: 0,
  });

  const handleClear = () => {
    setFile(null);
    setLootbox({ ...lootbox, asset: "" });
  };

  const createLootbox = async () => {
    try {
      if (lootbox && lootbox.collection) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();

        const args = RuntimeArgs.fromMap({
          name: CLValueBuilder.string(lootbox.name),
          description: CLValueBuilder.string(lootbox.desciption),
          asset: CLValueBuilder.string(lootbox.asset),
          nft_collection: CasperHelpers.stringToKey(lootbox.collection?.contractHash),
          lootbox_price: CLValueBuilder.u512(lootbox.lootbox_price * 1_000_000_000),
          items_per_lootbox: CLValueBuilder.u64(lootbox.items_per_lootbox),
          max_lootboxes: CLValueBuilder.u64(lootbox.max_lootboxes),
          max_items: CLValueBuilder.u64(lootbox.max_items),
        });

        const deploy = contract.install(new Uint8Array(lootboxWasm), args, "110000000000", ownerPublicKey, "casper-test");
        // const deployJson = DeployUtil.deployToJson(deploy);

        // try {
        //   const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
        //   let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
        //   signedDeploy = DeployUtil.validateDeploy(signedDeploy);
        //   const data = DeployUtil.deployToJson(signedDeploy.val);
        //   const response = await axios.post(SERVER_API + "deploy", data, {
        //     headers: { "Content-Type": "application/json" },
        //   });
        //   toastr.success(response.data, "Lootbox deployed successfully.");
        // } catch (error: any) {
        //   toastr.error("Lootbox couldn't be deploy. Error: "+error);
        // }
      }
    } catch (error) {
      toastr.error("Error: " + error);
    }
  };

  // const install = async () => {
  //   setLoading(true);
  //   try {
  //     if (!disable) {
  //       const ownerPublicKey = CLPublicKey.fromHex(publicKey);
  //       const contract = new Contracts.Contract();

  //       const args = RuntimeArgs.fromMap({
  //         name: CLValueBuilder.string(raffleData.name),
  //         start_date: CLValueBuilder.u64(raffleData.start * 1000),
  //         end_date: CLValueBuilder.u64(raffleData.end * 1000),
  //         collection: CasperHelpers.stringToKey(raffleData.collectionHash),
  //         nft_index: CLValueBuilder.u64(raffleData.nftIndex),
  //         price: CLValueBuilder.u512(raffleData.price * 1000000000),
  //         storage_key: new CLAccountHash(Buffer.from(STORE_CONTRACT_HASH, "hex")),
  //       });

  //       const deploy = contract.install(new Uint8Array(raffleWasm), args, "150000000000", ownerPublicKey, "casper-test");
  //       const deployJson = DeployUtil.deployToJson(deploy);

  //       try {
  //         const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
  //         let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
  //         signedDeploy = DeployUtil.validateDeploy(signedDeploy);
  //         const data = DeployUtil.deployToJson(signedDeploy.val);
  //         const response = await axios.post(SERVER_API + "deploy", data, {
  //           headers: { "Content-Type": "application/json" },
  //         });
  //         toastr.success(response.data, "Raffle deployed successfully.");
  //         setRaffleOpen(false);
  //         setLoading(false);
  //         // navigate("/marketplace");
  //       } catch (error: any) {
  //         alert(error.message);
  //         setLoading(false);
  //       }
  //     }
  //   } catch (error: any) {
  //     setLoading(false);
  //     toastr.error(error);
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    const storeImage = async () => {
      if (file) {
        setImageLoading(true);
        const storage = new NFTStorage({
          token: import.meta.env.VITE_NFT_STORAGE_API_KEY,
        });

        const fileCid = await storage.storeBlob(new Blob([file]));

        const fileUrl = "https://ipfs.io/ipfs/" + fileCid;

        setLootbox({
          ...lootbox,
          asset: fileUrl,
        });

        setImageLoading(false);
      }
    };
    storeImage();
  }, [file]);

  useEffect(() => {
    const init = async () => {
      const data = await fetchCep78NamedKeys(publicKey);

      const promises = data.map((data) => getNftCollection(data.key));

      const ownedCollections = await Promise.all(promises);
      console.log(ownedCollections);
      setCollections(ownedCollections);
      setLoading(false);
    };
    init();
  }, []);

  // useEffect(() => {
  //   setLoadingNFT(true);
  //   const init = async () => {
  //     if (lootbox.collection && lootbox.collection != undefined) {
  //       const nftCollection = await getNftCollection(lootbox.collection.contractHash);
  //       const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);
  //       const ownerPublicKey = CLPublicKey.fromHex(publicKey);

  //       const accountHash = ownerPublicKey.toAccountHashStr();

  //       let promises = [];
  //       for (let index = 0; index < nftCount; index++) {
  //         promises.push(getNftMetadata(lootbox.collection.contractHash, index.toString(), accountHash.slice(13)));
  //       }

  //       const nftMetas = await Promise.all(promises);
  //       console.log(nftMetas);

  //       setNfts(nftMetas);
  //       setLoadingNFT(false);
  //     }
  //   };
  //   init();
  // }, [lootbox.collection]);

  const disable = useMemo(() => {
    const disable = !lootbox.name.length || !lootbox.desciption.length || !lootbox.collection;
    return disable;
  }, [lootbox]);

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
      <Grid item display={"flex"} justifyContent={"center"}>
        <Typography variant="h5" sx={{ borderBottom: "1px solid red" }}>
          Lootbox
        </Typography>
      </Grid>
      <Grid item marginTop={"2rem"} display={"flex"} justifyContent={"center"}>
        <Stack className={classes.inputContainer} spacing={4}>
          <CustomInput
            label="Name"
            name="name"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, name: e.target.value })}
            placeholder="Name"
            type="text"
            value={lootbox.name}
            floor="dark"
          ></CustomInput>
          <CustomInput
            label="Description"
            name="description"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, desciption: e.target.value })}
            placeholder="Description"
            type="text"
            value={lootbox.desciption}
            floor="dark"
          ></CustomInput>
          <CustomInput
            label="Price"
            name="price"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, lootbox_price: Number(e.target.value) })}
            placeholder="Price"
            type="text"
            value={lootbox.lootbox_price}
            floor="dark"
          ></CustomInput>
          <CustomInput
            label="Items Per Lootbox"
            name="items_per_lootbox"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, items_per_lootbox: Number(e.target.value) })}
            placeholder="Items Per Lootbox"
            type="text"
            value={lootbox.items_per_lootbox}
            floor="dark"
          ></CustomInput>
          <CustomInput
            label="Max Lootboxes"
            name="max_lootboxes"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, max_lootboxes: Number(e.target.value) })}
            placeholder="Max Lootboxes"
            type="text"
            value={lootbox.max_lootboxes}
            floor="dark"
          ></CustomInput>
          <CustomInput
            label="Max Items"
            name="max_items"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, max_items: Number(e.target.value) })}
            placeholder="ItemsMax Items"
            type="text"
            value={lootbox.max_items}
            floor="dark"
          ></CustomInput>
          <ImageUpload file={file} loading={imageLoading} setFile={(data) => setFile(data)} handleClear={handleClear}></ImageUpload>

          <CustomSelect
            value={lootbox.collection?.contractHash || "default"}
            label="ERC-20 Token"
            onChange={(event: SelectChangeEvent) => {
              const data = collections.find((tk: any) => tk.contractHash === event.target.value);
              setLootbox({ ...lootbox, collection: data });
            }}
            id={"custom-select"}
          >
            <MenuItem value="default">
              <em>Select a Collection</em>
            </MenuItem>
            {collections.map((tk: any) => {
              return (
                <MenuItem key={tk.contractHash} value={tk.contractHash}>
                  {tk.collection_name}
                </MenuItem>
              );
            })}
          </CustomSelect>

          {/* {loadingNFT ? (
            lootbox.collection && (
              <div>
                <LinearProgress />
              </div>
            )
          ) : (
            <CustomSelect
              value={lootbox.nftIndex}
              id="customselect"
              onChange={(event: any) => {
                setLootbox({ ...lootbox, nftIndex: event.target.value });
              }}
            >
              <MenuItem key={-1} value={-1}>
                <em>Select a NFT</em>
              </MenuItem>
              {nfts.map((nft: any, index: number) => {
                return (
                  <MenuItem key={index} value={index}>
                    {"[" + index + "] " + nft.name}
                  </MenuItem>
                );
              })}
            </CustomSelect>
          )} */}
          <CustomButton
            label="Create Lootbox"
            onClick={() => {
              console.log(lootbox);
            }}
            disabled={disable}
          ></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateLootbox;
