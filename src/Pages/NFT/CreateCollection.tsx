import { useMemo, useState } from "react";
// @ts-ignore
import { Contracts, RuntimeArgs, CLPublicKey, DeployUtil, CLValueBuilder } from "casper-js-sdk";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { SERVER_API } from "../../utils/api";
import { Collection } from "../../utils/types";
import { CircularProgress, Divider, Grid, MenuItem, Stack, Theme, Tooltip, Typography } from "@mui/material";
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
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { BURN_MODE_EXPLANATION, METADATA_MUTABILITY_EXPLANATION, MINTING_MODE_EXPLANATION, OWNER_REVERSE_LOOKUP_MODE_EXPLANATION } from "../../utils";

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
  const [loading, setLoading] = useState<boolean>(false);

  const disable = useMemo(() => {
    const disable = !(collectionData.name && collectionData.symbol);
    return disable;
  }, [collectionData]);

  const mintCollection = async () => {
    setLoading(true);
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
        json_schema: CLValueBuilder.string(JSON.stringify({})),
        minting_mode: CLValueBuilder.u8(collectionData.mintingMode),
        burn_mode: CLValueBuilder.u8(collectionData.burnMode),
        holder_mode: CLValueBuilder.u8(collectionData.holderMode),
        named_key_convention: CLValueBuilder.u8(collectionData.namedKeyConventionMode),
        owner_reverse_lookup_mode: CLValueBuilder.u8(collectionData.ownerReverseLookupMode),
        events_mode: CLValueBuilder.u8(2),
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

        let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);

        signedDeploy = DeployUtil.validateDeploy(signedDeploy);

        const data = DeployUtil.deployToJson(signedDeploy.val);

        const response = await axios.post(SERVER_API + "deploy", data, {
          headers: { "Content-Type": "application/json" },
        });
        toastr.success(response.data, "CEP-78 Collection deployed successfully.");
        window.open("https://testnet.cspr.live/deploy/" + response.data, "_blank");

        navigate("/my-collections");
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        toastr.error("Error: " + error);
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
      setLoading(false);
    }
  };

  const listSelectItem = (value: Object) => {
    const listItem = Object.values(value).filter((v) => isNaN(Number(v)));
    return listItem.map((keys: any, value: any) => (
      <MenuItem key={value} value={value}>
        {keys}
      </MenuItem>
    ));
  };

  if (loading) {
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
        <Typography>Collection is being created.</Typography>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <div
      style={{
        height: "calc(100vh-5rem)",
        minWidth: "21rem",
        padding: "1rem",
        marginBottom: "2rem",
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
            <Stack spacing={2} direction={"column"} marginTop={4} className={classes.stackContainer}>
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
                floor={"dark"}
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
                floor={"dark"}
              ></CustomInput>
              <Divider
                // textAlign="left"
                sx={{
                  color: "white",
                  "&::before, &::after": {
                    borderTop: "thin solid red !important",
                  },
                }}
              >
                Collection Features
              </Divider>
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
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NFTOwnershipMode)}
              </CustomSelect>
              <CustomSelect
                id="collectionKind"
                value={collectionData.kind}
                label="Collection Kind"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    kind: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NFTKind)}
              </CustomSelect>
              <CustomSelect
                id="collectionnftMetadataKind"
                value={collectionData.nftMetadataKind}
                label="Collection Metadata Kind"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    nftMetadataKind: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NFTMetadataKind)}
              </CustomSelect>
              <CustomSelect
                id="whiteListMode"
                value={collectionData.whiteListMode}
                label="White List Mode"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    whiteListMode: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(WhiteListMode)}
              </CustomSelect>
              <CustomSelect
                id="identifierMode"
                value={collectionData.identifierMode}
                label="Identifier Mode"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    identifierMode: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NFTIdentifierMode)}
              </CustomSelect>
              <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
                <CustomSelect
                  id="metadataMutability"
                  value={collectionData.metadataMutability}
                  label="Metadata Mutability"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      metadataMutability: e.target.value,
                    });
                  }}
                  titlePosition={"relative"}
                  titleTop={"10px"}
                >
                  {listSelectItem(MetadataMutability)}
                </CustomSelect>
                <Tooltip title={<div style={{ whiteSpace: "pre-line", fontSize: "0.8rem" }}>{METADATA_MUTABILITY_EXPLANATION}</div>}>
                  <div
                    style={{
                      background: "gray",
                      borderRadius: "12px",
                      height: "24px",
                      width: "24px",
                      display: "flex",
                      justifyItems: "center",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <QuestionMarkIcon sx={{ color: "white", height: "16px" }}></QuestionMarkIcon>
                  </div>
                </Tooltip>
              </Stack>
              <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
                <CustomSelect
                  id="mintingMode"
                  value={collectionData.mintingMode}
                  label="Minting Mode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      mintingMode: e.target.value,
                    });
                  }}
                  titlePosition={"relative"}
                  titleTop={"10px"}
                >
                  {listSelectItem(MintingMode)}
                </CustomSelect>
                <Tooltip title={<div style={{ whiteSpace: "pre-line", fontSize: "0.8rem" }}>{MINTING_MODE_EXPLANATION}</div>}>
                  <div
                    style={{
                      background: "gray",
                      borderRadius: "12px",
                      height: "24px",
                      width: "24px",
                      display: "flex",
                      justifyItems: "center",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <QuestionMarkIcon sx={{ color: "white", height: "16px" }}></QuestionMarkIcon>
                  </div>
                </Tooltip>
              </Stack>
              <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
                <CustomSelect
                  id="burnMode"
                  value={collectionData.burnMode}
                  label="Burn Mode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      burnMode: e.target.value,
                    });
                  }}
                  titlePosition={"relative"}
                  titleTop={"10px"}
                >
                  {listSelectItem(BurnMode)}
                </CustomSelect>
                <Tooltip title={<div style={{ whiteSpace: "pre-line", fontSize: "0.8rem" }}>{BURN_MODE_EXPLANATION}</div>}>
                  <div
                    style={{
                      background: "gray",
                      borderRadius: "12px",
                      height: "24px",
                      width: "24px",
                      display: "flex",
                      justifyItems: "center",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <QuestionMarkIcon sx={{ color: "white", height: "16px" }}></QuestionMarkIcon>
                  </div>
                </Tooltip>
              </Stack>
              <CustomSelect
                id="holderMode"
                value={collectionData.holderMode}
                label="Holder Mode"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    holderMode: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NFTHolderMode)}
              </CustomSelect>
              <CustomSelect
                id="namedKeyConventionMode"
                value={collectionData.namedKeyConventionMode}
                label="Named Key Convention Mode"
                onChange={(e: any) => {
                  setCollectionData({
                    ...collectionData,
                    namedKeyConventionMode: e.target.value,
                  });
                }}
                titlePosition={"relative"}
                titleTop={"10px"}
              >
                {listSelectItem(NamedKeyConventionMode)}
              </CustomSelect>
              <Stack direction={"row"} spacing={2} justifyContent={"center"} alignItems={"center"}>
                <CustomSelect
                  id="ownerReverseLookupMode"
                  value={collectionData.ownerReverseLookupMode}
                  label="Owner Reverse Lookup Mode"
                  onChange={(e: any) => {
                    setCollectionData({
                      ...collectionData,
                      ownerReverseLookupMode: e.target.value,
                    });
                  }}
                  titlePosition={"relative"}
                  titleTop={"10px"}
                >
                  {listSelectItem(OwnerReverseLookupMode)}
                </CustomSelect>
                <Tooltip title={<div style={{ whiteSpace: "pre-line", fontSize: "0.8rem" }}>{OWNER_REVERSE_LOOKUP_MODE_EXPLANATION}</div>}>
                  <div
                    style={{
                      background: "gray",
                      borderRadius: "12px",
                      height: "24px",
                      width: "24px",
                      display: "flex",
                      justifyItems: "center",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <QuestionMarkIcon sx={{ color: "white", height: "16px" }}></QuestionMarkIcon>
                  </div>
                </Tooltip>
              </Stack>
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
