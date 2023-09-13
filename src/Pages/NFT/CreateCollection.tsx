import { useMemo, useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { Collection } from "../../utils/types";
import { Divider, FormControl, Grid, InputLabel, MenuItem, Stack, Theme, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CustomInput } from "../../components/CustomInput";
import { CustomButton } from "../../components/CustomButton";
import {
  BurnMode,
  MetadataMutability,
  MintingMode,
  NFTHolderMode,
  NFTIdentifierMode,
  NFTKind,
  NFTMetadataKind,
  NFTOwnershipMode,
  NamedKeyConventionMode,
  OwnerReverseLookupMode,
  WhiteListMode,
} from "../../utils/enum";
import { CustomSelect } from "../../components/CustomSelect";
import toastr from "toastr";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    [theme.breakpoints.down("sm")]: {
      marginBottom: 2,
      marginTop: 2,
      padding: "24px",
    },
  },
  center: {
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  title: {
    position: "relative",
    borderBottom: "1px solid #FF0011 !important",
  },
  titleItem: {
    [theme.breakpoints.down("sm")]: {
      marginTop: "2rem !important",
    },
  },
  gridContainer: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "auto",
    padding: "1rem",
  },
  stackContainer: {
    minWidth: "25rem",
    [theme.breakpoints.down("sm")]: {
      minWidth: "10rem",
    },
  },
}));

