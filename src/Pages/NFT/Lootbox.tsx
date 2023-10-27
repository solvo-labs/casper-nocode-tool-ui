import { CircularProgress, Grid, LinearProgress, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import ImageUpload from "../../components/ImageUpload";
import { useEffect, useState } from "react";
import { NFTStorage } from "nft.storage";
import { CollectionMetada, LootboxInputData, NFT } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { fetchCep78NamedKeys, getNftCollection, getNftMetadata } from "../../utils/api";
import { useOutletContext } from "react-router-dom";
// @ts-ignore
import { CLPublicKey } from "casper-js-sdk";
import { CustomSelect } from "../../components/CustomSelect";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
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

export const Lootbox = () => {
  const [publicKey] = useOutletContext<[publickey: string]>();
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
    collection: undefined,
    asset: "",
    nftIndex: -1,
  });

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

  useEffect(() => {
    setLoadingNFT(true);
    const init = async () => {
      if (lootbox.collection && lootbox.collection != undefined) {
        const nftCollection = await getNftCollection(lootbox.collection.contractHash);
        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const accountHash = ownerPublicKey.toAccountHashStr();

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata(lootbox.collection.contractHash, index.toString(), accountHash.slice(13)));
        }

        const nftMetas = await Promise.all(promises);
        console.log(nftMetas);

        setNfts(nftMetas);
        setLoadingNFT(false);
      }
    };
    init();
  }, [lootbox.collection]);

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
          <ImageUpload file={file} loading={imageLoading} setFile={(data) => setFile(data)}></ImageUpload>

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

          {loadingNFT ? (
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
          )}
          <CustomButton
            label="Create Lootbox"
            onClick={() => {
              console.log(lootbox);
            }}
            disabled={false}
          ></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default Lootbox;
