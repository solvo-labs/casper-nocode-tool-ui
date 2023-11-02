import React, { useEffect, useMemo, useState } from "react";
import { SERVER_API, fetchCep78NamedKeys, fetchLootboxNamedKeys, getLootboxData, getNftCollection, getNftMetadata } from "../../utils/api";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Grid, Stack, Typography, Divider } from "@mui/material";
import { CollectionMetada, LootboxData, NFT } from "../../utils/types";
import { MarketplaceCard } from "../../components/MarketplaceCard";
import CreatorRouter from "../../components/CreatorRouter";
import { DONT_HAVE_ANYTHING, NFTMetadataKind } from "../../utils/enum";
import { uint32ArrayToHex } from "../../utils";
import AddItemToLootboxModal from "../../components/AddItemToLootboxModal";
// @ts-ignore
import { CLPublicKey, Contracts, RuntimeArgs, CLValueBuilder, DeployUtil } from "casper-js-sdk";
import axios from "axios";
import toastr from "toastr";

const MyLootboxes = () => {
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

  const [lootboxes, setLootboxes] = useState<LootboxData[]>([]);
  const [addItemModalOpen, setAddItemModalOpen] = useState<boolean>(false);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>();
  const [selectedNFTIndex, setSelectedNFTIndex] = useState<number>(-1);
  const [selectedLootbox, setSelectedLootbox] = useState<string>();

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
      const result = await Promise.all(promises);

      const finalData: LootboxData[] = data.map((dt: LootboxData, index: number) => {
        return {
          ...dt,
          asset: result[index].asset,
          nft_collection: uint32ArrayToHex(result[index].nft_collection),
        };
      });
      // console.log(finalData);
      setLootboxes(finalData);
    };

    fetchLootboxes();
  }, []);

  useEffect(() => {
    const init = async () => {
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
      }
    };
    init();
  }, [selectedCollection]);

  const disable = useMemo(() => {
    return selectedNFTIndex == -1;
  }, [selectedNFTIndex, selectedCollection]);

  const addItem = async () => {
    try {
      if (selectedNFTIndex != -1 && selectedLootbox) {
        console.log("asdas");
        const contract = new Contracts.Contract();
        contract.setContractHash(selectedLootbox);

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
            {lootboxes?.map((ltbx: any, index: number) => (
              <div key={index}>
                <MarketplaceCard
                  key={index}
                  hash={ltbx.key.slice(0, 20)}
                  name={ltbx.name}
                  onClick={() => {
                    handleOpen(setAddItemModalOpen);
                    setSelectedCollection(ltbx.nft_collection);
                    setSelectedLootbox(ltbx.key);
                  }}
                  asset={ltbx.asset}
                ></MarketplaceCard>
                <AddItemToLootboxModal
                  lootbox={ltbx}
                  nfts={nfts}
                  open={addItemModalOpen}
                  selectedNFTIndex={selectedNFTIndex}
                  handleClose={() => handleClose(setAddItemModalOpen)}
                  handleChangeIndex={setSelectedNFTIndex}
                  addItem={addItem}
                  disable={disable}
                ></AddItemToLootboxModal>
              </div>
            ))}
          </div>
        )}
      </Stack>
    </Grid>
  );
};

export default MyLootboxes;
