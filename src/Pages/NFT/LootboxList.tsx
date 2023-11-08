import { useEffect, useState } from "react";
import { SERVER_API, getAllLootboxes, getLootboxItem, getLootboxItemOwner, getNftCollection, getNftMetadata } from "../../utils/api";
import { lootboxStorageContract, uint32ArrayToHex } from "../../utils";
import { Box, CircularProgress, Divider, Grid, Modal, Stack, Typography } from "@mui/material";
import { LootboxData, LootboxItem } from "../../utils/types";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LootboxCard } from "../../components/ListerComponentCard";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, CLKey, CLByteArray, DeployUtil, CLAccountHash } from "casper-js-sdk";
import { NftCard } from "../../components/NftCard";
import axios from "axios";
import { CustomButton } from "../../components/CustomButton";
import toastr from "toastr";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 960,
  height: 720,
  bgcolor: "#0F1429",
  color: "white",
  border: "1px solid red",
  borderRadius: "12px",
  boxShadow: 24,
  pt: 4,
  px: 4,
  pb: 4,
  "&:focus": {
    outline: "none",
  },
};

export const LootboxList = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [lootboxes, setLootboxes] = useState<LootboxData[]>([]);
  const [selectedLootbox, setSelectedLootbox] = useState<LootboxData>();
  const [publicKey, provider, , , , , , , , , lootboxDepositWasm] =
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
        lootboxWasm: any,
        lootboxDepositWasm: any
      ]
    >();

  const [itemData, setItemData] = useState<any[]>([]);
  const [collection, setCollection] = useState<any>();
  const [loadingNFT, setLoadingNFT] = useState<boolean>(false);
  const [lootboxOwners, setLootboxOwners] = useState<any>([]);

  const navigate = useNavigate();
  useEffect(() => {
    const init = async () => {
      const data = await getAllLootboxes(lootboxStorageContract);
      setLootboxes(data);
      setLoading(false);
    };

    init();
  }, []);

  const purchase = async () => {
    setLoadingNFT(true);
    try {
      if (selectedLootbox) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();

        const args = RuntimeArgs.fromMap({
          lootbox_contract_hash: new CLAccountHash(Buffer.from(selectedLootbox.key.slice(5), "hex")),
          amount: CLValueBuilder.u512(selectedLootbox.lootbox_price),
        });

        const deploy = contract.install(new Uint8Array(lootboxDepositWasm), args, "20000000000", ownerPublicKey, "casper-test");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          setLoadingNFT(false);
          toastr.success(response.data, "Lootbox deployed successfully.");
        } catch (error: any) {
          setLoadingNFT(false);
          toastr.error("Lootbox couldn't be deploy. Error: " + error);
        }
      }
    } catch (error) {
      setLoadingNFT(false);
      toastr.error("Error: " + error);
    }
  };

  const claim = async (nftIndex: number) => {
    setLoading(true);
    try {
      if (selectedLootbox) {
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedLootbox.key);

        const args = RuntimeArgs.fromMap({
          item_index: CLValueBuilder.u64(nftIndex),
        });

        const deploy = contract.callEntrypoint("claim", args, ownerPublicKey, "casper-test", "12000000000");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Claim successfully.");
          // setLoading(false);
          // navigate("/marketplace");
        } catch (error: any) {
          alert(error.message);
        }
      }
    } catch (error) {
      setLoadingNFT(false);
      toastr.error("Error: " + error);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      if (selectedLootbox) {
        setLoadingNFT(true);
        const nftCollection = await getNftCollection("hash-" + selectedLootbox.nft_collection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const accountHash = ownerPublicKey.toAccountHashStr();

        const items: LootboxItem[] = [];
        for (let index = 0; index < selectedLootbox.deposited_item_count; index++) {
          const result = await getLootboxItem(selectedLootbox.key, index);

          items.push(result);
        }

        const nftMetasPromises = items.map((it: LootboxItem) => getNftMetadata("hash-" + selectedLootbox.nft_collection, it.tokenIdValue.toString(), accountHash.slice(13)));

        const nfts = await Promise.all(nftMetasPromises);

        const ownersData = await getLootboxItemOwner(selectedLootbox.key);
        // console.log(data);
        // setLootboxOwners(data);

        const finalData = nfts.map((nft: any, index: number) => {
          return { ...nft, ...items[index], owner: ownersData[index] };
        });
        console.log(finalData);
        setItemData(finalData);
        setCollection(nftCollection);
        setLoadingNFT(false);
      }
    };

    fetch();
  }, [selectedLootbox]);

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

  const modal = () => {
    return (
      <Modal open={selectedLootbox !== undefined} onClose={() => setSelectedLootbox(undefined)}>
        <Box sx={style} display={"flex"} flexDirection={"column"}>
          {loadingNFT ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            <>
              <Grid container direction={"column"} gap={1}>
                <Grid container direction={"row"} justifyContent={"space-between"}>
                  <Typography variant="h5">
                    Lootbox <b>{selectedLootbox?.name}</b>
                  </Typography>
                  <CustomButton disabled={false} label="Buy Lootbox" onClick={purchase}></CustomButton>
                </Grid>
                <Typography variant="subtitle1">
                  Max Lootbox count is <b>{selectedLootbox?.max_lootboxes}</b>, Item count per lootbox is <b>{selectedLootbox?.items_per_lootbox}</b>
                </Typography>
                <Typography variant="subtitle1">
                  Lootbox price is <b>{(selectedLootbox?.lootbox_price || 0) / Math.pow(10, 9)} (CSPR)</b>
                </Typography>
              </Grid>
              <Grid container marginTop={"2rem"}>
                {itemData.map((nft: any, index: number) => (
                  <Grid item md={4} key={index}>
                    <Grid container direction={"column"}>
                      <NftCard
                        key={nft.index}
                        asset={nft.asset}
                        description={nft.description}
                        index={nft.index}
                        name={nft.nameText}
                        onClick={() => {}}
                        isSelected={false}
                        amIOwner={nft.isMyNft}
                      />
                      {nft.owner.owner == CLPublicKey.fromHex(publicKey).toAccountHashStr().slice(13) ? (
                        <Grid item display={"flex"} justifyContent={"center"}>
                          <CustomButton label="Claim NFT" disabled={false} onClick={() => claim(index)}></CustomButton>
                        </Grid>
                      ) : null}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Modal>
    );
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
    <Grid marginBottom={"2rem"}>
      <Stack>
        {lootboxes.length <= 0 && (
          <div key={"no-lootboxes-div"} style={{ display: "flex", alignItems: "center" }}>
            <CreatorRouter explain={DONT_HAVE_ANYTHING.LOOTBOX} handleOnClick={() => navigate("/create-lootbox")}></CreatorRouter>
          </div>
        )}
        {lootboxes.length > 0 && (
          <div>
            <Typography variant="h5">Lootbox List</Typography>
            <Divider sx={{ backgroundColor: "red", marginBottom: " 1rem !important" }}></Divider>
            {lootboxes?.map((ltbx: LootboxData, index: number) => (
              <div key={index}>
                <LootboxCard
                  key={index}
                  hash={ltbx.key}
                  name={ltbx.name}
                  asset={ltbx.asset}
                  description={ltbx.description}
                  menuOpen={false}
                  anchorEl={null}
                  handleCloseMenu={() => {}}
                  handleOpenMenu={() => {}}
                  handleAddNFT={() => {}}
                  onClick={() => {
                    setSelectedLootbox(ltbx);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Stack>
      {modal()}
    </Grid>
  );
};
