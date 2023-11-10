import { CircularProgress, Grid, MenuItem, SelectChangeEvent, Stack, Theme, Typography } from "@mui/material";
import { CustomInput } from "../../components/CustomInput";
import { makeStyles } from "@mui/styles";
import ImageUpload from "../../components/ImageUpload";
import { useEffect, useMemo, useState } from "react";
import { NFTStorage } from "nft.storage";
import { CollectionMetada, LootboxInputData } from "../../utils/types";
import { CustomButton } from "../../components/CustomButton";
import { SERVER_API, fetchCep78NamedKeys, getNftCollection } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
// @ts-ignore
import { RuntimeArgs, DeployUtil, CLValueBuilder, Contracts, CLPublicKey, CLAccountHash } from "casper-js-sdk";
import { CustomSelect } from "../../components/CustomSelect";
import { CasperHelpers, lootboxStorageContract } from "../../utils";
import axios from "axios";
import toastr from "toastr";

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
  const navigate = useNavigate();

  const [collections, setCollections] = useState<CollectionMetada[]>([]);
  const [file, setFile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingCreateLootbox, setLoadingCreateLootbox] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [lootbox, setLootbox] = useState<LootboxInputData>({
    name: "",
    desciption: "",
    asset: "",
    collection: undefined,
    lootbox_price: 0,
    items_per_lootbox: 0,
    max_lootboxes: 0,
  });

  const handleClear = () => {
    setFile(null);
    setLootbox({ ...lootbox, asset: "" });
  };

  const createLootbox = async () => {
    setLoadingCreateLootbox(true);
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
          max_items: CLValueBuilder.u64(lootbox.max_lootboxes * lootbox.items_per_lootbox),
          storage_key: new CLAccountHash(Buffer.from(lootboxStorageContract, "hex")),
        });

        const deploy = contract.install(new Uint8Array(lootboxWasm), args, "130000000000", ownerPublicKey, "casper-test");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });
          setLoadingCreateLootbox(false);
          toastr.success(response.data, "Lootbox deployed successfully.");
          navigate("/my-lootboxes");
        } catch (error: any) {
          setLoadingCreateLootbox(false);
          toastr.error("Lootbox couldn't be deploy. Error: " + error);
        }
      }
    } catch (error) {
      setLoadingCreateLootbox(false);
      toastr.error("Error: " + error);
    }
  };

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

    const interval = setInterval(() => init(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const disable = useMemo(() => {
    const disable =
      !lootbox.name.length || !lootbox.desciption.length || !lootbox.collection || lootbox.lootbox_price <= 0 || lootbox.items_per_lootbox <= 0 || lootbox.max_lootboxes <= 0;
    return disable;
  }, [lootbox]);

  if (loading || loadingCreateLootbox) {
    return (
      <Stack
        style={{
          height: "50vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        direction={"column"}
        spacing={"2rem"}
      >
        {loadingCreateLootbox && <Typography>Lootbox is being created.</Typography>}
        <CircularProgress />
      </Stack>
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
            label="Price (CSPR)"
            name="price"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLootbox({ ...lootbox, lootbox_price: Number(e.target.value) })}
            placeholder="Price (CSPR)"
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

          <ImageUpload file={file} loading={imageLoading} text="Uplaod image for lootbox cover" setFile={(data) => setFile(data)} handleClear={handleClear}></ImageUpload>

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
          <CustomButton label="Create Lootbox" onClick={createLootbox} disabled={disable}></CustomButton>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default CreateLootbox;