export const CreateCollection = () => {
  const [collectionData, setCollectionData] = useState<Collection>({
    name: "",
    symbol: "",
    totalSupply: 0,
    ownershipMode: 2,
    kind: 1,
    nftMetadataKind: 2,
    whiteListMode: 0,
    identifierMode: 0,
    metadataMutability: 1,
    mintingMode: 0,
    burnMode: 0,
    holderMode: 2,
    namedKeyConventionMode: 0,
    ownerReverseLookupMode: 0,
  });

  const [publicKey, provider, , cep78Wasm] = useOutletContext<[publicKey: string, provider: any, cep18Wasm: ArrayBuffer, cep78Wasm: ArrayBuffer]>();
  const navigate = useNavigate();
  const classes = useStyles();

  const disable = useMemo(() => {
    const disable = !(collectionData.name && collectionData.symbol);
    return disable;
  }, [collectionData]);

  const mintCollection = async () => {
    try {
      const ownerPublicKey = CLPublicKey.fromHex(publicKey);

      // contract
      const contract = new Contracts.Contract();

      const args = RuntimeArgs.fromMap({
        collection_name: CLValueBuilder.string(collectionData.name),
        collection_symbol: CLValueBuilder.string(collectionData.symbol),
        total_token_supply: CLValueBuilder.u64(Number(collectionData.totalSupply)),
        ownership_mode: CLValueBuilder.u8(collectionData.ownershipMode),
        nft_kind: CLValueBuilder.u8(collectionData.kind),
        nft_metadata_kind: CLValueBuilder.u8(collectionData.nftMetadataKind),
        whitelist_mode: CLValueBuilder.u8(collectionData.whiteListMode),
        identifier_mode: CLValueBuilder.u8(collectionData.identifierMode),
        metadata_mutability: CLValueBuilder.u8(collectionData.metadataMutability),
        json_schema: CLValueBuilder.string(
          JSON.stringify({
            properties: {
              name: { name: "name", description: "", required: true },
              description: { name: "description", description: "", required: true },
              image: { name: "image", description: "", required: true },
            },
          })
        ),
        minting_mode: CLValueBuilder.u8(collectionData.mintingMode),
        burn_mode: CLValueBuilder.u8(collectionData.burnMode),
        holder_mode: CLValueBuilder.u8(collectionData.holderMode),
        named_key_convention: CLValueBuilder.u8(collectionData.namedKeyConventionMode),
        owner_reverse_lookup_mode: CLValueBuilder.u8(collectionData.namedKeyConventionMode),
      });

      const deploy = contract.install(
        new Uint8Array(cep78Wasm),
        args,
        "300000000000",
        ownerPublicKey,
        "casper-test"
        // [publicKey]
      );

      const deployJson = DeployUtil.deployToJson(deploy);
      // signer logic
      try {
        const sign = await provider.sign(JSON.stringify(deployJson), publicKey);

        // setActionLoader(true);

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "CEP-78 Collection deployed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-collections");
        // setActionLoader(false);
      } catch (error: any) {
        alert(error.message);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const listSelectItem = (value: Object) => {
    const listItem = Object.values(value).filter((v) => isNaN(Number(v)));
    return listItem.map((keys: any, value: any) => <MenuItem value={value}>{keys}</MenuItem>);
  };

  return (
    <div
      style={{
        height: "calc(100vh-5rem)",
        minWidth: "21rem",
        padding: "1rem",
      }}
    >
      <Grid container className={classes.container}>
        <Grid container className={classes.center}>
          <Grid item className={classes.titleItem}>
            <Typography className={classes.title} variant="h5">
              Create Collection
            </Typography>
          </Grid>
          <Grid container className={classes.gridContainer}>
            <Stack spacing={4} direction={"column"} marginTop={4} className={classes.stackContainer}>
              <CustomInput
                placeholder="Collection Name"
                label="Collection Name"
                id="collectionName"
                name="collectionName"
                type="text"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    name: e.target.value,
                  });
                }}
                value={collectionData.name}
              ></CustomInput>
              <CustomInput
                placeholder="Symbol"
                label="Symbol"
                id="collectionSymbol"
                name="collectionSymbol"
                type="text"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    symbol: e.target.value,
                  });
                }}
                value={collectionData.symbol}
              ></CustomInput>
              <CustomInput
                placeholder="Total Supply"
                label="Total Supply"
                id="totalSupply"
                name="totalSupply"
                type="text"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    totalSupply: e.target.value,
                  });
                }}
                value={collectionData.totalSupply}
              ></CustomInput>
              <Divider sx={{ backgroundColor: "red", marginTop: "3rem !important" }}></Divider>

              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Ownership Mode
                </InputLabel>
                <CustomSelect
                  id="ownershipMode"
                  value={collectionData.ownershipMode}
                  label="Ownership Mode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      ownershipMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NFTOwnershipMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Collection Kind
                </InputLabel>
                <CustomSelect
                  id="collectionkind"
                  value={collectionData.kind}
                  label="Collection kind"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      kind: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NFTKind)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Collection Kind</InputLabel>
                <CustomSelect
                  id="collectionnftMetadataKind"
                  value={collectionData.nftMetadataKind}
                  label="Collection metadata kind"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      nftMetadataKind: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NFTMetadataKind)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  White List Mode
                </InputLabel>
                <CustomSelect
                  id="whiteListMode"
                  value={collectionData.whiteListMode}
                  label="whiteListMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      whiteListMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(WhiteListMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Identifier Mode
                </InputLabel>
                <CustomSelect
                  id="identifierMode"
                  value={collectionData.identifierMode}
                  label="identifierMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      identifierMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NFTIdentifierMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Metadata Mutability
                </InputLabel>
                <CustomSelect
                  id="metadataMutability"
                  value={collectionData.metadataMutability}
                  label="identifierMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      metadataMutability: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(MetadataMutability)}
                </CustomSelect>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Minting Mode
                </InputLabel>
                <CustomSelect
                  id="mintinMode"
                  value={collectionData.mintingMode}
                  label="identifierMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      mintingMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(MintingMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Burn Mode
                </InputLabel>
                <CustomSelect
                  id="burnMode"
                  value={collectionData.burnMode}
                  label="burnMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      burnMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(BurnMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Holder Mode
                </InputLabel>
                <CustomSelect
                  id="holderMode"
                  value={collectionData.holderMode}
                  label="holderMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      holderMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NFTHolderMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Named Key Convention Mode
                </InputLabel>
                <CustomSelect
                  id="holderMode"
                  value={collectionData.namedKeyConventionMode}
                  label="holderMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      namedKeyConventionMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(NamedKeyConventionMode)}
                </CustomSelect>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "white" }} id="demo-simple-select-label">
                  Owner Reverse Lookup Mode
                </InputLabel>
                <CustomSelect
                  id="holderMode"
                  value={collectionData.ownerReverseLookupMode}
                  label="holderMode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      ownerReverseLookupMode: e.target.value,
                    });
                  }}
                >
                  {listSelectItem(OwnerReverseLookupMode)}
                </CustomSelect>
              </FormControl>
              <Grid paddingTop={2} container justifyContent={"center"}>
                <CustomButton onClick={mintCollection} disabled={disable} label="Create Collection" />
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
