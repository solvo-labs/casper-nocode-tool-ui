import React, { useEffect, useMemo, useState } from "react";
import { SERVER_API, fetchLootboxNamedKeys, getLootboxData, getLootboxItem, getNftCollection, getNftMetadata } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Grid, Stack, Typography, Divider, CircularProgress } from "@mui/material";
import { LootboxData, LootboxItem, NFT } from "../../utils/types";
import { LootboxCard } from "../../components/ListerComponentCard";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING, RarityLevel } from "../../utils/enum";
import AddItemToLootboxModal from "../../components/AddItemToLootboxModal";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, CLKey, CLByteArray, DeployUtil } from "casper-js-sdk";

import axios from "axios";
import toastr from "toastr";

const MyLootboxes = () => {
  const [publicKey, provider] = useOutletContext<[publicKey: any, provider: any]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchNFTLoading, setFetchNFTLoading] = useState<boolean>(false);
  const [lootboxes, setLootboxes] = useState<LootboxData[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<number>();
  const [selectedLootbox, setSelectedLootbox] = useState<LootboxData>();
  const [items, setItems] = useState<NFT[]>([]);
  const [collection, setCollection] = useState<any>();
  const [isAddItem, setIsAddItem] = useState<boolean>(true);
  const [itemName, setItemName] = useState<string>("");
  const [rarity, setRarity] = useState<number>(-1);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [rarityList] = useState<string[]>(Object.keys(RarityLevel).filter((v) => isNaN(Number(v))));

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLootboxes = async () => {
      const data = await fetchLootboxNamedKeys(publicKey);
      const promises = data.map((dt) => getLootboxData(dt.key));
      const result: LootboxData[] = await Promise.all(promises);

      setLootboxes(result);
      setLoading(false);
    };

    fetchLootboxes();

    const interval = setInterval(() => fetchLootboxes(), 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const init = async (loader: boolean) => {
      setFetchNFTLoading(loader);
      if (selectedLootbox) {
        const nftCollection = await getNftCollection("hash-" + selectedLootbox.nft_collection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const accountHash = ownerPublicKey.toAccountHashStr();

        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        loader && toastr.info("First, you must approve this collection; if you have already approved it before, do not take this warning lightly.");

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata("hash-" + selectedLootbox.nft_collection, index.toString(), accountHash.slice(13)));
        }

        const allNfts = await Promise.all(promises);
        const nftMetas = allNfts.filter((nft) => nft.isMyNft && nft.burnt == false);

        const data: LootboxItem[] = [];

        for (let index = 0; index < selectedLootbox.deposited_item_count; index++) {
          const result = await getLootboxItem(selectedLootbox.key, index);

          data.push(result);
        }

        if (nftMetas.length === 0) setIsAddItem(false);

        const filteredItems = allNfts.filter((al) => data.findIndex((dt) => dt.tokenIdValue === al.index) > -1);

        setCollection(nftCollection);
        setItems(filteredItems);
        setNfts(nftMetas);
        setFetchNFTLoading(false);
      }
    };

    init(true);

    const interval = setInterval(() => init(false), 30000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedLootbox]);

  const disable = useMemo(() => {
    return selectedNFTIndex == undefined || rarity < 0;
  }, [selectedNFTIndex, rarity]);

  const approve = async () => {
    toastr.warning("Running this operation executes set_approve_for_all. Please make sure that you want to perform this operation.");

    setLoading(true);
    try {
      if (selectedLootbox) {
        const contract = new Contracts.Contract();
        contract.setContractHash("hash-" + selectedLootbox.nft_collection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const operatorHash = selectedLootbox.key.replace("hash-", "");

        const args = RuntimeArgs.fromMap({
          token_owner: ownerPublicKey,
          approve_all: CLValueBuilder.bool(true),
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(operatorHash, "hex")))),
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

          toastr.success(response.data, "Approve deployed successfully.");
          // addItem();
          // setLoading(false);
        } catch (error: any) {
          toastr.error("Error: " + error);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      toastr.error("error");
    }
  };

  const addItem = async () => {
    try {
      if (selectedNFTIndex !== undefined && selectedLootbox) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedLootbox.key);

        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({
          item_name: CLValueBuilder.string(itemName),
          token_id: CLValueBuilder.u64(selectedNFTIndex),
          rarity: CLValueBuilder.u64(rarity),
        });

        const deploy = contract.callEntrypoint("add_item", args, ownerPublicKey, "casper-test", "5000000000");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });
          toastr.success(response.data, "Item added to Lootbox successfully.");
          navigate("/my-lootboxes");

          setSelectedLootbox(undefined);
          setSelectedNFTIndex(undefined);
          setLoading(false);
        } catch (error: any) {
          toastr.error("Item couldn't be successfully uploaded to the Lootbox. Error: " + error);
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toastr.error("Error: " + error);
    }
  };

  const withdraw = async () => {
    try {
      if (selectedLootbox) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedLootbox.key);

        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({});

        const deploy = contract.callEntrypoint("withdraw", args, ownerPublicKey, "casper-test", "5000000000");
        const deployJson = DeployUtil.deployToJson(deploy);

        try {
          const sign = await provider.sign(JSON.stringify(deployJson), publicKey);
          let signedDeploy = DeployUtil.setSignature(deploy, sign.signature, ownerPublicKey);
          signedDeploy = DeployUtil.validateDeploy(signedDeploy);
          const data = DeployUtil.deployToJson(signedDeploy.val);
          const response = await axios.post(SERVER_API + "deploy", data, {
            headers: { "Content-Type": "application/json" },
          });

          toastr.success(response.data, "Withdraw completed successfully.");
          navigate("/my-lootboxes");
          setLoading(false);
        } catch (error: any) {
          toastr.error(error);
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
      toastr.error("Error: " + error);
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
    <Grid marginBottom={"2rem"}>
      <Stack>
        {lootboxes.length <= 0 && (
          <div key={"no-lootboxes-div"} style={{ display: "flex", alignItems: "center" }}>
            <CreatorRouter explain={DONT_HAVE_ANYTHING.LOOTBOX} handleOnClick={() => navigate("/create-lootbox")}></CreatorRouter>
          </div>
        )}
        {lootboxes.length > 0 && (
          <div>
            <Typography variant="h5">My Lootboxes</Typography>
            <Divider sx={{ backgroundColor: "red", marginBottom: " 1rem !important" }}></Divider>
            {lootboxes?.map((ltbx: LootboxData, index: number) => (
              <div key={index}>
                <LootboxCard
                  key={index}
                  hash={ltbx.key}
                  name={ltbx.name}
                  asset={ltbx.asset}
                  description={ltbx.description}
                  menuOpen={open}
                  anchorEl={anchorEl}
                  handleCloseMenu={handleCloseMenu}
                  handleOpenMenu={() => {}}
                  handleAddNFT={() => {}}
                  onClick={() => {
                    setSelectedLootbox(ltbx);
                  }}
                />
                {selectedLootbox && (
                  <>
                    <AddItemToLootboxModal
                      lootbox={selectedLootbox}
                      nfts={nfts}
                      open={selectedLootbox !== undefined}
                      selectedNFTIndex={selectedNFTIndex}
                      handleClose={() => {
                        setSelectedLootbox(undefined);
                        setSelectedNFTIndex(undefined);
                        setIsAddItem(true);
                      }}
                      collection={collection}
                      handleChangeIndex={setSelectedNFTIndex}
                      addItem={addItem}
                      disable={disable}
                      loadingNFT={fetchNFTLoading}
                      isAddItem={isAddItem}
                      itemName={itemName}
                      handleChangeItemName={(text: string) => setItemName(text)}
                      showButtonOnChange={() => {
                        setSelectedNFTIndex(undefined);
                        setIsAddItem(!isAddItem);
                      }}
                      items={items}
                      withdrawOnClick={withdraw}
                      rarity={rarity}
                      rarityList={rarityList}
                      handleChangeItemRarity={(rarity: any) => setRarity(rarity)}
                      approveOnClick={approve}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Stack>
    </Grid>
  );
};

export default MyLootboxes;
