import React, { useEffect, useMemo, useState } from "react";
import { SERVER_API, fetchLootboxNamedKeys, getLootboxData, getNftCollection, getNftMetadata } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Grid, Stack, Typography, Divider, CircularProgress } from "@mui/material";
import { LootboxData, NFT } from "../../utils/types";
import { LootboxCard } from "../../components/ListerComponentCard";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING } from "../../utils/enum";
import AddItemToLootboxModal from "../../components/AddItemToLootboxModal";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, CLKey, CLByteArray, DeployUtil } from "casper-js-sdk";

import axios from "axios";
import toastr from "toastr";
import LootboxModal from "../../components/LootboxModal";

const MyLootboxes = () => {
  const [publicKey, provider] = useOutletContext<[publicKey: any, provider: any]>();

  const [loading, setLoading] = useState<boolean>(true);
  const [fetchNFTLoading, setFetchNFTLoading] = useState<boolean>(false);

  const [lootboxes, setLootboxes] = useState<LootboxData[]>([]);
  const [addItemModalOpen, setAddItemModalOpen] = useState<boolean>(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>();
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<number>(-1);
  const [selectedLootbox, setSelectedLootbox] = useState<LootboxData>();
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();

  const handleOpen = (setState: any) => setState(true);
  const handleClose = (setState: any) => {
    setState(false);
    setSelectedNFTIndex(-1);
  };

  useEffect(() => {
    const fetchLootboxes = async () => {
      const data = await fetchLootboxNamedKeys(publicKey);
      const promises = data.map((dt) => getLootboxData(dt.key));
      const result: LootboxData[] = await Promise.all(promises);

      setLootboxes(result);
      setLoading(false);
    };

    fetchLootboxes();
  }, []);

  useEffect(() => {
    const init = async () => {
      setFetchNFTLoading(true);
      if (selectedCollection) {
        const nftCollection = await getNftCollection("hash-" + selectedCollection);
        const ownerPublicKey = CLPublicKey.fromHex(publicKey);
        const accountHash = ownerPublicKey.toAccountHashStr();

        const nftCount = parseInt(nftCollection.number_of_minted_tokens.hex);

        let promises = [];
        for (let index = 0; index < nftCount; index++) {
          promises.push(getNftMetadata("hash-" + selectedCollection, index.toString(), accountHash.slice(13)));
        }

        const nftMetas = await Promise.all(promises);

        // console.log("nftmeta--------->", nftMetas);
        setNfts(nftMetas);
        setFetchNFTLoading(false);
      }
    };
    init();
  }, [selectedCollection]);

  const disable = useMemo(() => {
    return selectedNFTIndex == -1;
  }, [selectedNFTIndex]);

  const approve = async () => {
    setLoading(true);
    try {
      if (selectedLootbox?.key) {
        const contract = new Contracts.Contract();
        contract.setContractHash("hash-" + selectedCollection);

        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const operatorHash = selectedLootbox.key.replace("hash-", "");

        const args = RuntimeArgs.fromMap({
          operator: new CLKey(new CLByteArray(Uint8Array.from(Buffer.from(operatorHash, "hex")))),
          token_id: CLValueBuilder.u64(selectedNFTIndex),
        });

        const deploy = contract.callEntrypoint("approve", args, ownerPublicKey, "casper-test", "10000000000");

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
          addItem();
          setLoading(false);
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
      if (selectedNFTIndex != -1 && selectedLootbox) {
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedLootbox.key);

        const ownerPublicKey = CLPublicKey.fromHex(publicKey);

        const args = RuntimeArgs.fromMap({
          item_name: CLValueBuilder.string("Item-2"),
          token_id: CLValueBuilder.u64(selectedNFTIndex),
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
        } catch (error: any) {
          toastr.error("Item couldn't be successfully uploaded to the Lootbox. Error: " + error);
        }
      }
    } catch (error) {
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
            <Typography variant="h5">Lootboxes</Typography>
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
                  handleOpenMenu={(e: any) => {
                    handleClickMenu(e);
                    setSelectedLootbox(ltbx);
                    setSelectedCollection(ltbx.nft_collection);
                  }}
                  handleAddNFT={() => {
                    console.log(ltbx);
                    handleOpen(setAddItemModalOpen);
                    handleCloseMenu();
                  }}
                  onClick={() => {
                    console.log("here");
                    setShowDetailsModal(true);
                    setSelectedLootbox(ltbx);
                  }}
                />
                {selectedLootbox && (
                  <>
                    <AddItemToLootboxModal
                      lootbox={selectedLootbox}
                      nfts={nfts}
                      open={addItemModalOpen}
                      selectedNFTIndex={selectedNFTIndex}
                      handleClose={() => {
                        handleClose(setAddItemModalOpen);
                        setSelectedNFTIndex(-1);
                      }}
                      handleChangeIndex={setSelectedNFTIndex}
                      addItem={approve}
                      disable={disable}
                      loadingNFT={fetchNFTLoading}
                    />
                    <LootboxModal
                      open={showDetailsModal}
                      handleClose={() => {
                        setShowDetailsModal(false);
                      }}
                      lootbox={selectedLootbox}
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
